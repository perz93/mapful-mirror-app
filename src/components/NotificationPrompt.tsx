import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Pill } from '@/components/PillToast';
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
      className={`fixed inset-x-0 z-50 flex justify-center px-3 transition-all duration-300 ${animating ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
    >
      <Pill
        kind="info"
        icon={<Bell size={15} strokeWidth={2.2} />}
        message="Ne rate aucun event !"
        action={{ label: 'Activer', onClick: handleSubscribe, loading }}
        onClose={handleClose}
      />
    </div>
  );
};

export default NotificationPrompt;
