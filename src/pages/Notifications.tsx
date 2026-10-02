import LargeTitle from '@/components/LargeTitle';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ShimmerImage from '@/components/ShimmerImage';
import { ArrowLeft, Bell, BellOff, Check, CheckCheck } from 'lucide-react';
import { useNotificationInbox } from '@/hooks/useNotificationInbox';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeIcons: Record<string, string> = {
  new_event: '🎉',
  proximity: '📍',
  event_reminder: '⏰',
  event_tomorrow: '📅',
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotificationInbox();

  if (!user) {
    return (
      <div className="relative min-h-screen bg-parchment max-w-md mx-auto page-enter">
        <div className="px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <button onClick={() => navigate(-1)} aria-label="Retour" className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform mb-6">
            <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
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
          <button onClick={() => navigate(-1)} aria-label="Retour" className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform">
            <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
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
              <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900">
                <div className="w-12 h-12 rounded-xl skeleton relative overflow-hidden flex-shrink-0">
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 skeleton rounded-md w-3/4 relative overflow-hidden">
                  </div>
                  <div className="h-3 skeleton rounded-md w-1/2 relative overflow-hidden">
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title={t('notif.empty')} hint={t('notif.emptyHint')} />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.url) navigate(notif.url);
                }}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-[0.98] ${
                  notif.is_read
                    ? 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800'
                    : 'bg-lime/30 dark:bg-lime/30 border border-ink/10'
                }`}
              >
                {/* Image or icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {notif.image_url ? (
                    <ShimmerImage src={notif.image_url} alt="" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      {typeIcons[notif.notification_type] || '🔔'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className={`text-sm leading-snug line-clamp-2 ${
                      notif.is_read
                        ? 'text-stone-700 dark:text-stone-300'
                        : 'text-stone-900 dark:text-white font-semibold'
                    }`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-lime" />
                    )}
                  </div>
                  {notif.body && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                      {notif.body}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                    {formatTimeAgo(notif.created_at)}
                  </p>
                </div>

                {/* Read indicator */}
                {notif.is_read && (
                  <Check size={14} className="flex-shrink-0 text-stone-300 dark:text-stone-600 mt-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

export default Notifications;
