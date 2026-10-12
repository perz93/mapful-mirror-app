/**
 * Échappe une valeur avant de l'insérer dans du HTML construit en chaîne
 * (popups et marqueurs Leaflet). Indispensable pour tout texte saisi par un
 * utilisateur : sinon un titre comme `<img onerror=…>` exécuterait du code
 * chez tous les visiteurs de la carte.
 */
export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** URL sûre pour un attribut src / url(...) : uniquement http(s) ou chemin relatif. */
export const safeUrl = (value: unknown, fallback: string): string => {
  const url = String(value ?? '').trim();
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url) || url.startsWith('/')) return escapeHtml(url);
  return fallback;
};
