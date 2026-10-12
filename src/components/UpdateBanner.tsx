import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
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
    // Fond noir partout (barre d'état comprise) pendant l'écran de mise à jour,
    // et il le reste au rechargement jusqu'à la fin du splash
    document.documentElement.classList.add('splashing');
    try { sessionStorage.setItem(UPDATED_KEY, '1'); } catch { /* ignore */ }
    // L'écran reste affiché au moins 4 s avant le rechargement
    await new Promise((r) => window.setTimeout(r, 4000));
    window.setTimeout(() => window.location.reload(), 8000); // filet de sécurité
    await pwaUpdate.apply();
  };

  if (updating) {
    // Même visuel que le splash de démarrage : fond noir, logo centré
    return createPortal(
      <div className="fixed inset-0 z-[10000] overflow-hidden bg-black animate-fade-in" role="status" aria-live="polite">
        {/* Logo à la même place que sur le splash (centré) : pas de saut au rechargement */}
        <img
          src="/splash-logo.png"
          alt="VIBE"
          className="absolute left-1/2 top-1/2 h-[120px] w-[240px]"
          style={{ transform: 'translate(-50%, -55%)' }}
        />
        <div className="absolute inset-x-0 top-1/2 mt-16 flex flex-col items-center">
          <p className="text-[15px] font-semibold text-[#f5f5eb]">{t('update.installing')}</p>
          <div className="mt-3.5 flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 rounded-full bg-lime animate-update-dot"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
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
