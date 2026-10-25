/**
 * Routing Middleware Vercel : SEO et aperçus de partage.
 *
 * - /event/:id et /listing/:id : renvoie l'app (index.html) avec titre,
 *   description, image et données structurées propres à la fiche, pour que
 *   WhatsApp, Facebook et Google voient le vrai contenu sans exécuter le JS.
 * - /sitemap.xml : plan du site généré depuis les fiches publiées.
 *
 * En cas d'échec (fiche introuvable, Supabase indisponible), on sert
 * index.html tel quel : l'app s'affiche normalement.
 */

export const config = {
  matcher: ['/event/:id', '/listing/:id', '/sitemap.xml'],
};

const SITE = 'https://upvibe.app';
// Clé publique (anon) : lecture limitée par les règles RLS aux fiches publiées
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dnljwlkfzhvxsjelmqcr.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const ID = /^[0-9a-f-]{36}$/i;

const CATEGORY_LABEL: Record<string, string> = {
  nightlife: 'Soirée', music: 'Concert', festivals: 'Festival', shows: 'Spectacle',
  brunch: 'Brunch', exhibitions: 'Expo', conferences: 'Business', workshops: 'Atelier',
  sports: 'Sport', family: 'Famille', religious: 'Religieux', other: 'Événement',
};

const STATIC_PAGES = [
  '/', '/evenements', '/soirees', '/concerts', '/festivals', '/shows', '/brunch', '/exhibitions',
  '/conferences', '/workshops', '/sports', '/famille', '/religious', '/autres', '/marketplace',
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clip = (s: string, n: number) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

// Mots saisis EN MAJUSCULES → minuscules (même règle que src/lib/softCase.ts)
const softCase = (text: string) => {
  const out = text.trim().replace(/\p{L}[\p{L}'’-]*/gu, (word) =>
    word.length > 1 && word === word.toLocaleUpperCase('fr') && word !== word.toLocaleLowerCase('fr')
      ? word.toLocaleLowerCase('fr')
      : word,
  );
  return out.charAt(0).toLocaleUpperCase('fr') + out.slice(1);
};

const supabase = async <T>(path: string): Promise<T | null> => {
  if (!SUPABASE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
};

const frDate = (date: string, time?: string | null) => {
  const d = new Date(`${date}T12:00:00Z`);
  const day = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' });
  if (!time) return day;
  const [h, m] = time.split(':');
  return `${day} à ${Number(h)}h${m !== '00' ? m : ''}`;
};

interface Meta {
  title: string;
  description: string;
  image?: string | null;
  url: string;
  jsonLd?: Record<string, unknown>;
}

/** Remplace les balises du <head> d'index.html par celles de la fiche */
const withMeta = (html: string, m: Meta) => {
  const title = esc(m.title);
  const desc = esc(m.description);
  const set = (attr: string, name: string, value: string) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
    html = re.test(html)
      ? html.replace(re, `$1${value}$2`)
      : html.replace('</head>', `    <meta ${attr}="${name}" content="${value}" />\n  </head>`);
  };
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  set('name', 'description', desc);
  set('property', 'og:title', title);
  set('property', 'og:description', desc);
  set('property', 'og:url', esc(m.url));
  set('property', 'og:type', 'article');
  set('name', 'twitter:title', title);
  set('name', 'twitter:description', desc);
  if (m.image) {
    const img = esc(m.image);
    set('property', 'og:image', img);
    set('name', 'twitter:image', img);
    set('property', 'og:image:alt', title);
    // Dimensions de l'image par défaut : fausses pour la photo de la fiche
    html = html.replace(/\s*<meta property="og:image:(width|height)" content="[^"]*" \/>/g, '');
  }
  html = html.replace('</head>', `    <link rel="canonical" href="${esc(m.url)}" />\n  </head>`);
  if (m.jsonLd) {
    const json = JSON.stringify(m.jsonLd).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script type="application/ld+json">${json}</script>\n  </head>`);
  }
  return html;
};

interface EventRow {
  id: string; title: string; description: string | null; category: string | null;
  venue: string | null; address: string | null; city: string | null;
  date: string; time: string | null; end_date: string | null; end_time: string | null;
  image_url: string | null; price: number | null; is_paid: boolean | null;
  ticket_types: { name: string; price: number }[] | null;
  created_at: string; user_id: string;
}

const eventMeta = async (id: string, url: string): Promise<Meta | null> => {
  const rows = await supabase<EventRow[]>(
    `events?id=eq.${id}&is_published=eq.true&select=id,title,description,category,venue,address,city,date,time,end_date,end_time,image_url,price,is_paid,ticket_types,created_at,user_id&limit=1`,
  );
  const e = rows?.[0];
  if (!e) return null;
  // Organisateur : nom de son profil (sert d'« artiste » si rien de plus précis)
  const owner = (await supabase<{ full_name: string | null }[]>(`rpc/get_public_profile?p_user_id=${e.user_id}`))?.[0];
  const organizerName = owner?.full_name?.trim() || 'Upvibe';
  const name = softCase(e.title);
  const label = CATEGORY_LABEL[e.category ?? ''] ?? 'Événement';
  const when = frDate(e.date, e.time);
  const venue = e.venue?.split(',')[0]?.trim() ?? '';
  const prices = (e.ticket_types ?? []).map((t) => Number(t.price)).filter((p) => p >= 0);
  const minPrice = prices.length ? Math.min(...prices) : Number(e.price ?? 0);
  const priceText = !e.is_paid || !minPrice ? 'Gratuit' : `dès ${minPrice.toLocaleString('fr-FR')} FCFA`;
  const intro = `${label} · ${when}${venue ? ` · ${venue}` : ''} · ${priceText}.`;
  const iso = (d: string, t: string | null) => (t ? `${d}T${t.slice(0, 5)}:00+00:00` : d);
  // Fin : celle saisie, sinon 6 h après le début (même règle que l'app), sinon la journée
  const endDate = (() => {
    if (e.end_date || e.end_time) return iso(e.end_date ?? e.date, e.end_time);
    if (!e.time) return e.date;
    const end = new Date(`${e.date}T${e.time.slice(0, 5)}:00Z`);
    end.setUTCHours(end.getUTCHours() + 6);
    return end.toISOString().replace('.000Z', '+00:00');
  })();

  return {
    title: `${name} — ${when}${venue ? `, ${venue}` : ''} | Upvibe`,
    description: clip(`${intro} ${e.description ?? ''}`, 200),
    image: e.image_url,
    url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name,
      description: clip(e.description ?? intro, 500),
      startDate: iso(e.date, e.time),
      endDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: e.venue ?? 'Abidjan',
        address: {
          '@type': 'PostalAddress',
          streetAddress: e.address ?? e.venue ?? '',
          addressLocality: e.city ?? 'Abidjan',
          addressCountry: 'CI',
        },
      },
      ...(e.image_url ? { image: [e.image_url] } : {}),
      offers: {
        '@type': 'Offer',
        url,
        price: e.is_paid ? minPrice : 0,
        priceCurrency: 'XOF',
        availability: 'https://schema.org/InStock',
        validFrom: e.created_at,
      },
      performer: { '@type': 'PerformingGroup', name: organizerName },
      organizer: { '@type': 'Organization', name: organizerName, url },
    },
  };
};

interface ListingRow {
  id: string; title: string; description: string | null; image_url: string | null;
  location: string | null; price: number | null; price_type: string | null;
}

const listingMeta = async (id: string, url: string): Promise<Meta | null> => {
  const rows = await supabase<ListingRow[]>(
    `marketplace_listings?id=eq.${id}&is_published=eq.true&select=id,title,description,image_url,location,price,price_type&limit=1`,
  );
  const l = rows?.[0];
  if (!l) return null;
  const name = softCase(l.title);
  const where = l.location?.split(',')[0]?.trim() || 'Abidjan';
  return {
    title: `${name} — ${where} | Upvibe`,
    description: clip(`Prestataire à ${where}. ${l.description ?? ''}`, 200),
    image: l.image_url,
    url,
  };
};

const sitemap = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const [events, listings] = await Promise.all([
    supabase<{ id: string; updated_at: string }[]>(`events?is_published=eq.true&date=gte.${today}&select=id,updated_at&order=date.asc&limit=2000`),
    supabase<{ id: string; updated_at: string }[]>('marketplace_listings?is_published=eq.true&select=id,updated_at&order=updated_at.desc&limit=2000'),
  ]);
  const entry = (loc: string, lastmod?: string) =>
    `  <url><loc>${SITE}${loc}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`;
  const urls = [
    ...STATIC_PAGES.map((p) => entry(p)),
    ...(events ?? []).map((e) => entry(`/event/${e.id}`, e.updated_at)),
    ...(listings ?? []).map((l) => entry(`/listing/${l.id}`, l.updated_at)),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } },
  );
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  if (url.pathname === '/sitemap.xml') return sitemap();

  const shell = await fetch(new URL('/index.html', url));
  let html = await shell.text();
  const [, kind, id] = url.pathname.split('/');
  if (ID.test(id ?? '')) {
    try {
      const canonical = `${SITE}/${kind}/${id}`;
      const meta = kind === 'event' ? await eventMeta(id, canonical) : await listingMeta(id, canonical);
      if (meta) html = withMeta(html, meta);
    } catch {
      // On sert l'app telle quelle
    }
  }
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      // Mêmes en-têtes de sécurité que vercel.json (réponse générée ici)
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), camera=(), microphone=(), payment=()',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
    },
  });
}
