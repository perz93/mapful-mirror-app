import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Pill } from '@/components/PillToast';
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
      className="fixed inset-x-0 z-[60] flex justify-center px-3 animate-fade-in"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
    >
      <Pill
        kind="success"
        icon={<RefreshCw size={15} strokeWidth={2.4} className={updating ? 'animate-spin' : ''} />}
        message={t('update.available')}
        action={{ label: t('update.cta'), onClick: async () => { setUpdating(true); await pwaUpdate.apply(); }, loading: updating }}
        onClose={() => setVisible(false)}
      />
    </div>
  );
};

export default UpdateBanner;
