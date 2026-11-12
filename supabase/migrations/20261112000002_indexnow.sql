-- IndexNow : prévient Bing (et Yandex, Seznam, Naver…) dès qu'un événement
-- ou une annonce est publié, pour une indexation rapide.
-- La clé publique est servie par le site : https://upvibe.app/4d024a81cebcf6097bbd7a6da6501631.txt

CREATE OR REPLACE FUNCTION public.indexnow_submit(urls text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF urls IS NULL OR array_length(urls, 1) IS NULL THEN RETURN; END IF;
  PERFORM net.http_post(
    url := 'https://api.indexnow.org/indexnow',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'host', 'upvibe.app',
      'key', '4d024a81cebcf6097bbd7a6da6501631',
      'keyLocation', 'https://upvibe.app/4d024a81cebcf6097bbd7a6da6501631.txt',
      'urlList', to_jsonb(urls)
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Ne jamais bloquer une publication à cause d'IndexNow
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.indexnow_on_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_published AND (TG_OP = 'INSERT' OR NOT COALESCE(OLD.is_published, false)) THEN
    PERFORM public.indexnow_submit(ARRAY[
      'https://upvibe.app/' || CASE WHEN TG_TABLE_NAME = 'events' THEN 'event' ELSE 'listing' END || '/' || NEW.id
    ]);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.indexnow_submit(text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.indexnow_on_publish() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS indexnow_events ON public.events;
CREATE TRIGGER indexnow_events
  AFTER INSERT OR UPDATE OF is_published ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.indexnow_on_publish();

DROP TRIGGER IF EXISTS indexnow_listings ON public.marketplace_listings;
CREATE TRIGGER indexnow_listings
  AFTER INSERT OR UPDATE OF is_published ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.indexnow_on_publish();
