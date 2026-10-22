import { useState, useEffect, useCallback, useRef } from 'react';
import { Share, SquarePlus, EllipsisVertical, Download, Copy, Check, AlertCircle, MapPin, BellRing, Megaphone, Store, X } from 'lucide-react';

const INSTALLED_KEY = 'pwa_installed';
const OPEN_EVENT = 'upvibe:install';

/** Ouvre le guide d'installation (depuis n'importe quel bouton « Installer ») */
const openInstallGuide = () => window.dispatchEvent(new Event(OPEN_EVENT));

type OS = 'ios' | 'android' | 'unknown';

function detectOS(): OS {
  const ua = navigator.userAgent || '';
  // Téléphones uniquement : pas d'installation proposée sur tablette ni ordinateur
  if (/iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua) && /mobile/i.test(ua)) return 'android';
  return 'unknown';
}

/** Avantages affichés sous « Installe Upvibe » : pour ceux qui sortent et pour ceux qui publient */
const PERKS = [
  { icon: MapPin, strong: 'Les sorties', rest: 'autour de toi' },
  { icon: BellRing, strong: 'Alertes', rest: 'près de chez toi' },
  { icon: Megaphone, strong: 'Publie', rest: 'ton event en 2 min' },
  { icon: Store, strong: 'Propose', rest: 'tes services' },
];

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
// Illustration « T2 » : vrai iPhone (format haut) avec une capture de Upvibe,
// et une loupe qui grossit l'endroit exact à toucher.
// ------------------------------------------------------------------

const IOS_BLUE = '#0a84ff';
const ANDROID_BLUE = '#0b57d0';

/** Téléphone miniature avec une vraie page Upvibe : iPhone (Dynamic Island) ou Android (caméra « poinçon ») */
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

/** Icône « ≡ » du menu de la page, à gauche de l'adresse dans Safari (iOS 26) */
const PageMenuIcon = ({ size = 10 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
    <path d="M5 7h14M5 12h14M5 17h9" />
  </svg>
);

/** Barre Safari d'iOS 26 (bas) : ‹  [≡ upvibe.app ⟳]  ⧉ */
const SafariBar = ({ big = false, mark = false }: { big?: boolean; mark?: boolean }) =>
  big ? (
    <div className="flex w-full items-center gap-1.5 px-2 text-black">
      <span className="flex h-10 flex-1 items-center gap-1.5 rounded-full bg-white pl-1 pr-2.5 text-[12px] font-medium">
        <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-lime text-ink"><PageMenuIcon size={17} /></span>
        upvibe.app
      </span>
    </div>
  ) : (
    <div className="absolute inset-x-0 bottom-[3px] flex items-center gap-[3px] px-[4px] text-[7px] text-black">
      <span className="flex size-[16px] flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">‹</span>
      <span className="flex h-[16px] flex-1 items-center gap-[3px] rounded-full bg-white/95 px-[4px] text-[5.5px] font-medium shadow-sm">
        <span className={`flex-shrink-0 rounded-full p-[1px] ${mark ? MARK : ''}`}><PageMenuIcon size={7} /></span>
        upvibe.app
      </span>
      <span className="flex size-[16px] flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm"><Copy size={7} strokeWidth={2} /></span>
    </div>
  );

/** Ligne de menu iOS (icône à gauche, comme dans Safari 26) */
const IosRow = ({ label, icon, active = false, big = false }: { label: string; icon: React.ReactNode; active?: boolean; big?: boolean }) => (
  <div
    className={`flex items-center ${big ? 'gap-2 px-2.5 py-2 text-[11px]' : 'gap-1 px-1.5 py-[3px] text-[6px]'} ${
      active ? 'bg-[#eaf7cf] font-semibold text-black' : 'text-[#3c3c43]'
    }`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="whitespace-nowrap">{label}</span>
  </div>
);

/** Menu ≡ de Safari : Traduire, Partager, Signets… */
const PageMenu = () => (
  <div className="absolute inset-x-[6px] bottom-[24px] overflow-hidden rounded-[10px] bg-white/95 py-[2px] shadow-[0_6px_16px_rgba(20,20,15,0.25)]">
    <IosRow label="Traduire" icon="文" />
    <div className={MARK}><IosRow label="Partager" icon={<Share size={6} strokeWidth={2} />} active /></div>
    <IosRow label="Ajouter à Signets" icon="▯" />
    <IosRow label="Rechercher" icon="⌕" />
  </div>
);

/** Feuille Partager ouverte (« En voir plus » déplié) */
const ShareSheet = () => (
  <div className="absolute inset-x-0 bottom-0 rounded-t-[10px] bg-[#f2f2f7] pb-2 pt-1.5">
    <div className="mb-1.5 flex justify-between px-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`size-[16px] rounded-full ${i === 3 ? `flex items-center justify-center bg-white text-[7px] ${MARK}` : 'bg-[#e6e3d3]'}`}>{i === 3 ? '⌄' : ''}</span>
      ))}
    </div>
    <div className="mx-1 overflow-hidden rounded-[6px] bg-white">
      <IosRow label="Ajouter aux favoris" icon="☆" />
      <IosRow label="Rechercher" icon="⌕" />
    </div>
    <div className={`mx-1 mt-1 overflow-hidden bg-white ${MARK}`}>
      <IosRow label="Sur l'écran d'accueil" icon={<SquarePlus size={7} strokeWidth={2} />} active />
    </div>
  </div>
);

/** Interrupteur iOS */
const IosToggle = ({ big = false }: { big?: boolean }) => (
  <span className={`relative inline-block flex-shrink-0 rounded-full bg-[#34c759] ${big ? 'h-[22px] w-[38px]' : 'h-[8px] w-[14px]'}`}>
    <span className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow ${big ? 'right-[2px] size-[18px]' : 'right-[1px] size-[6px]'}`} />
  </span>
);

const IosAddScreen = () => (
  <div className="absolute inset-0 bg-[#f2f2f7] pt-5">
    <div className="flex items-center justify-between whitespace-nowrap px-2 text-[7px]">
      <span style={{ color: IOS_BLUE }}>Annuler</span>
      <span className={`px-[3px] font-bold ${MARK}`} style={{ color: IOS_BLUE }}>Ajouter</span>
    </div>
    <div className="mx-2 mt-3 flex items-center gap-1.5 rounded-md bg-white p-1.5">
      <img src="/icon-192.png" alt="" className="size-6 rounded-[6px]" />
      <span className="text-[7px] font-medium">Upvibe</span>
    </div>
    <div className={`mx-2 mt-1.5 flex items-center justify-between rounded-md bg-white px-1.5 py-1 text-[5.5px] font-medium ${MARK}`}>
      Ouvrir comme app web <IosToggle />
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

/** Menu Chrome (version 150 et +) : rangée d'icônes en haut, puis la liste */
const ChromeMenu = () => (
  <div className="absolute right-1 top-[18px] w-[84px] overflow-hidden rounded-md bg-white py-0.5 text-[6px] text-[#3c4043] shadow-[0_6px_16px_rgba(20,20,15,0.25)]">
    <div className="flex items-center justify-between border-b border-[#e8eaed] px-1.5 pb-[3px] pt-[2px] text-[7px] leading-none">
      <span>←</span><span className="opacity-40">→</span><span>☆</span><span>⤓</span><span>⋯</span>
    </div>
    <div className="px-1.5 py-[3px]">Nouvel onglet</div>
    <div className="px-1.5 py-[3px]">Historique</div>
    <div className={`bg-[#e8f0fe] px-1.5 py-[3px] font-semibold leading-tight text-black ${MARK}`}>Installer et créer un raccourci</div>
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
    title: 'Touche ≡ dans la barre d\'adresse',
    hint: "En bas de Safari, à gauche de « upvibe.app ». Sur un iPhone plus ancien, touche directement Partager.",
    visual: (
      <Pair
        phone={<MiniPhone><SafariBar mark /></MiniPhone>}
        loupe={<SafariBar big />}
      />
    ),
  },
  {
    title: 'Touche « Partager »',
    hint: 'Dans le menu qui s\'ouvre, juste sous « Traduire ».',
    visual: (
      <Pair
        phone={<MiniPhone><PageMenu /></MiniPhone>}
        loupe={
          <div className="w-[122px] overflow-hidden rounded-xl bg-white">
            <IosRow big label="Traduire" icon="文" />
            <IosRow big active label="Partager" icon={<Share size={13} strokeWidth={2} />} />
          </div>
        }
      />
    ),
  },
  {
    title: "« En voir plus », puis « Sur l'écran d'accueil »",
    hint: "Touche le rond « En voir plus » (flèche vers le bas) pour déplier la liste.",
    visual: (
      <Pair
        phone={<MiniPhone><ShareSheet /></MiniPhone>}
        loupe={
          <div className="flex w-[124px] flex-col items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-[16px] ring-2 ring-lime">⌄</span>
            <div className="w-full overflow-hidden rounded-xl bg-white">
              <IosRow big active label="Écran d'accueil" icon={<SquarePlus size={13} strokeWidth={2} />} />
            </div>
          </div>
        }
      />
    ),
  },
  {
    title: 'Laisse « Ouvrir comme app web », puis « Ajouter »',
    hint: "L'interrupteur doit rester vert. L'icône Upvibe apparaît sur ton écran d'accueil.",
    visual: (
      <Pair
        phone={<MiniPhone><IosAddScreen /></MiniPhone>}
        loupe={
          <div className="flex w-[124px] flex-col items-center gap-2.5">
            <div className="flex w-full items-center justify-between rounded-xl bg-white px-2 py-2 text-[10px] font-medium leading-tight">
              App web <IosToggle big />
            </div>
            <span className="rounded-lg bg-lime px-2.5 py-1 text-[14px] font-bold" style={{ color: IOS_BLUE }}>Ajouter</span>
          </div>
        }
      />
    ),
  },
];

const ANDROID_STEPS = [
  {
    title: 'Ouvre le menu de Chrome',
    hint: "Touche les trois points ⋮ à droite de la barre d'adresse.",
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
    title: "Choisis « Installer et créer un raccourci »",
    hint: "Fais défiler le menu si besoin. Sur un Chrome plus ancien : « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
    visual: (
      <Pair
        phone={<MiniPhone android><ChromeBar /><ChromeMenu /></MiniPhone>}
        loupe={
          <div className="w-[128px] overflow-hidden rounded-xl bg-white text-[11px] text-[#3c4043]">
            <div className="px-2.5 py-2">Historique</div>
            <div className="flex items-center justify-between gap-1 bg-[#e8f0fe] px-2.5 py-2 font-semibold leading-tight text-black">
              Installer et créer un raccourci <Download size={13} strokeWidth={2} className="flex-shrink-0" />
            </div>
          </div>
        }
      />
    ),
  },
  {
    title: 'Confirme avec « Installer »',
    hint: "Ou « Ajouter », selon ton téléphone. Upvibe rejoint tes applications et ton écran d'accueil.",
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

  const open = useCallback((os: OS) => {
    setDeviceOS(os);
    setTab(os === 'android' ? 'android' : 'ios');
    setStep(0);
    setVisible(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  // Ouverture automatique sur téléphone, sauf sur la page vitrine (« / »)
  // qui a ses propres boutons d'installation
  useEffect(() => {
    if (isStandalone() || window.location.pathname === '/') return;
    try {
      if (localStorage.getItem(INSTALLED_KEY)) return;
    } catch { /* stockage indisponible : on affiche */ }

    const os = detectOS();
    if (os === 'unknown') return;
    open(os);
  }, [open]);

  // Ouverture à la demande (boutons « Installer » de la page vitrine)
  useEffect(() => {
    const onRequest = () => {
      if (!isStandalone()) open(detectOS());
    };
    window.addEventListener(OPEN_EVENT, onRequest);
    return () => window.removeEventListener(OPEN_EVENT, onRequest);
  }, [open]);

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
      <div onClick={close} className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`} />

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
              <h2 id="install-title" className="text-[22px] leading-none tracking-tighter text-ink">Installe Upvibe</h2>
              <p className="mt-1 text-[12.5px] text-stone-500">Gratuit · sans store · 1 minute</p>
            </div>
            <button type="button" onClick={close} aria-label="Fermer" className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-parchment text-ink active:scale-95">
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Ce que Upvibe apporte (modèle B : une ligne d'icônes) */}
          <ul className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[11px] leading-[1.2] text-stone-500">
            {PERKS.map(({ icon: Icon, strong, rest }) => (
              <li key={strong} className="flex flex-col items-center gap-1.5">
                <span className="flex size-10 items-center justify-center rounded-full bg-parchment text-ink">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span>
                  <span className="font-semibold text-ink">{strong}</span> {rest}
                </span>
              </li>
            ))}
          </ul>

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
export { isStandalone, detectOS, openInstallGuide };
