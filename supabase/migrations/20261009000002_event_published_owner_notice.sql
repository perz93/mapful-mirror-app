-- Confirmation dans la boîte de réception du créateur quand son événement est
-- publié (pas de push : il vient de le publier lui-même). Une seule par événement.
create or replace function public.notify_event_owner_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_published
     and (tg_op = 'INSERT' or coalesce(old.is_published, false) = false)
     and not exists (
       select 1 from notification_log
       where event_id = new.id and user_id = new.user_id and notification_type = 'event_published'
     )
  then
    insert into notification_log (user_id, event_id, notification_type, title, body, url, image_url)
    values (
      new.user_id,
      new.id,
      'event_published',
      'Ton événement est en ligne',
      new.title || ' est visible sur la carte. Partage-le pour attirer du monde !',
      '/event/' || new.id,
      new.image_url
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_event_published_owner on public.events;
create trigger on_event_published_owner
  after insert or update of is_published on public.events
  for each row execute function public.notify_event_owner_published();
