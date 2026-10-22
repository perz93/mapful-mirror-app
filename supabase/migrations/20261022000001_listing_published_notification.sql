-- Annonce Marketplace publiée : le propriétaire reçoit « Ton annonce est en ligne »
-- (boîte de réception + notification push), comme pour les événements.
create or replace function public.notify_listing_owner_published()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_key text;
  v_url text := '/listing/' || new.id;
  v_title text := 'Ton annonce est en ligne';
  v_body text := trim(new.title) || ' est visible dans le Marketplace. Partage-la pour trouver des clients !';
begin
  if new.is_published
     and (tg_op = 'INSERT' or coalesce(old.is_published, false) = false)
     and not exists (
       select 1 from notification_log
       where user_id = new.user_id and notification_type = 'listing_published' and url = v_url
     )
  then
    select decrypted_secret into v_key from vault.decrypted_secrets where name = 'service_role_key' limit 1;
    if v_key is null then
      -- Pas de clé : au moins la boîte de réception de l'app
      insert into notification_log (user_id, notification_type, title, body, url, image_url)
      values (new.user_id, 'listing_published', v_title, v_body, v_url, new.image_url);
      return new;
    end if;
    -- send-push écrit la ligne de la boîte de réception puis envoie la notification au propriétaire
    perform net.http_post(
      url := 'https://dnljwlkfzhvxsjelmqcr.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
      body := jsonb_build_object(
        'title', v_title,
        'body', v_body,
        'url', v_url,
        'image', new.image_url,
        'icon', '/notif/bell.png',
        'tag', 'listing-' || new.id,
        'user_ids', jsonb_build_array(new.user_id),
        'notification_type', 'listing_published'
      )
    );
  end if;
  return new;
end;
$function$;

drop trigger if exists on_listing_published_owner on public.marketplace_listings;
create trigger on_listing_published_owner
  after insert or update of is_published on public.marketplace_listings
  for each row execute function public.notify_listing_owner_published();
