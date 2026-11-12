-- Fonctions de déclencheur : elles ne doivent pas être appelables par l'API
-- (rôles anon / authenticated). Les déclencheurs continuent de fonctionner.
revoke execute on function public.limit_publications() from public, anon, authenticated;
revoke execute on function public.notify_listing_owner_published() from public, anon, authenticated;
