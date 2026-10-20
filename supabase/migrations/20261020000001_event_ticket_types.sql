-- Plusieurs types de places par événement (Standard, VIP, Table…)
-- Format : [{"name":"VIP","price":15000}, ...] ; la colonne price garde le moins cher.
alter table public.events add column if not exists ticket_types jsonb;
comment on column public.events.ticket_types is 'Types de places : [{"name":"VIP","price":15000}, ...] ; price = le moins cher';
