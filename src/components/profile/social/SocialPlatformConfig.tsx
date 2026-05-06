/**
 * Centralized social platform URL builder.
 * Handles all input formats: full URLs, @handles, plain usernames, raw numbers.
 */

type Platform = 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' | 'twitter';

const platformBases: Record<Exclude<Platform, 'whatsapp'>, string> = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  tiktok: 'https://tiktok.com',
  twitter: 'https://x.com',
};

/** Domains we recognise per platform (to strip when user pastes a full URL) */
const platformDomains: Record<Exclude<Platform, 'whatsapp'>, RegExp> = {
  facebook: /^https?:\/\/(?:www\.)?(?:facebook|fb)\.com\//i,
  instagram: /^https?:\/\/(?:www\.)?instagram\.com\//i,
  tiktok: /^https?:\/\/(?:www\.)?tiktok\.com\//i,
  twitter: /^https?:\/\/(?:www\.)?(?:twitter|x)\.com\//i,
};

/**
 * Build a clean, working URL for a given social platform.
 *
 * - **WhatsApp**: extracts digits only → `https://wa.me/{number}`
 * - **Facebook / Instagram / Twitter**: strips leading `@`, strips full URL prefix
 *   if pasted, rebuilds clean URL: `https://facebook.com/xxx`
 * - **TikTok**: same cleaning + ensures `@` prefix: `https://tiktok.com/@xxx`
 */
export function getDisplayUrl(platform: Platform, value: string): string {
  const v = value.trim();
  if (!v) return '';

  // WhatsApp: only keep digits
  if (platform === 'whatsapp') {
    return `https://wa.me/${v.replace(/[^0-9+]/g, '').replace(/^\+/, '')}`;
  }

  const base = platformBases[platform];
  const domainRe = platformDomains[platform];

  // Strip full URL prefix if user pasted the whole link
  let handle = v.replace(domainRe, '');

  // Strip leading @
  handle = handle.replace(/^@/, '');

  // Remove trailing slashes
  handle = handle.replace(/\/+$/, '');

  // TikTok needs @ in the path
  if (platform === 'tiktok') {
    return `${base}/@${handle}`;
  }

  return `${base}/${handle}`;
}

export default getDisplayUrl;
