-- Événements sur plusieurs jours et heure de fin (toutes deux facultatives)
alter table public.events
  add column if not exists end_date date,
  add column if not exists end_time time;

alter table public.events
  drop constraint if exists events_end_date_after_start;
alter table public.events
  add constraint events_end_date_after_start check (end_date is null or end_date >= date);
