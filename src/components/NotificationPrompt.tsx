import { useState, useEffect } from 'react';
import { BellRing, BellOff } from 'lucide-react';
import { Pill } from '@/components/PillToast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSearch } from '@/contexts/SearchContext';

const DISMISS_KEY = 'notif_prompt_dismissed';
const DENIED_DISMISS_KEY = 'notif_denied_prompt_dismissed';
const RETRY_DELAY = 3 * 24 * 60 * 60 * 1000; // 3 jours

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

// Étapes pour réautoriser les notifications : le téléphone ne laisse plus
// l'app redemander une fois qu'elles ont été refusées.
const STEPS_IOS = ['Ouvre Réglages', 'Notifications', 'VIBE', 'Active « Autoriser les notifications »'];
const STEPS_ANDROID = ['Ouvre Paramètres', 'Applications', 'VIBE (ou ton navigateur)', 'Notifications → Activer'];

const NotificationPrompt = () => {
  const { isSupported, isSubscribed, permission, subscribe, loading } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const { routeDestination } = useSearch();
  const denied = permission === 'denied';
  const key = denied ? DENIED_DISMISS_KEY : DISMISS_KEY;

  useEffect(() => {
    if (!isSupported || isSubscribed) return;

    const dismissed = localStorage.getItem(key);
    if (dismissed && Date.now() - parseInt(dismissed) < RETRY_DELAY) return;

    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setAnimating(true), 50);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, key]);

  const handleSubscribe = async () => {
    await subscribe();
    handleClose();
  };

  const handleClose = () => {
    setAnimating(false);
    localStorage.setItem(key, String(Date.now()));
    setTimeout(() => { setVisible(false); setShowSteps(false); }, 300);
  };

  // Les toasts passent sous ce bandeau tant qu'il est affiché
  const shown = visible && !routeDestination;
  useEffect(() => {
    if (!shown) return;
    const root = document.documentElement;
    root.style.setProperty('--toast-extra', '56px');
    return () => { root.style.removeProperty('--toast-extra'); };
  }, [shown]);

  // Pas par-dessus le panneau d'itinéraire
  if (!shown) return null;

  const steps = isIOS() ? STEPS_IOS : STEPS_ANDROID;

  return (
    <div
      className={`fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-3 transition-all duration-300 ${animating ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}
      // Sous la rangée de boutons du haut (cloche / menu) pour ne jamais les couvrir
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 76px)' }}
    >
      {denied ? (
        <>
          <Pill
            kind="info"
            icon={<BellOff size={15} strokeWidth={2.2} />}
            message="Notifications bloquées"
            action={{ label: showSteps ? 'Masquer' : 'Comment ?', onClick: () => setShowSteps((v) => !v) }}
            onClose={handleClose}
          />
          {showSteps && (
            <div className="pointer-events-auto w-full max-w-[300px] rounded-3xl bg-black p-4 text-parchment shadow-[0_12px_30px_rgba(0,0,0,0.35)] animate-scale-in">
              <p className="mb-3 text-[13px] leading-snug text-parchment/70">
                Elles ont été refusées sur ce téléphone. Pour les réactiver :
              </p>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-2.5 text-[13.5px] font-medium">
                    <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-lime text-[12px] font-bold text-ink">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      ) : (
        <Pill
          kind="info"
          icon={<BellRing size={15} strokeWidth={2.2} />}
          message="Ne rate aucun event"
          action={{ label: 'Activer', onClick: handleSubscribe, loading }}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default NotificationPrompt;
