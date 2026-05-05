import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const DISMISS_KEY = 'notif_prompt_dismissed';

const NotificationPrompt = () => {
  const { isSupported, isSubscribed, permission, subscribe, loading } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Show prompt after 3 seconds if not subscribed and not dismissed
    if (!isSupported || isSubscribed || permission === 'denied') return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Re-show after 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setAnimating(true), 50);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleSubscribe = async () => {
    await subscribe();
    handleClose();
  };

  const handleClose = () => {
    setAnimating(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div className={`fixed top-4 left-0 right-0 max-w-md mx-auto px-4 z-50 transition-all duration-300 ${animating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-stone-900/90 border border-white/60 dark:border-stone-700/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#ee9d2b]/15 flex items-center justify-center">
            <Bell size={20} className="text-[#ee9d2b]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-white">
              Ne rate aucun event !
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Active les notifications pour savoir quand un event hype commence près de toi
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex-1 h-9 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                {loading ? '...' : 'Activer'}
              </button>
              <button
                onClick={handleClose}
                className="h-9 px-4 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-95"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button onClick={handleClose} className="flex-shrink-0 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
            <X size={14} className="text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
