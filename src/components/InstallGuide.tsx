import { useState, useEffect, useCallback } from 'react';
import { Share, SquarePlus, EllipsisVertical, Download, BellRing, Maximize2, House, Copy, Check, AlertCircle } from 'lucide-react';

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
// Mini-maquettes des éléments à toucher (reconnaissables d'un coup d'œil)
// ------------------------------------------------------------------

const KeyIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-ink">
    {children}
  </span>
);

/** Ligne de menu façon iOS / Android. */
const MenuRow = ({ label, icon, accent = false }: { label: string; icon: React.ReactNode; accent?: boolean }) => (
  <span className="flex h-10 items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 text-[13px] font-medium text-ink">
    <span className={accent ? 'text-[#0a84ff]' : ''}>{label}</span>
    <span className="text-stone-500">{icon}</span>
  </span>
);

interface StepProps {
  n: number;
  title: string;
  hint: string;
  visual: React.ReactNode;
  last?: boolean;
}

const Step = ({ n, title, hint, visual, last }: StepProps) => (
  <li className="relative flex gap-4 pb-5 last:pb-0">
    {/* Fil de la timeline */}
    {!last && <span aria-hidden className="absolute left-[15px] top-9 bottom-1 w-px bg-stone-200" />}
    <span className="relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-parchment tabular">
      {n}
    </span>
    <div className="min-w-0 flex-1 pt-1">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-stone-500">{hint}</p>
      <div className="mt-2.5">{visual}</div>
    </div>
  </li>
);

// ------------------------------------------------------------------

const InstallGuide = () => {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [tab, setTab] = useState<'ios' | 'android'>('ios');
  const [deviceOS, setDeviceOS] = useState<OS>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="install-title">
      {/* Fond */}
      <div className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`} />

      {/* Feuille */}
      <div
        className={`relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:rounded-[28px] ${
          shown ? 'translate-y-0' : 'translate-y-full sm:translate-y-8'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="overflow-y-auto overscroll-contain px-5 pt-3 pb-5">
          <span aria-hidden className="mx-auto mb-5 block h-1 w-10 rounded-full bg-stone-200 sm:hidden" />

          {/* En-tête */}
          <div className="flex items-center gap-3.5">
            <img src="/icon-192.png" alt="" className="size-14 rounded-[16px] border border-stone-200 object-cover" />
            <div className="min-w-0">
              <p className="eyebrow text-stone-500">Application · Gratuit</p>
              <h2 id="install-title" className="text-[30px] leading-[0.95] tracking-tighter text-ink">Installe VIBE</h2>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-snug text-stone-600">
            Ajoute VIBE à ton écran d'accueil : elle s'ouvre comme une vraie app, sans passer par un store.
          </p>

          {/* Avantages */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: BellRing, label: 'Notifications' },
              { icon: Maximize2, label: 'Plein écran' },
              { icon: House, label: "Écran d'accueil" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-parchment px-2 py-3">
                <Icon size={18} strokeWidth={1.75} className="text-ink" />
                <span className="text-[12px] font-medium text-ink">{label}</span>
              </div>
            ))}
          </div>

          {/* iPhone / Android */}
          <div role="tablist" className="relative mt-5 grid grid-cols-2 rounded-full bg-parchment p-1">
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
                onClick={() => setTab(k)}
                className={`relative z-10 h-10 rounded-full text-sm font-medium transition-colors duration-300 ${tab === k ? 'text-parchment' : 'text-stone-600'}`}
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

          {/* Étapes */}
          <div key={tab} className="mt-5 animate-fade-in">
            {tab === 'ios' ? (
              <ol>
                <Step
                  n={1}
                  title="Ouvre le menu Partager"
                  hint="Dans Safari, touche l'icône Partager dans la barre du bas (ou « ⋯ » puis Partager)."
                  visual={<KeyIcon><Share size={17} strokeWidth={1.75} /></KeyIcon>}
                />
                <Step
                  n={2}
                  title="Sur l'écran d'accueil"
                  hint="Fais défiler la liste et choisis cette option."
                  visual={<MenuRow label="Sur l'écran d'accueil" icon={<SquarePlus size={17} strokeWidth={1.75} />} />}
                />
                <Step
                  n={3}
                  title="Confirme avec « Ajouter »"
                  hint="En haut à droite. L'icône VIBE apparaît sur ton écran d'accueil."
                  visual={<span className="inline-flex h-9 items-center rounded-xl border border-stone-200 bg-white px-3.5 text-[14px] font-semibold text-[#0a84ff]">Ajouter</span>}
                  last
                />
              </ol>
            ) : (
              <>
                {deferredPrompt && onThisDevice && (
                  <button
                    onClick={installAndroid}
                    className="mb-5 flex h-14 w-full items-center gap-3 rounded-full bg-lime pl-2 pr-5 text-ink hover:bg-lime-deep active:scale-[0.98] transition"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-ink text-lime">
                      <Download size={18} strokeWidth={1.75} />
                    </span>
                    <span className="flex-1 text-left text-[15px] font-medium">Installer en un tap</span>
                  </button>
                )}
                {deferredPrompt && onThisDevice && (
                  <p className="eyebrow mb-3 text-stone-400">Ou manuellement</p>
                )}
                <ol>
                  <Step
                    n={1}
                    title="Ouvre le menu de Chrome"
                    hint="Touche les trois points en haut à droite."
                    visual={<KeyIcon><EllipsisVertical size={17} strokeWidth={1.75} /></KeyIcon>}
                  />
                  <Step
                    n={2}
                    title="Installer l'application"
                    hint="Selon ton téléphone : « Installer l'application » ou « Ajouter à l'écran d'accueil »."
                    visual={<MenuRow label="Installer l'application" icon={<Download size={17} strokeWidth={1.75} />} />}
                  />
                  <Step
                    n={3}
                    title="Confirme avec « Installer »"
                    hint="VIBE rejoint tes applications et ton écran d'accueil."
                    visual={<span className="inline-flex h-9 items-center rounded-full bg-[#0b57d0] px-4 text-[13px] font-medium text-white">Installer</span>}
                    last
                  />
                </ol>
              </>
            )}
          </div>

          {/* Note notifications iPhone */}
          {tab === 'ios' && (
            <p className="mt-5 rounded-2xl bg-parchment px-3.5 py-3 text-[12px] leading-snug text-stone-600">
              <span className="font-medium text-ink">Bon à savoir :</span> sur iPhone, les notifications ne fonctionnent qu'une fois l'app installée (iOS 16.4 ou plus récent).
            </p>
          )}

          <button
            onClick={later}
            className="mt-4 h-11 w-full rounded-full text-[14px] font-medium text-stone-500 hover:text-ink transition-colors"
          >
            Continuer dans le navigateur
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
// eslint-disable-next-line react-refresh/only-export-components
export { isStandalone, detectOS };
