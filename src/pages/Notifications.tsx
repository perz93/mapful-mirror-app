import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Check, CheckCheck } from 'lucide-react';
import { useNotificationInbox } from '@/hooks/useNotificationInbox';
import { useAuth } from '@/contexts/AuthContext';
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
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotificationInbox();

  if (!user) {
    return (
      <div className="relative min-h-screen bg-stone-50 dark:bg-stone-950">
        <div className="fixed inset-x-0 top-0 z-10 max-w-md mx-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-lg font-bold">Notifications</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-6">
          <BellOff size={48} className="text-stone-300" />
          <p className="text-stone-500 text-center">Connecte-toi pour voir tes notifications</p>
          <button onClick={() => navigate('/auth')} className="px-6 py-3 rounded-2xl bg-[#ee9d2b] text-white font-semibold">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-stone-950 max-w-md mx-auto">
      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-10 max-w-md mx-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <ArrowLeft size={22} className="text-stone-900 dark:text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-stone-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-stone-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ee9d2b]/10 text-[#ee9d2b] text-xs font-semibold hover:bg-[#ee9d2b]/20 transition-colors"
            >
              <CheckCheck size={14} />
              Tout lire
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-8 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 70px)' }}>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900">
                <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Bell size={36} className="text-stone-300 dark:text-stone-600" />
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-center text-sm">
              Aucune notification pour le moment
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-center text-xs max-w-[250px]">
              Tu recevras des notifications quand de nouveaux events seront publiés près de toi
            </p>
          </div>
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
                    : 'bg-[#ee9d2b]/5 dark:bg-[#ee9d2b]/10 border border-[#ee9d2b]/20'
                }`}
              >
                {/* Image or icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {notif.image_url ? (
                    <img src={notif.image_url} alt="" className="w-full h-full object-cover" />
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
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-[#ee9d2b]" />
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
