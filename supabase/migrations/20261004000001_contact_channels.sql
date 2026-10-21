-- Canaux de contact identiques pour les événements et les annonces :
-- email sur les événements, réseaux sociaux sur les annonces.
alter table public.events add column if not exists contact_email text;
alter table public.events add column if not exists contact_tiktok text;

alter table public.marketplace_listings add column if not exists contact_whatsapp text;
alter table public.marketplace_listings add column if not exists contact_instagram text;
alter table public.marketplace_listings add column if not exists contact_facebook text;
alter table public.marketplace_listings add column if not exists contact_tiktok text;
alter table public.marketplace_listings add column if not exists contact_twitter text;

notify pgrst, 'reload schema';
