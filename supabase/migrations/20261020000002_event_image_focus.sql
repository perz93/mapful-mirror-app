-- Partie de l'affiche montrée dans les cadres (bandeau de la carte, listes), en object-position CSS.
-- L'affiche entière reste stockée ; ex. "50% 12%".
alter table public.events add column if not exists image_focus text;
comment on column public.events.image_focus is 'Partie de l''affiche montrée dans les cadres (object-position, ex. "50% 12%")';
