import { useState, useEffect, useCallback, useRef } from 'react';
import { Share, SquarePlus, EllipsisVertical, Download, Copy, Check, AlertCircle } from 'lucide-react';

const INSTALLED_KEY = 'pwa_installed';

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
// Illustration « T2 » : vrai iPhone (format haut) avec une capture de VIBE,
// et une loupe qui grossit l'endroit exact à toucher.
// ------------------------------------------------------------------

const IOS_BLUE = '#0a84ff';
const ANDROID_BLUE = '#0b57d0';

/** Téléphone miniature avec une vraie page VIBE : iPhone (Dynamic Island) ou Android (caméra « poinçon ») */
const MiniPhone = ({ children, android = false }: { children?: React.ReactNode; android?: boolean }) => (
  <div
    className={`relative h-[216px] w-[104px] flex-shrink-0 bg-ink shadow-[0_18px_36px_-16px_rgba(20,20,15,0.55)] ${
      android ? 'rounded-[16px] p-[3px]' : 'rounded-[22px] p-[4px]'
    }`}
  >
    {android ? (
      <span aria-hidden className="absolute -right-[2px] top-[44px] h-12 w-[2px] rounded-r bg-ink" />
    ) : (
      <>
        <span aria-hidden className="absolute -left-[2px] top-[48px] h-5 w-[2px] rounded-l bg-ink" />
        <span aria-hidden className="absolute -right-[2px] top-[60px] h-8 w-[2px] rounded-r bg-ink" />
      </>
    )}
    <div
      className={`relative h-full w-full overflow-hidden bg-[#ece8d6] bg-cover bg-top ${android ? 'rounded-[13px]' : 'rounded-[18px]'}`}
      style={{ backgroundImage: 'url(/guide-screen.jpg)' }}
    >
      {android ? (
        <>
          {/* Barre d'état Android + caméra poinçon */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-[16px] items-center justify-between bg-white px-2 text-[6px] font-medium text-[#1f1f1f]">
            <span>10:42</span>
            <span className="tracking-tight">▾ ▴ ▮</span>
          </div>
          <span aria-hidden className="absolute left-1/2 top-[4px] z-20 size-[7px] -translate-x-1/2 rounded-full bg-black" />
          {/* Barre de navigation gestuelle */}
          <span aria-hidden className="absolute bottom-[3px] left-1/2 z-20 h-[2px] w-[30px] -translate-x-1/2 rounded-full bg-ink/70" />
        </>
      ) : (
        <span aria-hidden className="absolute left-1/2 top-[5px] z-10 h-[9px] w-[30px] -translate-x-1/2 rounded-full bg-black" />
      )}
      {children}
    </div>
  </div>
);

/** Repère vert posé directement sur l'élément à toucher dans le téléphone */
const MARK = 'rounded-[5px] ring-2 ring-lime ring-offset-1 ring-offset-white/0 shadow-[0_0_0_5px_rgba(166,226,46,0.25)]';

/** Loupe : la zone utile en grand */
const Loupe = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex size-[148px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-lime bg-[#f5f5f0] shadow-[0_16px_32px_-14px_rgba(20,20,15,0.45)]">
    {children}
  </div>
);

const Pair = ({ phone, loupe }: { phone: React.ReactNode; loupe: React.ReactNode }) => (
  <div className="flex items-center justify-center gap-4">
    {phone}
    <Loupe>{loupe}</Loupe>
  </div>
);

const ShareIcon = ({ size = 14 }: { size?: number }) => <Share size={size} strokeWidth={2} />;

/** Barre Safari (bas) */
const SafariBar = ({ big = false, mark = false }: { big?: boolean; mark?: boolean }) =>
  big ? (
    <div className="flex w-full items-center justify-around px-3" style={{ color: IOS_BLUE }}>
      <span className="text-[22px] leading-none">‹</span>
      <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-lime text-ink">
        <ShareIcon size={26} />
      </span>
      <Copy size={20} strokeWidth={1.8} />
    </div>
  ) : (
    <div className="absolute inset-x-0 bottom-0 flex h-[30px] items-start justify-around bg-[#f5f5f0]/95 pt-[6px] text-[9px]" style={{ color: IOS_BLUE }}>
      <span>‹</span>
      <span className="opacity-40">›</span>
      <span className={`-mt-[2px] p-[2px] ${mark ? MARK : ''}`}><ShareIcon size={11} /></span>
      <span>▢</span>
      <span>⧉</span>
    </div>
  );

const IosRow = ({ label, icon, active = false, big = false }: { label: string; icon: React.ReactNode; active?: boolean; big?: boolean }) => (
  <div
    className={`flex items-center justify-between ${big ? 'gap-1.5 px-2 py-2 text-[10.5px]' : 'px-1.5 py-[3px] text-[6px]'} ${
      active ? 'bg-[#eaf7cf] font-semibold text-black' : 'text-[#8e8e93]'
    }`}
  >
    <span className="whitespace-nowrap">{label}</span>
    <span className={active ? 'text-black' : ''}>{icon}</span>
  </div>
);

const ShareSheet = () => (
  <div className="absolute inset-x-0 bottom-0 rounded-t-[10px] bg-[#f2f2f7] pb-2 pt-1.5">
    <div className="mb-1.5 flex gap-1 px-1.5">
      {['#34c759', IOS_BLUE, '#ff9f0a', '#bf5af2'].map((c) => (
        <span key={c} className="size-[14px] rounded-[4px]" style={{ background: c }} />
      ))}
    </div>
    <div className="mx-1 overflow-hidden rounded-[6px] bg-white">
      <IosRow label="Copier" icon="⧉" />
      <IosRow label="Ajouter aux favoris" icon="☆" />
    </div>
    <div className={`mx-1 mt-1 overflow-hidden bg-white ${MARK}`}>
      <IosRow label="Sur l'écran d'accueil" icon={<SquarePlus size={7} strokeWidth={2} />} active />
    </div>
  </div>
);

const IosAddScreen = () => (
  <div className="absolute inset-0 bg-[#f2f2f7] pt-5">
    <div className="flex items-center justify-between whitespace-nowrap px-2 text-[7px]">
      <span style={{ color: IOS_BLUE }}>Annuler</span>
      <span className={`px-[3px] font-bold ${MARK}`} style={{ color: IOS_BLUE }}>Ajouter</span>
    </div>
    <div className="mx-2 mt-3 flex items-center gap-1.5 rounded-md bg-white p-1.5">
      <img src="/icon-192.png" alt="" className="size-6 rounded-[6px]" />
      <span className="text-[7px] font-medium">VIBE</span>
    </div>
  </div>
);

/** Barre Chrome (haut) */
const ChromeBar = ({ mark = false }: { mark?: boolean }) => (
  <div className="absolute inset-x-0 top-[16px] flex h-[20px] items-center gap-1 bg-white px-1.5">
    <span className="h-[12px] flex-1 rounded-full bg-[#f1f3f4]" />
    <span className={mark ? `rounded-full ${MARK}` : ''}><EllipsisVertical size={10} strokeWidth={2.2} className="text-[#3c4043]" /></span>
  </div>
);

const ChromeMenu = () => (
  <div className="absolute right-1 top-[18px] w-[80px] overflow-hidden rounded-md bg-white py-0.5 text-[6px] text-[#3c4043] shadow-[0_6px_16px_rgba(20,20,15,0.25)]">
    <div className="px-1.5 py-[3px]">Nouvel onglet</div>
    <div className="px-1.5 py-[3px]">Favoris</div>
    <div className={`bg-[#e8f0fe] px-1.5 py-[3px] font-semibold text-black ${MARK}`}>Installer l'application</div>
    <div className="px-1.5 py-[3px]">Paramètres</div>
  </div>
);

const ChromeDialog = () => (
  <>
    <div className="absolute inset-0 bg-ink/45" />
    <div className="absolute inset-x-1.5 top-[80px] rounded-[10px] bg-white p-2">
      <div className="flex items-center gap-1.5">
        <img src="/icon-192.png" alt="" className="size-5 rounded-[5px]" />
        <span className="whitespace-nowrap text-[6.5px] font-semibold text-[#1f1f1f]">Installer l'appli ?</span>
      </div>
      <div className="mt-2.5 flex justify-end gap-2 text-[6.5px] font-medium">
        <span className="py-0.5" style={{ color: ANDROID_BLUE }}>Annuler</span>
        <span className={`rounded-full px-2 py-0.5 text-white ${MARK} !rounded-full`} style={{ background: ANDROID_BLUE }}>Installer</span>
      </div>
    </div>
  </>
);

const IOS_STEPS = [
  {
    title: 'Touche Partager',
    hint: "L'icône carrée avec une flèche, dans la barre de Safari (ou « ⋯ » puis Partager).",
    visual: (
      <Pair
        phone={<MiniPhone><SafariBar mark /></MiniPhone>}
        loupe={<SafariBar big />}
      />
    ),
  },
  {
    title: "Choisis « Sur l'écran d'accueil »",
    hint: "Fais défiler la liste du menu Partager jusqu'à cette option.",
    visual: (
      <Pair
        phone={<MiniPhone><ShareSheet /></MiniPhone>}
        loupe={
          <div className="w-[118px] overflow-hidden rounded-xl bg-white">
            <IosRow big label="Favoris" icon="☆" />
            <IosRow big active label="Écran d'accueil" icon={<SquarePlus size={13} strokeWidth={2} />} />
          </div>
        }
      />
    ),
  },
  {
    title: 'Touche « Ajouter »',
    hint: "En haut à droite. L'icône VIBE apparaît sur ton écran d'accueil.",
    visual: (
      <Pair
        phone={<MiniPhone><IosAddScreen /></MiniPhone>}
        loupe={
          <div className="flex items-center gap-3 text-[14px]">
            <span style={{ color: IOS_BLUE }} className="opacity-60">Annuler</span>
            <span className="rounded-lg bg-lime px-2.5 py-1 font-bold" style={{ color: IOS_BLUE }}>Ajouter</span>
          </div>
        }
      />
    ),
  },
];

const ANDROID_STEPS = [
  {
    title: 'Ouvre le menu de Chrome',
    hint: 'Touche les trois points en haut à droite.',
    visual: (
      <Pair
        phone={<MiniPhone android><ChromeBar mark /></MiniPhone>}
        loupe={
          <div className="flex w-full items-center gap-2 bg-white px-3 py-3">
            <span className="h-8 flex-1 rounded-full bg-[#f1f3f4]" />
            <span className="flex size-10 items-center justify-center rounded-full bg-lime text-ink">
              <EllipsisVertical size={22} strokeWidth={2.2} />
            </span>
          </div>
        }
      />
    ),
  },
  {
    title: "Choisis « Installer l'application »",
    hint: "Selon ton téléphone, l'option s'appelle aussi « Ajouter à l'écran d'accueil ».",
    visual: (
      <Pair
        phone={<MiniPhone android><ChromeBar /><ChromeMenu /></MiniPhone>}
        loupe={
          <div className="w-[128px] overflow-hidden rounded-xl bg-white text-[11px] text-[#3c4043]">
            <div className="px-2.5 py-2">Favoris</div>
            <div className="flex items-center justify-between gap-1 bg-[#e8f0fe] px-2.5 py-2 font-semibold leading-tight text-black">
              Installer l'appli <Download size={13} strokeWidth={2} />
            </div>
          </div>
        }
      />
    ),
  },
  {
    title: 'Confirme avec « Installer »',
    hint: "VIBE rejoint tes applications et ton écran d'accueil.",
    visual: (
      <Pair
        phone={<MiniPhone android><ChromeDialog /></MiniPhone>}
        loupe={
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="opacity-60" style={{ color: ANDROID_BLUE }}>Annuler</span>
            <span className="rounded-full px-3 py-1.5 text-white ring-4 ring-lime" style={{ background: ANDROID_BLUE }}>Installer</span>
          </div>
        }
      />
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
  const [drag, setDrag] = useState(0);
  const touch = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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
      if (localStorage.getItem(INSTALLED_KEY)) return;
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
  const isLast = step === steps.length - 1;

  const switchTab = (k: 'ios' | 'android') => { setTab(k); setStep(0); };
  const go = (n: number) => setStep(Math.max(0, Math.min(steps.length - 1, n)));

  // Glissement qui suit le doigt, puis se cale sur l'étape (comme les apps natives)
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, horizontal: null };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    const dx = e.touches[0].clientX - t.x;
    const dy = e.touches[0].clientY - t.y;
    if (t.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) t.horizontal = Math.abs(dx) > Math.abs(dy);
    if (!t.horizontal) return;
    // Résistance aux extrémités
    const atEdge = (step === 0 && dx > 0) || (isLast && dx < 0);
    setDrag(atEdge ? dx / 3 : dx);
  };
  const onTouchEnd = () => {
    const t = touch.current;
    touch.current = null;
    if (t?.horizontal) {
      const width = trackRef.current?.offsetWidth ?? 320;
      if (drag < -width * 0.18) go(step + 1);
      else if (drag > width * 0.18) go(step - 1);
    }
    setDrag(0);
  };

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
      >
        <div className="overflow-y-auto overscroll-contain px-5 pt-5 pb-3">
          {/* En-tête */}
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="" className="size-11 rounded-[13px] border border-stone-200 object-cover" />
            <div className="min-w-0 flex-1">
              <h2 id="install-title" className="text-[22px] leading-none tracking-tighter text-ink">Installe VIBE</h2>
              <p className="mt-1 text-[12.5px] text-stone-500">Gratuit · sans store · 3 gestes</p>
            </div>
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
          <p className="eyebrow mt-5 text-stone-500">Étape {step + 1} sur {steps.length}</p>
          <div className="mt-2 flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Étape ${i + 1}`}
                onClick={() => go(i)}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-stone-200"
              >
                <span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Étapes : piste horizontale qui glisse */}
        <div
          ref={trackRef}
          className="relative overflow-hidden touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div
            key={tab}
            className="flex will-change-transform"
            style={{
              transform: `translate3d(calc(${-step * 100}% + ${drag}px), 0, 0)`,
              transition: drag ? 'none' : 'transform 520ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                aria-hidden={i !== step}
                className="w-full flex-shrink-0 px-5 pb-2 pt-2 transition-opacity duration-500"
                style={{ opacity: i === step ? 1 : 0.35 }}
              >
                {s.visual}
                <h3 className="mt-4 text-center font-display text-[22px] leading-[1.05] tracking-[-0.03em] text-ink">{s.title}</h3>
                <p className="mx-auto mt-1.5 max-w-[300px] text-center text-[13.5px] leading-snug text-stone-500">{s.hint}</p>
                {tab === 'ios' && i === steps.length - 1 && (
                  <p className="mx-auto mt-3 max-w-[320px] rounded-2xl bg-parchment px-3.5 py-2.5 text-center text-[11.5px] leading-snug text-stone-600">
                    Sur iPhone, les notifications ne fonctionnent qu'une fois l'app installée (iOS 16.4+).
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation (pas de fermeture : l'installation est requise) */}
        <div className="flex gap-2 px-5 pb-4 pt-3">
          <button
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="h-12 flex-1 rounded-full bg-parchment text-[15px] font-medium text-ink active:scale-[0.98] transition disabled:opacity-40"
          >
            ← Retour
          </button>
          <button
            onClick={() => (isLast ? go(0) : go(step + 1))}
            className="h-12 flex-[1.4] rounded-full bg-ink text-[15px] font-medium text-parchment active:scale-[0.98] transition"
          >
            {isLast ? 'Revoir les étapes' : 'Suivant →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
// eslint-disable-next-line react-refresh/only-export-components
export { isStandalone, detectOS };
