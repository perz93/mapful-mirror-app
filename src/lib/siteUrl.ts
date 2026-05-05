// Always use the production URL for auth redirects (email links must work on mobile)
// Falls back to window.location.origin for local dev if VITE_SITE_URL is not set
export const getSiteUrl = (): string => {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};
