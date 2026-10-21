-- Regroupement des catégories d'événements (facultatif : le site gère déjà
-- les anciennes clés, ceci nettoie simplement les données).
UPDATE public.events SET category = 'conferences' WHERE category = 'meetups';
UPDATE public.events SET category = 'brunch' WHERE category = 'food';
UPDATE public.events SET category = 'exhibitions' WHERE category = 'arts';
