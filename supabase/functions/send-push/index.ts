import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = "BJ4tt17HAf2lfvIdXqHoBH0kjDqQh-g10W2p4PMb2IxEsxrjhf-zvIItAWioxH-Bewqa_b87Mw50JPd2LHuQLf4";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const VAPID_SUBJECT = "mailto:contact@mapful.app";

// ---- Web Push Crypto (RFC 8291 / RFC 8188) ----

function base64UrlDecode(str: string): Uint8Array {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function base64UrlEncode(arr: Uint8Array): string {
  let b64 = btoa(String.fromCharCode(...arr));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((a, b) => a + b.length, 0);
  const result = new Uint8Array(len);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

// Chiffrement « aes128gcm » (RFC 8291 + RFC 8188) — seul format accepté
// par Safari/iOS ; l'ancien « aesgcm » est accepté par Apple mais jamais affiché.
async function encryptPayload(
  clientPublicKeyStr: string,
  clientAuthStr: string,
  payload: string
): Promise<Uint8Array> {
  const clientPublicKey = base64UrlDecode(clientPublicKeyStr);
  const clientAuth = base64UrlDecode(clientAuthStr);
  const encoder = new TextEncoder();

  const serverKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const serverPublicKey = new Uint8Array(await crypto.subtle.exportKey("raw", serverKeys.publicKey));

  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, serverKeys.privateKey, 256)
  );

  // IKM = HKDF(auth, ecdh, "WebPush: info" || 0 || ua_public || as_public, 32)
  const prkKey = await hmac(clientAuth, ecdhSecret);
  const keyInfo = concat(encoder.encode("WebPush: info\0"), clientPublicKey, serverPublicKey);
  const ikm = await hmac(prkKey, concat(keyInfo, new Uint8Array([1])));

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(encoder.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(encoder.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);

  // Un seul enregistrement : contenu + délimiteur 0x02
  const plaintext = concat(encoder.encode(payload), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, plaintext));

  // En-tête : salt(16) || rs(4) || idlen(1) || keyid(65)
  const rs = 4096;
  const header = concat(
    salt,
    new Uint8Array([(rs >>> 24) & 0xff, (rs >>> 16) & 0xff, (rs >>> 8) & 0xff, rs & 0xff]),
    new Uint8Array([serverPublicKey.length]),
    serverPublicKey
  );
  return concat(header, ciphertext);
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600, // Apple refuse les jetons de plus de 24 h
    sub: VAPID_SUBJECT,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import VAPID private key
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: base64UrlEncode(privateKeyBytes),
    x: base64UrlEncode(base64UrlDecode(vapidPublicKey).slice(1, 33)),
    y: base64UrlEncode(base64UrlDecode(vapidPublicKey).slice(33, 65)),
  };

  const signingKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      signingKey,
      new TextEncoder().encode(unsignedToken)
    )
  );

  // Convert DER signature to raw r||s format (64 bytes)
  let r: Uint8Array, s: Uint8Array;
  if (signature.length === 64) {
    r = signature.slice(0, 32);
    s = signature.slice(32, 64);
  } else {
    // DER encoded — parse
    let offset = 2;
    const rLen = signature[offset + 1];
    offset += 2;
    r = signature.slice(offset, offset + rLen);
    offset += rLen;
    const sLen = signature[offset + 1];
    offset += 2;
    s = signature.slice(offset, offset + sLen);
    // Pad/trim to 32 bytes
    if (r.length > 32) r = r.slice(r.length - 32);
    if (s.length > 32) s = s.slice(s.length - 32);
    if (r.length < 32) { const p = new Uint8Array(32); p.set(r, 32 - r.length); r = p; }
    if (s.length < 32) { const p = new Uint8Array(32); p.set(s, 32 - s.length); s = p; }
  }

  const rawSig = concat(r, s);
  const token = `${unsignedToken}.${base64UrlEncode(rawSig)}`;

  return token;
}

async function sendWebPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string
): Promise<Response> {
  const body = await encryptPayload(sub.p256dh, sub.auth, payload);

  const vapidToken = await createVapidAuthHeader(
    sub.endpoint,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  return await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
      "Urgency": "high",
      "Authorization": `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
    },
    body,
  });
}

// Appels serveur uniquement : le jeton doit être une clé « service_role ».
// La passerelle Supabase (verify_jwt) a déjà vérifié la signature du JWT ;
// on contrôle ici son rôle (plusieurs clés service_role valides peuvent
// coexister : celle du déclencheur SQL et celle de l'environnement).
function isServiceRole(req: Request): boolean {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  if (SUPABASE_SERVICE_ROLE_KEY && token === SUPABASE_SERVICE_ROLE_KEY) return true;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "="));
    return JSON.parse(json).role === "service_role";
  } catch {
    return false;
  }
}

// ---- Textes des notifications (une seule source pour toutes les notifications d'événement) ----
// Titre court sur une ligne, pas d'emoji (sur iPhone, seul le logo de l'app s'affiche),
// et une icône de l'app (catégorie, calendrier, horloge…) montrée par Android.

const CATEGORY_NEW: Record<string, string> = {
  music: "Nouveau concert", nightlife: "Nouvelle soirée", festivals: "Nouveau festival",
  shows: "Nouveau spectacle", brunch: "Nouveau brunch", exhibitions: "Nouvelle expo",
  conferences: "Nouvelle conférence", workshops: "Nouvel atelier", sports: "Nouvel événement sportif",
  family: "Nouvelle sortie en famille", religious: "Nouvel événement", other: "Nouvel événement",
};
const LEGACY_CATEGORY: Record<string, string> = { meetups: "conferences", food: "brunch", arts: "exhibitions" };

const softCase = (text: string) => {
  const out = (text || "").replace(/\p{L}[\p{L}'’-]*/gu, (w) =>
    w.length > 1 && w === w.toLocaleUpperCase("fr") && w !== w.toLocaleLowerCase("fr") ? w.toLocaleLowerCase("fr") : w);
  return out.charAt(0).toLocaleUpperCase("fr") + out.slice(1);
};
const oneLine = (text: string, max = 30) => (text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text);
const frDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace(/^./, (c) => c.toUpperCase());
const frTime = (t?: string | null) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${Number(h)}h${m && m !== "00" ? m : ""}`;
};
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

type EventRow = {
  id: string; title: string; category: string | null; venue: string | null; date: string; time: string | null;
  price: number | null; is_paid: boolean | null; ticket_types: unknown; image_url: string | null;
};

function priceText(e: EventRow): string {
  const types = Array.isArray(e.ticket_types)
    ? (e.ticket_types as { name?: string; price?: number }[]).filter((t) => t?.name).map((t) => Math.max(0, Number(t.price) || 0))
    : [];
  if (types.length > 1) {
    const paid = types.filter((p) => p > 0);
    if (!paid.length) return "Entrée gratuite";
    const min = Math.min(...types);
    return min === 0 ? `Gratuit à ${fcfa(Math.max(...paid))}` : `Dès ${fcfa(min)}`;
  }
  const p = types.length === 1 ? types[0] : e.is_paid && e.price ? Number(e.price) : 0;
  return p > 0 ? fcfa(p) : "Entrée gratuite";
}

// deno-lint-ignore no-explicit-any
async function formatEventNotification(supabase: any, type: string, eventId: string) {
  const { data: e } = await supabase
    .from("events")
    .select("id, title, category, venue, date, time, price, is_paid, ticket_types, image_url")
    .eq("id", eventId)
    .maybeSingle();
  if (!e) return null;
  const ev = e as EventRow;
  const name = softCase(ev.title);
  const venue = softCase(ev.venue || "");
  const when = `${frDate(ev.date)}${ev.time ? ` à ${frTime(ev.time)}` : ""}`;
  const category = LEGACY_CATEGORY[ev.category || ""] || ev.category || "other";
  const price = priceText(ev);

  switch (type) {
    case "new_event":
      return {
        title: oneLine(name),
        body: `${CATEGORY_NEW[category] || "Nouvel événement"} · ${when}${venue ? ` · ${venue}` : ""}. ${price}${price === "Entrée gratuite" ? " — ne le rate pas !" : " — réserve ta place !"}`,
        icon: `/notif/${CATEGORY_NEW[category] ? category : "other"}.png`,
        image: ev.image_url,
      };
    case "event_tomorrow":
      return {
        title: "C'est demain !",
        body: `${name}${ev.time ? ` · ${frTime(ev.time)}` : ""}${venue ? ` · ${venue}` : ""}. Prépare-toi !`,
        icon: "/notif/calendar.png",
        image: ev.image_url,
      };
    case "event_starting":
    case "event_reminder":
      return {
        title: "Ça commence dans 1 h",
        body: `${name}${venue ? ` · ${venue}` : ""}. Il est temps de te mettre en route !`,
        icon: type === "event_reminder" ? "/notif/bell.png" : "/notif/clock.png",
        image: ev.image_url,
      };
    default:
      return null;
  }
}

// ---- Main handler ----

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Seuls les appels serveur (cron, trigger, notify-events) avec la clé
  // service_role peuvent déclencher des envois — sinon n'importe qui
  // pourrait spammer tous les abonnés.
  if (!isServiceRole(req)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const input = await req.json();
    const { url, tag, user_ids, send_to_all, exclude_user_id, check_duplicates, notification_type, event_id } = input;
    let { title, body, image } = input;
    let icon: string | undefined = input.icon;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Notification d'événement : textes et icône construits ici, au même format partout
    if (event_id && notification_type) {
      const formatted = await formatEventNotification(supabase, notification_type, event_id);
      if (formatted) {
        title = formatted.title;
        body = formatted.body;
        icon = formatted.icon;
        image = image || formatted.image;
      }
    }

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Destinataires (personnes, pas appareils)
    // Sans destinataires explicites et sans send_to_all : on n'envoie à
    // personne (avant, cela partait à TOUS les abonnés).
    let audience: string[] = [];
    if (send_to_all) {
      const { data: profiles, error } = await supabase.from("profiles").select("id");
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      audience = (profiles ?? []).map((p: { id: string }) => p.id);
    } else if (Array.isArray(user_ids)) {
      audience = user_ids.filter((id: unknown): id is string => typeof id === "string");
    }
    // L'organisateur n'est pas notifié de son propre événement
    if (exclude_user_id) audience = audience.filter((id) => id !== exclude_user_id);
    audience = [...new Set(audience)];

    // 2. Anti-doublon : on retire ceux qui ont déjà reçu cette notification
    let skipped = 0;
    if (check_duplicates && notification_type && event_id && audience.length > 0) {
      const { data: logs } = await supabase
        .from("notification_log")
        .select("user_id")
        .eq("event_id", event_id)
        .eq("notification_type", notification_type);
      const already = new Set((logs ?? []).map((l: { user_id: string }) => l.user_id));
      const before = audience.length;
      audience = audience.filter((id) => !already.has(id));
      skipped = before - audience.length;
    }

    if (audience.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped, reason: "no recipients" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Boîte de réception de l'app : une ligne par personne, AVANT l'envoi.
    // Elle apparaît même sans notifications activées, et marque la personne
    // comme notifiée (le cron et le déclencheur ne la renverront pas).
    if (notification_type) {
      const rows = audience.map((user_id) => ({
        user_id,
        event_id: event_id ?? null,
        notification_type,
        title,
        body,
        url: url || "/",
        image_url: image || null,
      }));
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase
          .from("notification_log")
          .upsert(rows.slice(i, i + 500), { onConflict: "user_id,event_id,notification_type", ignoreDuplicates: true });
        if (error) console.error(`notification_log: ${error.message}`);
      }
    }

    // 4. Appareils abonnés de ces personnes
    const audienceSet = new Set(audience);
    const subscriptions: { endpoint: string; p256dh: string; auth: string; user_id: string }[] = [];
    if (send_to_all) {
      const { data, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth, user_id");
      if (error) console.error(`push_subscriptions: ${error.message}`);
      for (const s of data ?? []) if (audienceSet.has(s.user_id)) subscriptions.push(s);
    } else {
      for (let i = 0; i < audience.length; i += 100) {
        const { data, error } = await supabase
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth, user_id")
          .in("user_id", audience.slice(i, i + 100));
        if (error) console.error(`push_subscriptions: ${error.message}`);
        subscriptions.push(...(data ?? []));
      }
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      image: image || undefined,
      icon: icon || undefined,
      tag: tag || "event-notification",
    });

    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const response = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload
        );

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 404 || response.status === 410) {
          failedEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed: ${response.status} ${await response.text()}`);
          failed++;
        }
      } catch (err) {
        console.error(`Push error: ${err}`);
        failed++;
      }
    }

    // Clean up expired subscriptions
    if (failedEndpoints.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", failedEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, skipped, recipients: audience.length, total: subscriptions.length }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
