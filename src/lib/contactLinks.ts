import { getDisplayUrl, whatsappNumber } from '@/components/profile/social/SocialPlatformConfig';

export { whatsappNumber };

export type SocialPlatform = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'twitter';

const ANDROID_PACKAGES: Record<SocialPlatform, string> = {
  whatsapp: 'com.whatsapp',
  instagram: 'com.instagram.android',
  facebook: 'com.facebook.katana',
  tiktok: 'com.zhiliaoapp.musically',
  twitter: 'com.twitter.android',
};

function handleOf(platform: Exclude<SocialPlatform, 'whatsapp'>, value: string): string {
  const url = getDisplayUrl(platform, value);
  return url.replace(/^https?:\/\/[^/]+\//, '').replace(/^@/, '');
}

/** Lien web officiel (www.) : ouvre l'app installée via les liens universels / app links. */
export function webLink(platform: SocialPlatform, value: string): string {
  if (platform === 'whatsapp') return `https://wa.me/${whatsappNumber(value)}`;
  const h = handleOf(platform, value);
  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${h}/`;
    case 'facebook': return `https://www.facebook.com/${h}`;
    case 'tiktok': return `https://www.tiktok.com/@${h}`;
    case 'twitter': return `https://x.com/${h}`;
  }
}

/** Schéma de l'app iOS quand il permet de viser un compte par son nom (sinon null). */
function iosScheme(platform: SocialPlatform, value: string): string | null {
  if (platform === 'whatsapp') return `whatsapp://send?phone=${whatsappNumber(value)}`;
  if (platform === 'instagram') return `instagram://user?username=${encodeURIComponent(handleOf(platform, value))}`;
  if (platform === 'twitter') return `twitter://user?screen_name=${encodeURIComponent(handleOf(platform, value))}`;
  return null;
}

/** Lien intent Android : ouvre l'app, sinon le navigateur (repli intégré). */
function androidIntent(platform: SocialPlatform, value: string): string {
  const web = webLink(platform, value);
  const path = platform === 'instagram'
    ? `www.instagram.com/_u/${handleOf('instagram', value)}`
    : web.replace(/^https:\/\//, '');
  return `intent://${path}#Intent;scheme=https;package=${ANDROID_PACKAGES[platform]};S.browser_fallback_url=${encodeURIComponent(web)};end`;
}

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);
const isAndroid = () => /Android/i.test(ua());
const isIOS = () =>
  /iPad|iPhone|iPod/.test(ua()) || (/Macintosh/.test(ua()) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

/**
 * Ouvre un réseau dans son application quand elle est installée.
 * - Android : lien intent (repli automatique vers le site).
 * - iOS en appli installée (PWA) : schéma de l'app, puis le site si rien ne s'ouvre.
 * - Ailleurs : le lien www. officiel (lien universel → app si installée).
 * Renvoie true si la navigation a été prise en charge (le clic par défaut doit être annulé).
 */
export function openInApp(platform: SocialPlatform, value: string): boolean {
  if (isAndroid()) {
    window.location.href = androidIntent(platform, value);
    return true;
  }
  const scheme = isIOS() && isStandalone() ? iosScheme(platform, value) : null;
  if (scheme) {
    const fallback = webLink(platform, value);
    const timer = window.setTimeout(() => {
      if (!document.hidden) window.location.href = fallback;
    }, 1200);
    const cancel = () => { if (document.hidden) window.clearTimeout(timer); };
    document.addEventListener('visibilitychange', cancel, { once: true });
    window.location.href = scheme;
    return true;
  }
  return false;
}
