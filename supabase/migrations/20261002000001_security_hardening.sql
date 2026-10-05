-- =====================================================================
-- Durcissement sécurité avant mise en production
-- À exécuter une fois dans Supabase (SQL Editor ou `supabase db push`).
-- Idempotent : peut être relancé sans erreur.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Profils : l'email de tous les utilisateurs était lisible par n'importe
--    qui (politique SELECT USING (true)). Aucun écran de l'app ne lit le
--    profil d'un autre utilisateur : on limite la lecture à son propre profil.
--    (Les fonctions serveur utilisent la clé service_role et ne sont pas
--    concernées par RLS.)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. Rappels : la politique « Service role can read all reminders » utilisait
--    USING (true), ce qui ouvrait en réalité la lecture à TOUT LE MONDE.
--    La clé service_role contourne déjà RLS : cette politique est inutile.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can read all reminders" ON public.event_reminders;

-- ---------------------------------------------------------------------
-- 3. Abonnements push : n'importe qui pouvait modifier un abonnement sans
--    propriétaire (user_id IS NULL), et un upsert côté client échouait dès
--    que l'appareil avait été abonné par un autre compte / hors connexion.
--    On passe par deux fonctions sécurisées : connaître l'endpoint (secret,
--    impossible à deviner) prouve que l'on est sur l'appareil concerné.
--    L'abonnement est rattaché au compte connecté (ou détaché à la
--    déconnexion), ce qui permet les rappels personnels.
-- ---------------------------------------------------------------------
-- Le déclencheur update_push_subscriptions_updated_at écrit updated_at, mais la
-- colonne n'existait pas : toute mise à jour d'un abonnement échouait.
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Politiques trop permissives (lignes sans propriétaire lisibles / modifiables par tous)
DROP POLICY IF EXISTS "Anyone can insert push sub" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subs" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint TEXT, p_p256dh TEXT, p_auth TEXT
) RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth)
  VALUES (auth.uid(), p_endpoint, p_p256dh, p_auth)
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = auth.uid(), p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth;
$$;

CREATE OR REPLACE FUNCTION public.remove_push_subscription(p_endpoint TEXT)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint;
$$;

REVOKE ALL ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_push_subscription(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_push_subscription(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Stockage : limiter chaque utilisateur à SON dossier (`<user_id>/…`),
--    aux images, et à 5 Mo. L'app envoie déjà tous les fichiers dans
--    `<user_id>/` : aucun changement côté client.
-- ---------------------------------------------------------------------
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
WHERE id IN ('event-images', 'avatars', 'listing-images');

-- Anciennes politiques trop permissives (envoi n'importe où)
DROP POLICY IF EXISTS "Auth users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload listing images" ON storage.objects;

-- Politiques strictes, recréées proprement
DROP POLICY IF EXISTS "Users can upload their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own files: insert" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own files: update" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own files: delete" ON storage.objects;

CREATE POLICY "Users manage own files: insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('event-images', 'avatars', 'listing-images')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users manage own files: update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('event-images', 'avatars', 'listing-images')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users manage own files: delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('event-images', 'avatars', 'listing-images')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- 5. Garde-fous sur les contenus (anti-abus basique, côté serveur)
-- ---------------------------------------------------------------------
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_title_length,
  ADD CONSTRAINT events_title_length CHECK (char_length(title) BETWEEN 2 AND 120) NOT VALID;

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_description_length,
  ADD CONSTRAINT events_description_length CHECK (description IS NULL OR char_length(description) <= 5000) NOT VALID;

ALTER TABLE public.marketplace_listings
  DROP CONSTRAINT IF EXISTS listings_title_length,
  ADD CONSTRAINT listings_title_length CHECK (char_length(title) BETWEEN 2 AND 120) NOT VALID;

-- ---------------------------------------------------------------------
-- 6. Notification « nouvel événement » : la fonction notify_new_event en place
--    fonctionne ; on ne la remplace pas ici. (Elle contient la clé service_role
--    en clair : à déplacer dans le Vault après rotation de la clé.)
-- ---------------------------------------------------------------------
