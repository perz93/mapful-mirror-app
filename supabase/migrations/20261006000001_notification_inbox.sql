-- Boîte de réception (section Notifications de l'app)
-- 1. Rafraîchissement en direct : la table doit être publiée pour Realtime.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notification_log') then
    alter publication supabase_realtime add table public.notification_log;
  end if;
end $$;

-- 2. Le déclencheur on_event_published (fonction notify_new_event, qui contient
-- la clé serveur et n'est donc pas versionnée ici) transmet désormais
-- 'exclude_user_id', NEW.user_id à send-push : l'organisateur n'est pas
-- notifié de son propre événement.
