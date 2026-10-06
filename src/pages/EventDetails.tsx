import { useState, useEffect, useCallback } from 'react';
import { useDarkPageBackground } from '@/hooks/useDarkPageBackground';
import { ArrowLeft, MapPin, Share2, Heart, Bell, BellRing } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/PillToast';
import ContactFab from '@/components/ContactFab';
import ImageLightbox from '@/components/ImageLightbox';
import { EventDetailsSkeleton } from '@/components/PageSkeleton';
import ShimmerImage from '@/components/ShimmerImage';
import { useFavorite } from '@/hooks/useFavorite';
import { useAuth } from '@/contexts/AuthContext';
import { getEventCategory } from '@/lib/eventCategories';
import { useSearch } from '@/contexts/SearchContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { eventStatus, splitLead } from '@/lib/eventStatus';


const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { setRouteDestination } = useSearch();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Event not found');

      return data;
    },
    enabled: !!id,
  });

  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorite(id || '');
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, subscribe: subscribePush } = useNotifications();

  useDarkPageBackground(!!event);

  // Check if reminder already set (from Supabase)
  useEffect(() => {
    if (!id || !user) return;
    const checkReminder = async () => {
      const { data } = await supabase
        .from('event_reminders' as any)
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setReminderSet(!!data);
    };
    checkReminder();
  }, [id, user]);

  const toggleReminder = useCallback(async () => {
    if (!id || !event || !user) return;

    if (reminderSet) {
      await supabase
        .from('event_reminders' as any)
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);
      setReminderSet(false);
      toast.success(t('reminder.removed'));
      return;
    }

    // Un rappel n'arrive que si cet appareil est abonné aux notifications push
    if (pushSupported && !pushSubscribed) {
      const ok = await subscribePush();
      if (!ok) {
        toast.info(t('reminder.enableNotif'));
        return;
      }
    }

    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const reminderTime = new Date(eventDateTime.getTime() - 60 * 60 * 1000);

    await supabase
      .from('event_reminders' as any)
      .upsert({
        user_id: user.id,
        event_id: id,
        remind_at: reminderTime.toISOString(),
      }, { onConflict: 'user_id,event_id' });

    setReminderSet(true);
    toast.success(t('reminder.set'));
  }, [id, event, reminderSet, user, pushSupported, pushSubscribed, subscribePush, t]);

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">{t('event.notFound')}</p>
          <Link to="/">
            <Button>{t('event.backHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const locale = lang === 'fr' ? fr : enUS;
  const eventDate = new Date(`${event.date}T00:00:00`);
  const formattedDate = format(eventDate, "EEEE d MMMM yyyy", { locale });
  const formattedTime = event.time.substring(0, 5);
  const showAddress = !!event.address && event.address.trim().toLowerCase() !== event.venue.trim().toLowerCase();
  const keyPoints = event.key_points as string[] | null;
  const category = getEventCategory(event.category);
  const status = eventStatus(event.date, event.time);
  // Itinéraire tracé dans l'app, sur la carte (même fonction que le bouton des popups)
  const showRoute = () => {
    setRouteDestination({ lat: Number(event.latitude), lng: Number(event.longitude), label: event.title });
    navigate('/');
  };
  const contactTiktok = event.contact_tiktok;
  const hasContacts = !!(event.contact_phone || event.contact_whatsapp || event.contact_instagram || event.contact_facebook || contactTiktok || event.contact_twitter || event.contact_email);
  const priceLabel = event.is_paid && event.price
    ? <>{Number(event.price).toLocaleString('fr-FR')} <span className="text-lime text-base tracking-tight">FCFA</span></>
    : t('event.free');

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, text: `${event.title} — ${formattedDate} · ${event.venue}`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('event.share'));
    }
  };

  const roundBtn = 'flex size-12 btn-float items-center justify-center rounded-full transition-colors active:scale-95';

  return (
    <div className="min-h-screen bg-parchment dark:bg-background-dark page-enter">
      <div className="relative mx-auto max-w-md pb-32">
        {/* Affiche : photo plein écran, titre posé dessus */}
        <div
          onClick={() => event.image_url && setLightboxOpen(true)}
          className="relative h-[58vh] min-h-[380px] max-h-[540px] overflow-hidden rounded-b-[32px] cursor-zoom-in"
        >
          <ShimmerImage
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&q=75&fm=webp'}
            alt={event.title}
            className="absolute inset-0 w-full h-full"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,15,0.45)_0%,transparent_28%,transparent_42%,rgba(20,20,15,0.92)_100%)]" />

          {/* Actions */}
          <div
            className="fixed inset-x-0 z-30 mx-auto flex max-w-md items-center justify-between px-4"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => navigate(-1)} aria-label="Retour" className={`${roundBtn} bg-white text-ink`}>
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
            <div className="flex gap-2">
              <button onClick={toggleReminder} aria-label={t('reminder.set')} className={`${roundBtn} ${reminderSet ? 'bg-lime text-ink' : 'bg-white text-ink'}`}>
                {reminderSet ? <BellRing size={18} strokeWidth={1.75} /> : <Bell size={18} strokeWidth={1.75} />}
              </button>
              <button onClick={toggleFavorite} disabled={favLoading} aria-label="Favori" className={`${roundBtn} disabled:opacity-50 ${isFavorite ? 'bg-ink text-lime' : 'bg-white text-ink'}`}>
                <Heart size={18} strokeWidth={1.75} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button onClick={share} aria-label={t('event.share')} className={`${roundBtn} bg-white text-ink`}>
                <Share2 size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Statut + titre */}
          <div className="absolute inset-x-5 bottom-6 text-parchment">
            {status && (
              <span className={`inline-flex h-7 items-center gap-2 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.08em] ${status.live ? 'bg-lime text-ink' : 'bg-white/90 text-ink'}`}>
                {status.live && (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink opacity-50" />
                    <span className="relative inline-flex size-2 rounded-full bg-ink" />
                  </span>
                )}
                {t(status.key).replace('{n}', String(status.n ?? ''))}
              </span>
            )}
            <h1 className="mt-3 text-[44px] leading-[0.95] tracking-tighter text-parchment">{event.title}</h1>
            <p className="mt-2 text-[14px] text-parchment/85">
              {category ? t(category.tKey) : event.category} · {event.venue}
            </p>
          </div>
        </div>

        <div className="space-y-6 px-4 pt-5">
          {/* Date · Heure · Places */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('event.dateLabel'), value: format(eventDate, 'EEE d', { locale }).replace('.', ''), sub: format(eventDate, 'MMMM yyyy', { locale }) },
              { label: t('event.timeLabel'), value: formattedTime, sub: t('event.start') },
              { label: t('event.placesLabel'), value: event.capacity ? String(event.capacity) : '∞', sub: event.capacity ? t('event.capacity') : t('event.unlimitedShort') },
            ].map((tile) => (
              <div key={tile.label} className="card-shadow rounded-[20px] bg-white dark:bg-stone-900 p-3.5">
                <p className="eyebrow text-stone-500">{tile.label}</p>
                <p className="font-display mt-1.5 text-[22px] leading-none tracking-tight text-ink dark:text-white tabular first-letter:uppercase">{tile.value}</p>
                <p className="mt-1 truncate text-xs text-stone-500">{tile.sub}</p>
              </div>
            ))}
          </div>

          {/* Lieu + itinéraire */}
          <button
            type="button"
            onClick={showRoute}
            className="card-shadow -mt-3 flex w-full items-center gap-3.5 rounded-[20px] bg-white dark:bg-stone-900 p-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-2xl bg-lime">
              <MapPin size={20} strokeWidth={1.75} className="text-ink" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink dark:text-white">{event.venue}</span>
              {showAddress && <span className="block truncate text-sm text-stone-500">{event.address}</span>}
            </span>
            <span className="flex-shrink-0 text-sm font-medium text-ink dark:text-white link-underline">{t('event.directions')}</span>
          </button>

          {/* Points clés */}
          {keyPoints && keyPoints.length > 0 && (
            <section>
              <h2 className="eyebrow text-stone-500 mb-3">{t('event.keyPoints')}</h2>
              <ol className="card-shadow rounded-3xl bg-white dark:bg-stone-900 px-5 divide-y divide-stone-200 dark:divide-stone-800">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-baseline gap-4 py-4">
                    <span className="tabular w-6 flex-shrink-0 text-xs font-medium text-stone-400">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-[15px] leading-relaxed text-ink dark:text-stone-200">{point}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* À propos : la 1re phrase en accroche, la suite en texte courant */}
          {event.description && (() => {
            const { lead, rest } = splitLead(event.description);
            return (
              <section>
                <h2 className="eyebrow text-stone-500 mb-3">{t('event.about')}</h2>
                {lead && <p className="font-display text-[26px] leading-[1.08] tracking-[-0.03em] text-ink dark:text-white">{lead}</p>}
                {rest && <p className={`${lead ? 'mt-3' : ''} text-base leading-[1.6] text-ink/75 dark:text-stone-300 whitespace-pre-line`}>{rest}</p>}
              </section>
            );
          })()}
        </div>
      </div>

      {/* Barre d'action fixe : prix + contact (ou itinéraire) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="flex h-16 items-center justify-between rounded-full bg-ink pl-6 pr-2 shadow-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400">
              {event.is_paid ? t('event.price') : t('event.entry')}
            </p>
            <p className="font-display text-[22px] leading-none tracking-tight text-parchment tabular">{priceLabel}</p>
          </div>
          {hasContacts ? (
            <ContactFab
              variant="pill"
              label={t('event.contact')}
              closeLabel={t('close')}
              contactPhone={event.contact_phone}
              contactWhatsapp={event.contact_whatsapp}
              contactInstagram={event.contact_instagram}
              contactFacebook={event.contact_facebook}
              contactTiktok={contactTiktok}
              contactTwitter={event.contact_twitter}
              contactEmail={event.contact_email}
              emailSubject={event.title}
            />
          ) : (
            <button type="button" onClick={showRoute} className="inline-flex h-12 items-center rounded-full bg-lime px-5 text-[15px] font-medium text-ink active:scale-[0.97] transition-transform">
              {t('event.directions')}
            </button>
          )}
        </div>
      </div>

      {event.image_url && (
        <ImageLightbox
          src={event.image_url}
          alt={event.title}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default EventDetails;
