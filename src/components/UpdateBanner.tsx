import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { pwaUpdate } from '@/lib/pwaUpdate';
import { useLanguage } from '@/contexts/LanguageContext';

/** Bandeau « Nouvelle version » : l'utilisateur met à jour quand il veut. */
const UpdateBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(pwaUpdate.isAvailable());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaUpdate.subscribe(setVisible);
    return () => { unsubscribe(); };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 z-[60] mx-auto flex max-w-md justify-center px-4 animate-fade-in"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <div className="flex w-full items-center gap-3 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-parchment shadow-2xl">
        <span className="flex-1 text-sm">{t('update.available')}</span>
        <button
          onClick={async () => { setUpdating(true); await pwaUpdate.apply(); }}
          disabled={updating}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lime px-4 text-sm font-medium text-ink hover:bg-lime-deep transition-colors disabled:opacity-70"
        >
          <RefreshCw size={14} strokeWidth={2} className={updating ? 'animate-spin' : ''} />
          {t('update.cta')}
        </button>
        <button
          onClick={() => setVisible(false)}
          aria-label={t('close')}
          className="flex size-9 items-center justify-center rounded-full text-stone-400 hover:text-parchment"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
