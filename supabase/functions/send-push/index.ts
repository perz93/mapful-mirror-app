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

function encodeLength(len: number): Uint8Array {
  const buf = new Uint8Array(2);
  buf[0] = (len >> 8) & 0xff;
  buf[1] = len & 0xff;
  return buf;
}

async function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const info = encoder.encode(`Content-Encoding: ${type}\0`);
  return concat(
    info,
    new Uint8Array([0]),
    encodeLength(clientPublicKey.length),
    clientPublicKey,
    encodeLength(serverPublicKey.length),
    serverPublicKey
  );
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", key, salt));

  const infoKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = concat(info, new Uint8Array([1]));
  const result = new Uint8Array(await crypto.subtle.sign("HMAC", infoKey, infoWithCounter));

  return result.slice(0, length);
}

async function encryptPayload(
  clientPublicKeyStr: string,
  clientAuthStr: string,
  payload: string
): Promise<{ encrypted: Uint8Array; serverPublicKey: Uint8Array; salt: Uint8Array }> {
  const clientPublicKey = base64UrlDecode(clientPublicKeyStr);
  const clientAuth = base64UrlDecode(clientAuthStr);

  // Generate server ECDH key pair
  const serverKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeys.publicKey)
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      serverKeys.privateKey,
      256
    )
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF for auth info
  const encoder = new TextEncoder();
  const authInfo = encoder.encode("Content-Encoding: auth\0");
  const prk = await hkdf(clientAuth, sharedSecret, authInfo, 32);

  // Derive content encryption key and nonce
  const cekInfo = await createInfo("aesgcm", clientPublicKey, serverPublicKeyRaw);
  const nonceInfo = await createInfo("nonce", clientPublicKey, serverPublicKeyRaw);

  const contentEncryptionKey = await hkdf(salt, prk, cekInfo, 16);
  const nonce = await hkdf(salt, prk, nonceInfo, 12);

  // Pad and encrypt payload
  const payloadBytes = encoder.encode(payload);
  const padding = new Uint8Array(2); // 2 bytes padding length = 0
  const paddedPayload = concat(padding, payloadBytes);

  const aesKey = await crypto.subtle.importKey(
    "raw",
    contentEncryptionKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      paddedPayload
    )
  );

  return { encrypted, serverPublicKey: serverPublicKeyRaw, salt };
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
    exp: now + 86400,
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
  const { encrypted, serverPublicKey, salt } = await encryptPayload(
    sub.p256dh,
    sub.auth,
    payload
  );

  const vapidToken = await createVapidAuthHeader(
    sub.endpoint,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  const response = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      "Content-Length": String(encrypted.length),
      "TTL": "86400",
      "Crypto-Key": `dh=${base64UrlEncode(serverPublicKey)};p256ecdsa=${VAPID_PUBLIC_KEY}`,
      "Encryption": `salt=${base64UrlEncode(salt)}`,
      "Authorization": `WebPush ${vapidToken}`,
    },
    body: encrypted,
  });

  return response;
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

  try {
    const { title, body, url, image, tag, user_ids, send_to_all, check_duplicates, notification_type, event_id } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    if (!send_to_all && user_ids && user_ids.length > 0) {
      query = query.in("user_id", user_ids);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check duplicates if requested
    let alreadyNotified: Set<string> = new Set();
    if (check_duplicates && notification_type && event_id) {
      const { data: logs } = await supabase
        .from("notification_log")
        .select("user_id")
        .eq("event_id", event_id)
        .eq("notification_type", notification_type);

      if (logs) {
        for (const log of logs) {
          alreadyNotified.add(log.user_id);
        }
      }
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      image: image || undefined,
      tag: tag || "event-notification",
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const failedEndpoints: string[] = [];
    const notifiedUsers: { user_id: string; event_id: string; notification_type: string }[] = [];

    for (const sub of subscriptions) {
      // Skip if already notified
      if (check_duplicates && sub.user_id && alreadyNotified.has(sub.user_id)) {
        skipped++;
        continue;
      }

      try {
        const response = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload
        );

        if (response.status === 201 || response.status === 200) {
          sent++;
          if (notification_type && event_id && sub.user_id) {
            notifiedUsers.push({ user_id: sub.user_id, event_id, notification_type });
          }
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

    // Log notifications to prevent duplicates
    if (notifiedUsers.length > 0) {
      await supabase.from("notification_log").upsert(notifiedUsers, { onConflict: "user_id,event_id,notification_type" });
    }

    return new Response(
      JSON.stringify({ sent, failed, skipped, total: subscriptions.length }),
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
