import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Settings } from 'lucide-react';
import { Pill, toast } from '@/components/PillToast';
import { pwaUpdate } from '@/lib/pwaUpdate';
import { useLanguage } from '@/contexts/LanguageContext';

const UPDATED_KEY = 'vibe-just-updated';

/** Bandeau « Nouvelle version » : l'utilisateur met à jour quand il veut. */
const UpdateBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(pwaUpdate.isAvailable());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaUpdate.subscribe(setVisible);
    return () => { unsubscribe(); };
  }, []);

  // Retour après la mise à jour : petite confirmation
  useEffect(() => {
    try {
      if (sessionStorage.getItem(UPDATED_KEY)) {
        sessionStorage.removeItem(UPDATED_KEY);
        window.setTimeout(() => toast.success(t('update.done')), 900);
      }
    } catch { /* stockage indisponible */ }
  }, [t]);

  const startUpdate = async () => {
    setUpdating(true);
    try { sessionStorage.setItem(UPDATED_KEY, '1'); } catch { /* ignore */ }
    // Laisse l'écran s'afficher un instant avant le rechargement
    await new Promise((r) => window.setTimeout(r, 1400));
    window.setTimeout(() => window.location.reload(), 8000); // filet de sécurité
    await pwaUpdate.apply();
  };

  if (updating) {
    // Écran « affiche » (même visuel que le splash de démarrage)
    return createPortal(
      <div className="fixed inset-0 z-[10000] overflow-hidden bg-black animate-fade-in" role="status" aria-live="polite">
        <div
          className="absolute inset-x-0 top-0 h-[56%] bg-cover bg-top"
          style={{ backgroundImage: "url('/splash-photo-2.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0) 12%,rgba(0,0,0,0) 30%,#000 54%)' }}
        />
        {/* Logo à la même place que sur le splash : pas de saut au rechargement */}
        <img
          src="/splash-logo.png"
          alt="VIBE"
          className="absolute left-1/2 w-[220px] h-auto -translate-x-1/2"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20%)' }}
        />
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: 'calc(80% - env(safe-area-inset-bottom, 0px) + 28px)' }}
        >
          <Settings
            size={30}
            strokeWidth={1.75}
            className="text-lime animate-spin"
            style={{ animationDuration: '2.4s' }}
          />
          <p className="mt-3 text-[15px] font-medium text-[#f5f5eb]">{t('update.installing')}</p>
        </div>
      </div>,
      document.body,
    );
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 z-[60] flex justify-center px-3 animate-fade-in"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 76px)' }}
    >
      <Pill
        kind="success"
        icon={<RefreshCw size={15} strokeWidth={2.4} />}
        message={t('update.available')}
        action={{ label: t('update.cta'), onClick: startUpdate }}
        onClose={() => setVisible(false)}
      />
    </div>
  );
};

export default UpdateBanner;
