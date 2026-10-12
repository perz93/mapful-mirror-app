-- Nouvelles catégories du Marketplace (les annonces existantes ne changent pas).
-- À exécuter dans Supabase (SQL Editor) AVANT de déployer le site.
ALTER TYPE public.marketplace_category ADD VALUE IF NOT EXISTS 'materiel';
ALTER TYPE public.marketplace_category ADD VALUE IF NOT EXISTS 'photo_video';
ALTER TYPE public.marketplace_category ADD VALUE IF NOT EXISTS 'beaute_tenues';
