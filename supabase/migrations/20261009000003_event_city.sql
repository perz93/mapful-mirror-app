-- Ville / localité de l'événement, déterminée à la création (géocodage inverse).
-- Sans valeur, l'app la déduit des coordonnées (lib/cities).
alter table public.events add column if not exists city text;
