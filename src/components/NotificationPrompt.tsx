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
      <div className="rounded-xl backdrop-blur-2xl bg-white/80 border border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#ee9d2b] flex-shrink-0" />
          <p className="text-[11px] text-stone-700 font-medium leading-tight flex-1">
            Ne rate aucun event !
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-shrink-0 h-6 px-3 rounded-full bg-[#ee9d2b] text-white text-[10px] font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
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
