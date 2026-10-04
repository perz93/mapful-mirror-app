import { useState, useEffect, useCallback, useRef } from 'react';
import { Share, SquarePlus, EllipsisVertical, Download, Copy, Check, AlertCircle, X } from 'lucide-react';

const INSTALLED_KEY = 'pwa_installed';
const LATER_KEY = 'pwa_install_later'; // « Plus tard » : masqué pour la session

type OS = 'ios' | 'android' | 'unknown';

function detectOS(): OS {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'unknown';
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Navigateurs intégrés (Instagram, Facebook, TikTok…) : impossible d'installer depuis là. */
function isInAppBrowser(): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|Snapchat|musical_ly|Twitter/i.test(navigator.userAgent || '');
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ------------------------------------------------------------------
// Mini-téléphone : l'écran tel qu'il apparaît, l'élément à toucher en vert
// ------------------------------------------------------------------

/** Halo vert pulsé autour de l'élément à toucher */
const Target = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`relative inline-flex ${className}`}>
    <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full bg-lime/50" />
    <span className="relative inline-flex">{children}</span>
  </span>
);

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto h-[300px] w-[200px] overflow-hidden rounded-[34px] border-[6px] border-ink bg-parchment">
    {/* Contenu factice de la page */}
    <div className="absolute inset-x-3 top-9 h-24 rounded-2xl bg-[linear-gradient(135deg,#dbe8c6,#f1eee2)]" />
    <div className="absolute inset-x-3 top-[136px] h-2.5 rounded-full bg-stone-200" />
    <div className="absolute left-3 top-[152px] h-2.5 w-24 rounded-full bg-stone-200" />
    {children}
  </div>
);

const SheetRow = ({ label, icon, active = false }: { label: string; icon: React.ReactNode; active?: boolean }) => (
  <div className={`flex items-center justify-between px-3 py-2.5 text-[11.5px] ${active ? 'bg-lime/30 font-semibold text-ink' : 'text-stone-400'}`}>
    <span>{label}</span>
    <span className={active ? 'text-ink' : 'text-stone-300'}>{icon}</span>
  </div>
);

const IOS_STEPS = [
  {
    title: 'Touche Partager',
    hint: "L'icône carrée avec une flèche, dans la barre de Safari (ou « ⋯ » puis Partager).",
    visual: (
      <PhoneFrame>
        <div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-around bg-white text-stone-400">
          <span className="text-lg">‹</span>
          <Target>
            <span className="flex size-9 items-center justify-center rounded-full bg-lime text-ink"><Share size={16} strokeWidth={2} /></span>
          </Target>
          <span className="text-sm">⟳</span>
        </div>
      </PhoneFrame>
    ),
  },
  {
    title: "Choisis « Sur l'écran d'accueil »",
    hint: 'Fais défiler la liste du menu Partager jusqu\'à cette option.',
    visual: (
      <PhoneFrame>
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pt-2 shadow-[0_-8px_20px_rgba(20,20,15,0.12)]">
          <span className="mx-auto mb-1.5 block h-1 w-8 rounded-full bg-stone-200" />
          <SheetRow label="Copier" icon={<Copy size={13} />} />
          <SheetRow label="Ajouter aux favoris" icon={<span>☆</span>} />
          <SheetRow label="Sur l'écran d'accueil" icon={<SquarePlus size={14} strokeWidth={2} />} active />
          <SheetRow label="Imprimer" icon={<span>⎙</span>} />
        </div>
      </PhoneFrame>
    ),
  },
  {
    title: 'Touche « Ajouter »',
    hint: "En haut à droite. L'icône VIBE apparaît sur ton écran d'accueil.",
    visual: (
      <PhoneFrame>
        <div className="absolute inset-0 bg-white">
          <div className="flex items-center justify-between px-3 pt-4 text-[11px]">
            <span className="text-[#0a84ff]">Annuler</span>
            <span className="font-semibold text-ink">Écran d'accueil</span>
            <Target><span className="rounded-md bg-lime px-1.5 py-0.5 font-bold text-ink">Ajouter</span></Target>
          </div>
          <div className="mx-3 mt-5 flex items-center gap-2.5 rounded-xl bg-parchment p-2.5">
            <img src="/icon-192.png" alt="" className="size-10 rounded-[10px]" />
            <span className="text-[12px] font-medium text-ink">VIBE</span>
          </div>
        </div>
      </PhoneFrame>
    ),
  },
];

const ANDROID_STEPS = [
  {
    title: 'Ouvre le menu de Chrome',
    hint: 'Touche les trois points en haut à droite.',
    visual: (
      <PhoneFrame>
        <div className="absolute inset-x-0 top-0 flex h-9 items-center gap-2 bg-white px-2.5">
          <span className="h-5 flex-1 rounded-full bg-parchment" />
          <Target>
            <span className="flex size-7 items-center justify-center rounded-full bg-lime text-ink"><EllipsisVertical size={15} strokeWidth={2} /></span>
          </Target>
        </div>
      </PhoneFrame>
    ),
  },
  {
    title: "Choisis « Installer l'application »",
    hint: "Selon ton téléphone, l'option s'appelle aussi « Ajouter à l'écran d'accueil ».",
    visual: (
      <PhoneFrame>
        <div className="absolute right-2 top-2 w-[150px] overflow-hidden rounded-xl bg-white py-1 shadow-[0_8px_24px_rgba(20,20,15,0.18)]">
          <SheetRow label="Nouvel onglet" icon={<span>＋</span>} />
          <SheetRow label="Favoris" icon={<span>☆</span>} />
          <SheetRow label="Installer l'application" icon={<Download size={13} strokeWidth={2} />} active />
          <SheetRow label="Paramètres" icon={<span>⚙</span>} />
        </div>
      </PhoneFrame>
    ),
  },
  {
    title: 'Confirme avec « Installer »',
    hint: 'VIBE rejoint tes applications et ton écran d\'accueil.',
    visual: (
      <PhoneFrame>
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-x-3 top-[92px] rounded-2xl bg-white p-3">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="size-8 rounded-lg" />
            <span className="text-[12px] font-semibold text-ink">Installer l'application ?</span>
          </div>
          <div className="mt-4 flex justify-end gap-3 text-[11px] font-medium">
            <span className="py-1 text-[#0b57d0]">Annuler</span>
            <Target><span className="rounded-full bg-[#0b57d0] px-3 py-1 text-white">Installer</span></Target>
          </div>
        </div>
      </PhoneFrame>
    ),
  },
];

const InstallGuide = () => {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [tab, setTab] = useState<'ios' | 'android'>('ios');
  const [deviceOS, setDeviceOS] = useState<OS>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const touchX = useRef(0);

  // Invite d'installation native (Android / Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const installed = () => {
      try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch { /* stockage indisponible */ }
      close();
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(INSTALLED_KEY) || sessionStorage.getItem(LATER_KEY)) return;
    } catch { /* stockage indisponible : on affiche */ }

    const os = detectOS();
    if (os === 'unknown') return;
    setDeviceOS(os);
    setTab(os);
    setVisible(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  const close = () => {
    setShown(false);
    window.setTimeout(() => setVisible(false), 350);
  };

  const later = () => {
    try { sessionStorage.setItem(LATER_KEY, '1'); } catch { /* ignore */ }
    close();
  };

  const installAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch { /* ignore */ }
      close();
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers refusé */ }
  };

  if (!visible) return null;

  const inApp = isInAppBrowser();
  const onThisDevice = tab === deviceOS;
  const steps = tab === 'ios' ? IOS_STEPS : ANDROID_STEPS;
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const switchTab = (k: 'ios' | 'android') => { setTab(k); setStep(0); };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="install-title">
      {/* Fond */}
      <div className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`} />

      {/* Feuille */}
      <div
        className={`relative flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:rounded-[28px] ${
          shown ? 'translate-y-0' : 'translate-y-full sm:translate-y-8'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx < -50 && !isLast) setStep(step + 1);
          if (dx > 50 && step > 0) setStep(step - 1);
        }}
      >
        <div className="overflow-y-auto overscroll-contain px-5 pt-4 pb-4">
          {/* En-tête : app + fermer */}
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="" className="size-11 rounded-[13px] border border-stone-200 object-cover" />
            <div className="min-w-0 flex-1">
              <h2 id="install-title" className="text-[22px] leading-none tracking-tighter text-ink">Installe VIBE</h2>
              <p className="mt-1 text-[12.5px] text-stone-500">Gratuit · sans store · 3 gestes</p>
            </div>
            <button onClick={later} aria-label="Fermer" className="flex size-9 items-center justify-center rounded-full bg-parchment text-ink active:scale-95 transition-transform">
              <X size={17} strokeWidth={1.75} />
            </button>
          </div>

          {/* iPhone / Android */}
          <div role="tablist" className="relative mt-4 grid grid-cols-2 rounded-full bg-parchment p-1">
            <span
              aria-hidden
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                tab === 'android' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            {(['ios', 'android'] as const).map((k) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={tab === k}
                onClick={() => switchTab(k)}
                className={`relative z-10 h-9 rounded-full text-sm font-medium transition-colors duration-300 ${tab === k ? 'text-parchment' : 'text-stone-600'}`}
              >
                {k === 'ios' ? 'iPhone' : 'Android'}
                {deviceOS === k && <span className={`ml-1.5 text-[11px] ${tab === k ? 'text-lime' : 'text-stone-400'}`}>· ton appareil</span>}
              </button>
            ))}
          </div>

          {/* Navigateur intégré (Instagram, TikTok…) */}
          {inApp && onThisDevice && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-parchment p-3.5">
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-ink" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink">Ouvre d'abord le site dans {tab === 'ios' ? 'Safari' : 'Chrome'}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-stone-600">
                  L'installation n'est pas possible depuis le navigateur d'une app (Instagram, TikTok…). Copie le lien et colle-le dans {tab === 'ios' ? 'Safari' : 'Chrome'}.
                </p>
                <button onClick={copyLink} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[12px] font-medium text-parchment active:scale-95 transition-transform">
                  {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
                  {copied ? 'Lien copié' : 'Copier le lien'}
                </button>
              </div>
            </div>
          )}

          {/* Installation directe (Chrome Android) */}
          {tab === 'android' && deferredPrompt && onThisDevice && (
            <button
              onClick={installAndroid}
              className="mt-4 flex h-12 w-full items-center gap-3 rounded-full bg-lime pl-1.5 pr-5 text-ink hover:bg-lime-deep active:scale-[0.98] transition"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-ink text-lime">
                <Download size={17} strokeWidth={1.75} />
              </span>
              <span className="flex-1 text-left text-[15px] font-medium">Installer en un tap</span>
            </button>
          )}

          {/* Progression */}
          <div className="mt-5 flex items-center justify-between">
            <p className="eyebrow text-stone-500">Étape {step + 1} sur {steps.length}</p>
          </div>
          <div className="mt-2 flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Étape ${i + 1}`}
                onClick={() => setStep(i)}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-ink' : 'bg-stone-200'}`}
              />
            ))}
          </div>

          {/* Étape courante */}
          <div key={`${tab}-${step}`} className="mt-5 animate-fade-in">
            {current.visual}
            <h3 className="mt-5 text-center font-display text-[24px] leading-[1.05] tracking-[-0.03em] text-ink">{current.title}</h3>
            <p className="mx-auto mt-1.5 max-w-[300px] text-center text-[14px] leading-snug text-stone-500">{current.hint}</p>
          </div>

          {tab === 'ios' && isLast && (
            <p className="mt-4 rounded-2xl bg-parchment px-3.5 py-3 text-[12px] leading-snug text-stone-600">
              <span className="font-medium text-ink">Bon à savoir :</span> sur iPhone, les notifications ne fonctionnent qu'une fois l'app installée (iOS 16.4 ou plus récent).
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-2 px-5 pb-4 pt-1">
          <button
            onClick={() => (step === 0 ? later() : setStep(step - 1))}
            className="h-12 flex-1 rounded-full bg-parchment text-[15px] font-medium text-ink active:scale-[0.98] transition"
          >
            {step === 0 ? 'Plus tard' : '← Retour'}
          </button>
          <button
            onClick={() => (isLast ? later() : setStep(step + 1))}
            className="h-12 flex-[1.4] rounded-full bg-ink text-[15px] font-medium text-parchment active:scale-[0.98] transition"
          >
            {isLast ? "C'est fait" : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
// eslint-disable-next-line react-refresh/only-export-components
export { isStandalone, detectOS };
