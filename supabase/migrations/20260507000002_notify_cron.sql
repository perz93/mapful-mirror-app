-- Enable pg_cron and pg_net extensions for scheduled notifications
-- Note: These must be enabled in the Supabase dashboard under Extensions
-- pg_cron: for scheduling recurring tasks
-- pg_net: for making HTTP requests from PostgreSQL

-- Schedule notify-events edge function every 30 minutes
-- This needs to be run manually in the SQL editor after enabling extensions:
--
-- SELECT cron.schedule(
--   'notify-events-cron',
--   '*/30 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://dnljwlkfzhvxsjelmqcr.supabase.co/functions/v1/notify-events',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- Also notify on new event creation via trigger
CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for published events
  IF NEW.is_published = true AND (OLD IS NULL OR OLD.is_published = false) THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'title', 'Nouvel event: ' || NEW.title,
        'body', NEW.venue || ' — ' || NEW.category,
        'url', '/event/' || NEW.id,
        'image', NEW.image_url,
        'tag', 'new-' || NEW.id,
        'send_to_all', true,
        'check_duplicates', true,
        'notification_type', 'new_event',
        'event_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (only if net extension is available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    DROP TRIGGER IF EXISTS on_event_published ON public.events;
    CREATE TRIGGER on_event_published
      AFTER INSERT OR UPDATE OF is_published ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_event();
  END IF;
END
$$;
