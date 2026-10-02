import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const DISMISS_KEY = 'notif_prompt_dismissed';

const NotificationPrompt = () => {
  const { isSupported, isSubscribed, permission, subscribe, loading } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isSupported || isSubscribed || permission === 'denied') return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
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
    <div
      className={`fixed left-3 z-50 transition-all duration-300 ${animating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 18px)', maxWidth: '260px' }}
    >
      <div className="rounded-full bg-white shadow-lg pl-4 pr-1.5 py-1.5">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-ink flex-shrink-0" />
          <p className="text-[11px] text-stone-700 font-medium leading-tight flex-1">
            Ne rate aucun event !
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-shrink-0 h-8 px-4 rounded-full bg-lime text-ink text-xs font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
          >
            OK
          </button>
          <button onClick={handleClose} className="flex-shrink-0 h-5 w-5 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-all active:scale-95">
            <X size={10} className="text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
