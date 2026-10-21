-- Audit sécurité / performance (21 oct. 2026)

-- 1. La clé service_role n'est plus écrite dans le code : elle est lue dans le coffre (Vault).
--    (La clé a été copiée dans vault.secrets sous le nom « service_role_key » directement en base,
--     sans jamais apparaître en clair dans un fichier.)
create or replace function public.notify_new_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_key text;
begin
  if new.is_published = true and (tg_op = 'INSERT' or coalesce(old.is_published, false) = false) then
    select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key' limit 1;
    if v_key is null then
      return new;
    end if;
    perform net.http_post(
      url := 'https://dnljwlkfzhvxsjelmqcr.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
      body := jsonb_build_object(
        'title', new.title, 'body', coalesce(new.venue, ''), 'url', '/event/' || new.id,
        'image', new.image_url, 'tag', 'new-' || new.id, 'send_to_all', true,
        'exclude_user_id', new.user_id, 'check_duplicates', true,
        'notification_type', 'new_event', 'event_id', new.id
      )
    );
  end if;
  return new;
end;
$$;
-- Le cron « notify-events-cron » lit aussi la clé dans le Vault (cron.alter_job).

-- 2. Abonnements push : plus d'abonnement anonyme, désabonnement limité à son appareil
alter policy "Users can create push subscriptions" on public.push_subscriptions with check ((select auth.uid()) = user_id);
alter policy "Anyone can insert push sub" on public.push_subscriptions with check ((select auth.uid()) = user_id);
alter policy "Service role can read all push subscriptions" on public.push_subscriptions using (false);
create or replace function public.remove_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and (user_id is null or user_id = auth.uid());
$$;

-- 3. RLS : auth.uid() évalué une fois par requête — voir les « alter policy … (select auth.uid()) »
--    appliqués sur events, event_favorites, marketplace_listings, notification_log,
--    event_reminders, profiles, event_attendees, user_friends, push_subscriptions.

-- 4. Anti-abus : 10 publications (événements ou annonces) par compte et par 24 h
create or replace function public.limit_publications()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_count int; v_max int := 10;
begin
  if tg_table_name = 'events' then
    select count(*) into v_count from public.events where user_id = new.user_id and created_at > now() - interval '24 hours';
  else
    select count(*) into v_count from public.marketplace_listings where user_id = new.user_id and created_at > now() - interval '24 hours';
  end if;
  if v_count >= v_max then
    raise exception 'Limite atteinte : % publications par 24 h. Réessaie plus tard.', v_max using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger limit_event_publications before insert on public.events for each row execute function public.limit_publications();
create trigger limit_listing_publications before insert on public.marketplace_listings for each row execute function public.limit_publications();

-- 5. Tailles maximales
alter table public.events add constraint events_venue_length check (venue is null or char_length(venue) <= 300) not valid;
alter table public.events add constraint events_ticket_types_shape check (
  ticket_types is null or (jsonb_typeof(ticket_types) = 'array' and jsonb_array_length(ticket_types) <= 10 and pg_column_size(ticket_types) <= 4000)
) not valid;
alter table public.events add constraint events_image_focus_format check (image_focus is null or image_focus ~ '^\d{1,3}% \d{1,3}%$') not valid;

-- 6. Index + purge de la boîte de réception (90 jours)
create index if not exists idx_notification_log_event_id on public.notification_log (event_id);
create index if not exists idx_event_reminders_event_id on public.event_reminders (event_id);
create index if not exists idx_event_attendees_user_id on public.event_attendees (user_id);
create index if not exists idx_events_published_date on public.events (is_published, date);
create index if not exists idx_notification_log_user_created on public.notification_log (user_id, created_at desc);
select cron.schedule('purge-notification-log', '17 3 * * *',
  $$ delete from public.notification_log where created_at < now() - interval '90 days' $$);
