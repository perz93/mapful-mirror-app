import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Share2, Heart, Flame, CheckCircle2, Sparkles, Bell, BellRing } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import ContactFab from '@/components/ContactFab';
import ImageLightbox from '@/components/ImageLightbox';
import CountdownTimer from '@/components/CountdownTimer';
import HypeBar from '@/components/HypeBar';
import { EventDetailsSkeleton } from '@/components/PageSkeleton';
import ShimmerImage from '@/components/ShimmerImage';
import { useFavorite } from '@/hooks/useFavorite';
import { useAuth } from '@/contexts/AuthContext';


const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
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

    if ('Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast.error(t('reminder.enableNotif'));
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
  }, [id, event, reminderSet, user]);

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

  const formattedDate = format(new Date(event.date), "EEEE d MMMM yyyy", { locale: lang === 'fr' ? fr : enUS });
  const formattedTime = event.time.substring(0, 5);
  const keyPoints = event.key_points as string[] | null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div
          onClick={() => event.image_url && setLightboxOpen(true)}
          className="relative h-[22rem] rounded-3xl overflow-hidden mx-3 mt-2 cursor-zoom-in transition-transform active:scale-[0.99]"
        >
          <ShimmerImage
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&q=75&fm=webp'}
            alt={event.title}
            className="absolute inset-0 w-full h-full"
            loading="eager"
          />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/40 to-transparent" />
          
          <div className="absolute left-4 right-4 flex items-center justify-between top-3">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-parchment transition-all"
            >
              <ArrowLeft className="w-[18px] h-[18px] text-ink" strokeWidth={1.75} />
            </button>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={toggleReminder}
                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                  reminderSet
                    ? 'bg-lime text-ink'
                    : 'bg-white text-ink hover:bg-parchment'
                }`}
              >
                {reminderSet ? <BellRing size={18} strokeWidth={1.75} /> : <Bell size={18} strokeWidth={1.75} />}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: `${event.title} — ${formattedDate} à ${event.venue}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success(t('event.share'));
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink hover:bg-parchment transition-colors"
              >
                <Share2 size={18} strokeWidth={1.75} />
              </button>
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all active:scale-90 disabled:opacity-50 ${
                  isFavorite
                    ? 'bg-ink text-lime'
                    : 'bg-white text-ink hover:bg-parchment'
                }`}
              >
                <Heart size={18} strokeWidth={1.75} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <span className="absolute bottom-4 left-4 inline-flex items-center h-7 px-3 rounded-full bg-lime text-ink eyebrow">
            {event.category}
          </span>
        </div>

        {/* Titre éditorial sous l'image */}
        <div className="px-5 pt-6">
          <p className="eyebrow text-stone-500 capitalize">{event.venue}</p>
          <h1 className="mt-2 text-[40px] leading-[0.95] font-medium tracking-tighter text-ink dark:text-white">{event.title}</h1>
        </div>

        <div className="p-5 space-y-6">
          {/* Countdown Timer */}
          <CountdownTimer eventDate={event.date} eventTime={event.time} />

          {/* Hype Bar */}
          <div className="rounded-3xl bg-white dark:bg-stone-900 p-5">
            <HypeBar eventId={event.id} maxCapacity={event.capacity || 50} />
          </div>

          <dl className="rounded-3xl bg-white dark:bg-stone-900 px-5 divide-y divide-stone-200 dark:divide-stone-800">
            <div className="flex items-start gap-4 py-4">
              <MapPin size={18} strokeWidth={1.75} className="text-ink mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <dt className="eyebrow text-stone-500 mb-1">{t('event.venueLabel')}</dt>
                <dd className="font-medium text-ink dark:text-white">{event.venue}</dd>
                <dd className="text-sm text-stone-500 dark:text-stone-400">{event.address || t('event.addressUnspecified')}</dd>
              </div>
            </div>
            <div className="flex items-start gap-4 py-4">
              <Calendar size={18} strokeWidth={1.75} className="text-ink mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <dt className="eyebrow text-stone-500 mb-1">{t('event.dateLabel')}</dt>
                <dd className="font-medium text-ink dark:text-white first-letter:uppercase">{formattedDate}</dd>
                <dd className="text-sm text-stone-500 dark:text-stone-400 tabular">{formattedTime}</dd>
              </div>
            </div>
            <div className="flex items-start gap-4 py-4">
              <Users size={18} strokeWidth={1.75} className="text-ink mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <dt className="eyebrow text-stone-500 mb-1">{t('event.capacityLabel')}</dt>
                <dd className="font-medium text-ink dark:text-white">
                  {event.capacity ? `${event.capacity} ${t('event.capacity')}` : t('event.unlimitedCapacity')}
                </dd>
              </div>
            </div>
          </dl>

          {/* Key Points Section - Infographic Style */}
          {keyPoints && keyPoints.length > 0 && (
            <section className="pt-2">
              <h2 className="eyebrow text-stone-500 mb-4">{t('event.keyPoints')}</h2>
              <ol className="rounded-3xl bg-white dark:bg-stone-900 px-5 divide-y divide-stone-200 dark:divide-stone-800">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-baseline gap-4 py-4">
                    <span className="font-mono-sono text-xs font-medium text-stone-400 tabular w-6 flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-ink dark:text-stone-200 text-[15px] leading-relaxed">
                      {point}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {event.description && (
            <section className="pt-2">
              <h2 className="eyebrow text-stone-500 mb-3">{t('event.about')}</h2>
              <p className="text-ink/80 dark:text-stone-300 leading-[1.6] text-base">
                {event.description}
              </p>
            </section>
          )}

          <div className="pt-2 pb-24 space-y-3">
            <div className="rounded-3xl bg-charcoal text-parchment p-6">
              <p className="eyebrow text-stone-400">
                {event.is_paid ? t('event.price') : t('event.entry')}
              </p>
              <p className="mt-2 text-[44px] leading-none font-medium tracking-tighter tabular">
                {event.is_paid && event.price ? <>{event.price} <span className="text-lime text-2xl tracking-tight">FCFA</span></> : t('event.free')}
              </p>
            </div>
            <GoingSection eventId={event.id} capacity={event.capacity} />
          </div>
        </div>
      </div>

      <ContactFab
        contactPhone={event.contact_phone}
        contactWhatsapp={event.contact_whatsapp}
        contactInstagram={event.contact_instagram}
        contactFacebook={event.contact_facebook}
        contactTiktok={(event as any).contact_tiktok}
        contactTwitter={event.contact_twitter}
      />

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

const GoingSection = ({ eventId, capacity }: { eventId: string; capacity?: number }) => {
  const { t } = useLanguage();
  const { isGoing, count, toggleGoing, loading } = useAttendees(eventId);
  const pct = capacity ? Math.min(Math.round((count / capacity) * 100), 100) : null;

  return (
    <div className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
      isGoing
        ? 'bg-lime'
        : 'bg-white dark:bg-stone-900'
    }`}>
      {/* Glow background when going */}

      <div className="relative p-4 space-y-3">
        {/* Top row: count + button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              isGoing
                ? 'bg-ink'
                : 'bg-parchment dark:bg-stone-800'
            }`}>
              {isGoing ? (
                <CheckCircle2 size={20} strokeWidth={1.75} className="text-lime" />
              ) : (
                <Flame size={20} strokeWidth={1.75} className="text-ink dark:text-stone-500" />
              )}
            </div>
            <div>
              <p className="text-xl font-medium tracking-tight text-ink dark:text-white tabular">
                {count} <span className="font-normal text-stone-600 dark:text-stone-400 text-sm tracking-normal">{t('event.attendees')}</span>
              </p>
              {pct !== null && (
                <p className="text-[11px] text-stone-600 dark:text-stone-500 tabular">
                  {pct}{t('event.percentFilled')}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={toggleGoing}
            disabled={loading}
            className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 ${
              isGoing
                ? 'bg-ink text-parchment'
                : 'bg-lime text-ink hover:bg-lime-deep'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {isGoing ? (
                <>
                  <Sparkles size={14} />
                  {t('event.goingConfirm')}
                </>
              ) : (
                <>
                  <Flame size={14} />
                  {t('event.going')}
                </>
              )}
            </span>
          </button>
        </div>

        {/* Status message */}
        {isGoing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime/30 border border-ink/10">
            <CheckCircle2 size={14} className="text-ink flex-shrink-0" />
            <p className="text-xs font-medium text-ink">
              {t('event.enrolled')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
