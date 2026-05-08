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


const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
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

  // Check if reminder already set
  useEffect(() => {
    if (!id) return;
    try {
      const reminders = JSON.parse(localStorage.getItem('event_reminders') || '{}');
      setReminderSet(!!reminders[id]);
    } catch { /* */ }
  }, [id]);

  const toggleReminder = useCallback(async () => {
    if (!id || !event) return;
    const reminders = JSON.parse(localStorage.getItem('event_reminders') || '{}');

    if (reminderSet) {
      delete reminders[id];
      localStorage.setItem('event_reminders', JSON.stringify(reminders));
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

    reminders[id] = {
      title: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      reminderAt: reminderTime.toISOString(),
    };
    localStorage.setItem('event_reminders', JSON.stringify(reminders));
    setReminderSet(true);

    const msUntilReminder = reminderTime.getTime() - Date.now();
    if (msUntilReminder > 0 && 'Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(`${event.title} ${t('reminder.title')}`, {
          body: `${event.venue} — ${event.time}`,
          icon: '/icon-192.png',
          tag: `reminder-${id}`,
        });
      }, Math.min(msUntilReminder, 2147483647));
    }

    toast.success(t('reminder.set'));
  }, [id, event, reminderSet]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-stone-600 dark:text-stone-400">{t('loading')}</div>
      </div>
    );
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
          className="relative h-80 rounded-3xl overflow-hidden mx-4 mt-2 cursor-zoom-in transition-transform active:scale-[0.99]"
        >
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&q=75&fm=webp'}
            alt={event.title}
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          
          <div className="absolute left-4 right-4 flex items-center justify-between top-3">
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={toggleReminder}
                className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                  reminderSet
                    ? 'bg-[#ee9d2b] text-white shadow-lg shadow-[#ee9d2b]/30'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {reminderSet ? <BellRing size={20} /> : <Bell size={20} />}
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-medium mb-2">
              {event.category}
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Countdown Timer */}
          <CountdownTimer eventDate={event.date} eventTime={event.time} />

          {/* Hype Bar */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/50 dark:border-stone-700/30 shadow-sm">
            <HypeBar eventId={event.id} maxCapacity={event.capacity || 50} />
          </div>

          <div className="space-y-4 rounded-md px-[3px] py-[10px] bg-orange-50">
            <div className="flex items-start gap-3 px-[9px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900 dark:text-white italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{event.venue}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{event.address || t('event.addressUnspecified')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 my-0 mx-[9px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">{formattedDate}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 mx-[9px] py-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-white">
                  {event.capacity ? `${event.capacity} ${t('event.capacity')}` : t('event.unlimitedCapacity')}
                </p>
              </div>
            </div>
          </div>

          {/* Key Points Section - Infographic Style */}
          {keyPoints && keyPoints.length > 0 && (() => {
            const stepColors = [
              { bg: 'bg-[#3B82F6]', text: 'text-[#3B82F6]', shadow: 'shadow-[#3B82F6]/30' },
              { bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', shadow: 'shadow-[#F59E0B]/30' },
              { bg: 'bg-[#EF4444]', text: 'text-[#EF4444]', shadow: 'shadow-[#EF4444]/30' },
              { bg: 'bg-[#10B981]', text: 'text-[#10B981]', shadow: 'shadow-[#10B981]/30' },
              { bg: 'bg-[#8B5CF6]', text: 'text-[#8B5CF6]', shadow: 'shadow-[#8B5CF6]/30' },
            ];
            return (
              <div className="border-t border-stone-200 dark:border-stone-800 pt-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-700" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                    {t('event.keyPoints')}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-700" />
                </div>

                <div className="relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800" />

                  <ul className="space-y-5">
                    {keyPoints.map((point, index) => {
                      const color = stepColors[index % stepColors.length];
                      return (
                        <li key={index} className="group relative flex items-center gap-4">
                          {/* Circle with number */}
                          <div className={`relative flex-shrink-0 w-14 h-14 rounded-full ${color.bg} flex items-center justify-center shadow-lg ${color.shadow} ring-4 ring-white dark:ring-background-dark transition-transform group-hover:scale-110`}>
                            <span className="text-white font-bold text-lg">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Content card */}
                          <div className="flex-1 relative">
                            {/* Connector dot */}
                            <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${color.bg}`} />
                            <div className="bg-white dark:bg-stone-900 rounded-xl px-4 py-3 shadow-sm border border-stone-100 dark:border-stone-800 transition-all group-hover:shadow-md group-hover:border-stone-200 dark:group-hover:border-stone-700">
                              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${color.text} mb-1`}>
                                {t('event.step')} {String(index + 1).padStart(2, '0')}
                              </p>
                              <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed font-medium">
                                {point}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })()}

          {event.description && (
            <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{t('event.about')}</h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[15px]">
                {event.description}
              </p>
            </div>
          )}

          <div className="border-t border-stone-200 dark:border-stone-800 pt-6 pb-20">
            <GoingSection eventId={event.id} capacity={event.capacity} />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {event.is_paid ? t('event.price') : t('event.entry')}
                </p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white">
                  {event.is_paid && event.price ? `${event.price} FCFA` : t('event.free')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactFab
        contactPhone={event.contact_phone}
        contactWhatsapp={event.contact_whatsapp}
        contactInstagram={event.contact_instagram}
        contactFacebook={event.contact_facebook}
        contactTiktok={event.contact_tiktok}
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
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
      isGoing
        ? 'bg-gradient-to-br from-[#ee9d2b]/10 to-[#ee9d2b]/5 border-2 border-[#ee9d2b]/40 shadow-lg shadow-[#ee9d2b]/10'
        : 'bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50'
    }`}>
      {/* Glow background when going */}
      {isGoing && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#ee9d2b]/15 rounded-full blur-2xl" />
      )}

      <div className="relative p-4 space-y-3">
        {/* Top row: count + button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
              isGoing
                ? 'bg-[#ee9d2b] shadow-md shadow-[#ee9d2b]/30'
                : 'bg-stone-100 dark:bg-stone-800'
            }`}>
              {isGoing ? (
                <CheckCircle2 size={22} className="text-white" />
              ) : (
                <Flame size={22} className="text-stone-400 dark:text-stone-500" />
              )}
            </div>
            <div>
              <p className="text-base font-bold text-stone-900 dark:text-white">
                {count} <span className="font-medium text-stone-500 dark:text-stone-400 text-sm">{t('event.attendees')}</span>
              </p>
              {pct !== null && (
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  {pct}{t('event.percentFilled')}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={toggleGoing}
            disabled={loading}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 ${
              isGoing
                ? 'bg-[#ee9d2b] text-white shadow-lg shadow-[#ee9d2b]/30 hover:shadow-xl hover:shadow-[#ee9d2b]/40'
                : 'bg-gradient-to-r from-[#ee9d2b] to-[#e88d15] text-white shadow-md hover:shadow-lg hover:scale-105'
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ee9d2b]/10 border border-[#ee9d2b]/20">
            <CheckCircle2 size={14} className="text-[#ee9d2b] flex-shrink-0" />
            <p className="text-xs font-medium text-[#ee9d2b]">
              {t('event.enrolled')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
