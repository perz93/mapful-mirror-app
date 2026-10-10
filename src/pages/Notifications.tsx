import { useState } from 'react';
import LargeTitle from '@/components/LargeTitle';
import { useLocation, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ShimmerImage from '@/components/ShimmerImage';
import { ArrowLeft, ArrowRight, BellRing, BellOff, CalendarDays, CalendarPlus, CheckCheck, CircleCheck, Clock, MapPin, type LucideIcon } from 'lucide-react';
import { useNotificationInbox, type NotificationItem } from '@/hooks/useNotificationInbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Icône (trait fin) et libellé par type de notification
const TYPES: Record<string, { icon: LucideIcon; label: string }> = {
  new_event: { icon: CalendarPlus, label: 'Nouvel événement' },
  proximity: { icon: MapPin, label: 'Près de toi' },
  event_reminder: { icon: BellRing, label: 'Rappel' },
  event_tomorrow: { icon: CalendarDays, label: 'Demain' },
  event_starting: { icon: Clock, label: 'Bientôt' },
  event_published: { icon: CircleCheck, label: 'Publié' },
};
const typeOf = (type: string) => TYPES[type] ?? { icon: BellRing, label: 'VIBE' };

// Les titres envoyés en push commencent souvent par un emoji : inutile ici
const cleanTitle = (title: string | null) =>
  (title ?? '').replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '') || 'Notification';

const GROUPS = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus tôt'] as const;
function groupOf(dateStr: string): (typeof GROUPS)[number] {
  try {
    const d = differenceInCalendarDays(new Date(), parseISO(dateStr));
    return d <= 0 ? GROUPS[0] : d === 1 ? GROUPS[1] : d < 7 ? GROUPS[2] : GROUPS[3];
  } catch {
    return GROUPS[3];
  }
}

const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Retour fiable : page précédente de l'app si elle existe, sinon la carte
  // (ouverture depuis une notification push = pas d'historique).
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  // Un tap ouvre la carte pour lire tout le message ; le lien éventuel
  // (événement…) est proposé dans la carte ouverte.
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (notif: NotificationItem) => {
    if (!notif.is_read) markAsRead(notif.id);
    setExpanded((cur) => (cur === notif.id ? null : notif.id));
  };
  // Ne pas empiler la même page (sinon il faut appuyer plusieurs fois sur retour)
  const linkOf = (notif: NotificationItem) =>
    notif.url && notif.url !== '/' && notif.url !== location.pathname ? notif.url : null;
  const { t } = useLanguage();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotificationInbox();

  if (!user) {
    return (
      <div className="relative min-h-screen bg-parchment max-w-md mx-auto page-enter">
        <div className="px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <button onClick={goBack} aria-label="Retour" className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform mb-6">
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </button>
          <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink">{t('notif.title')}</LargeTitle>
        </div>
        <div className="mx-4 rounded-3xl bg-white p-6">
          <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-parchment">
            <BellOff size={18} strokeWidth={1.75} className="text-ink" />
          </span>
          <p className="text-ink font-medium mb-4">{t('auth.loginToSee')}</p>
          <button onClick={() => navigate('/auth')} className="h-12 px-6 rounded-full bg-lime text-ink font-medium hover:bg-lime-deep transition-colors">
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-parchment max-w-md mx-auto page-enter">
      {/* En-tête : même structure que les autres pages */}
      <div className="px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack} aria-label="Retour" className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform">
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-white text-ink text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              <CheckCheck size={16} strokeWidth={1.75} />
              {t('notif.markAllRead')}
            </button>
          )}
        </div>
        <LargeTitle className="text-[40px] leading-[0.95] tracking-tighter text-ink">{t('notif.title')}</LargeTitle>
        {unreadCount > 0 && (
          <p className="mt-2 text-stone-500">{unreadCount} {unreadCount > 1 ? t('notif.unreadPlural') : t('notif.unread')}</p>
        )}
      </div>

      {/* Content */}
      <div className="pb-8 px-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3.5 rounded-3xl bg-white p-3">
                <div className="size-14 flex-shrink-0 rounded-2xl skeleton relative overflow-hidden" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded-md skeleton relative overflow-hidden" />
                  <div className="h-4 w-3/4 rounded-md skeleton relative overflow-hidden" />
                  <div className="h-3 w-1/2 rounded-md skeleton relative overflow-hidden" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={BellRing} title={t('notif.empty')} hint={t('notif.emptyHint')} />
        ) : (
          <div className="flex flex-col gap-6">
            {GROUPS.map((group) => {
              const items = notifications.filter((n) => groupOf(n.created_at) === group);
              if (items.length === 0) return null;
              return (
                <section key={group}>
                  <h2 className="mb-2.5 px-1 text-[13px] font-semibold text-stone-500">{group}</h2>
                  <div className="flex flex-col gap-2">
                    {items.map((notif) => {
                      const { icon: Icon, label } = typeOf(notif.notification_type);
                      const isOpen = expanded === notif.id;
                      const link = linkOf(notif);
                      return (
                        <div
                          key={notif.id}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isOpen}
                          onClick={() => toggle(notif)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(notif); } }}
                          className={`flex w-full gap-3.5 rounded-3xl bg-white p-3 text-left transition-transform active:scale-[0.99] ${isOpen ? 'items-start' : 'items-center'}`}
                        >
                          <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-2xl bg-parchment">
                            {notif.image_url ? (
                              <ShimmerImage src={notif.image_url} alt="" className="h-full w-full" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Icon size={24} strokeWidth={1.75} className="text-ink" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                              <Icon size={13} strokeWidth={2} className="flex-shrink-0" />
                              <span className="truncate">{label} · {formatTimeAgo(notif.created_at)}</span>
                            </p>
                            <p className={`mt-0.5 text-[15px] leading-snug text-ink ${isOpen ? '' : 'line-clamp-2'} ${notif.is_read ? 'font-medium' : 'font-bold'}`}>
                              {cleanTitle(notif.title)}
                            </p>
                            {notif.body && (
                              <p className={`mt-0.5 text-[13px] leading-snug text-stone-500 ${isOpen ? 'whitespace-pre-line' : 'line-clamp-1'}`}>{notif.body}</p>
                            )}
                            {isOpen && link && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); navigate(link); }}
                                className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-lime px-4 text-sm font-semibold text-ink active:scale-95 transition-transform"
                              >
                                {link.startsWith('/event/') ? "Voir l'événement" : 'Ouvrir'}
                                <ArrowRight size={16} strokeWidth={2} />
                              </button>
                            )}
                          </div>

                          {!notif.is_read && (
                            <span aria-label="Non lue" className="size-2.5 flex-shrink-0 self-start mt-2 rounded-full bg-lime ring-4 ring-lime/25" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

export default Notifications;
