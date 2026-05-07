import { useState, useEffect, useCallback } from 'react';
import { Share, Plus, MoreVertical, Download, ChevronRight, Smartphone } from 'lucide-react';

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
    (navigator as any).standalone === true
  );
}

// ==========================================
// iOS Step Illustrations (animated)
// ==========================================

const IOSShareIcon = () => (
  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl bg-blue-500/15 border border-blue-500/20">
    <Share size={24} className="text-blue-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
      <span className="text-white text-[10px] font-bold">1</span>
    </div>
  </div>
);

const IOSAddIcon = () => (
  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl bg-green-500/15 border border-green-500/20">
    <Plus size={24} className="text-green-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
      <span className="text-white text-[10px] font-bold">2</span>
    </div>
  </div>
);

const IOSConfirmIcon = () => (
  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl bg-[#ee9d2b]/15 border border-[#ee9d2b]/20">
    <Smartphone size={24} className="text-[#ee9d2b]" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ee9d2b] flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
      <span className="text-white text-[10px] font-bold">3</span>
    </div>
  </div>
);

// ==========================================
// Android Step Illustrations
// ==========================================

const AndroidMenuIcon = () => (
  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl bg-green-500/15 border border-green-500/20">
    <MoreVertical size={24} className="text-green-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
      <span className="text-white text-[10px] font-bold">1</span>
    </div>
  </div>
);

const AndroidInstallIcon = () => (
  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl bg-[#ee9d2b]/15 border border-[#ee9d2b]/20">
    <Download size={24} className="text-[#ee9d2b]" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ee9d2b] flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
      <span className="text-white text-[10px] font-bold">2</span>
    </div>
  </div>
);

// ==========================================
// Step Component (glass style)
// ==========================================

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isActive: boolean;
}

const Step = ({ icon, title, description, delay, isActive }: StepProps) => (
  <div
    className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-500 ${
      isActive
        ? 'backdrop-blur-2xl bg-white/80 dark:bg-stone-900/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/60 dark:border-stone-700/30 scale-100 opacity-100'
        : 'backdrop-blur-2xl bg-white/40 dark:bg-stone-900/40 border border-white/60 dark:border-stone-700/20 scale-95 opacity-50'
    }`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {icon}
    <div className="flex-1">
      <p className="text-sm font-bold text-stone-900 dark:text-white">{title}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{description}</p>
    </div>
    {isActive && (
      <ChevronRight size={16} className="text-[#ee9d2b] animate-pulse" />
    )}
  </div>
);

// ==========================================
// Main Component
// ==========================================

const InstallGuide = () => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [os, setOs] = useState<OS>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture Android install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isStandalone()) return;

    // Don't show if user already installed before
    if (localStorage.getItem(INSTALLED_KEY)) return;

    const detectedOS = detectOS();
    if (detectedOS === 'unknown') return;
    setOs(detectedOS);

    // Show immediately
    setVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    });
  }, []);

  // Animate steps
  useEffect(() => {
    if (!animating) return;

    const maxSteps = os === 'ios' ? 3 : 2;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, 2500);

    return () => clearInterval(interval);
  }, [animating, os]);

  const handleInstallAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setAnimating(false);
      setTimeout(() => setVisible(false), 300);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop — no click to close */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Glass Card — EventCard style */}
      <div
        className={`relative w-full max-w-md mx-auto transition-all duration-700 ease-out ${
          animating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        <div className="rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-stone-900/80 border border-white/60 dark:border-stone-700/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Content */}
          <div className="px-5 py-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl backdrop-blur-xl bg-[#ee9d2b]/15 border border-[#ee9d2b]/20 mb-3 shadow-lg shadow-[#ee9d2b]/10">
                <Smartphone size={32} className="text-[#ee9d2b]" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Installe l'app !
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1.5">
                Ajoute Mapful à ton écran d'accueil pour profiter de toutes les fonctionnalités
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              {os === 'ios' ? (
                <>
                  <Step
                    icon={<IOSShareIcon />}
                    title="Appuie sur Partager"
                    description="L'icône ⬆ en bas de Safari"
                    delay={0}
                    isActive={activeStep === 0}
                  />
                  <Step
                    icon={<IOSAddIcon />}
                    title="Sur l'écran d'accueil"
                    description="Scrolle et appuie sur « Sur l'écran d'accueil »"
                    delay={100}
                    isActive={activeStep === 1}
                  />
                  <Step
                    icon={<IOSConfirmIcon />}
                    title="Ajouter"
                    description="Confirme en appuyant sur « Ajouter » en haut à droite"
                    delay={200}
                    isActive={activeStep === 2}
                  />
                </>
              ) : (
                <>
                  {deferredPrompt ? (
                    <button
                      onClick={handleInstallAndroid}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#ee9d2b] text-white shadow-lg shadow-[#ee9d2b]/30 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl">
                        <Download size={28} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-base font-bold">Installer l'application</p>
                        <p className="text-xs opacity-80 mt-0.5">Un tap et c'est fait !</p>
                      </div>
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <>
                      <Step
                        icon={<AndroidMenuIcon />}
                        title="Menu du navigateur"
                        description="Appuie sur ⋮ en haut à droite de Chrome"
                        delay={0}
                        isActive={activeStep === 0}
                      />
                      <Step
                        icon={<AndroidInstallIcon />}
                        title="Installer l'application"
                        description="Appuie sur « Installer l'application » ou « Ajouter à l'écran d'accueil »"
                        delay={100}
                        isActive={activeStep === 1}
                      />
                    </>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
export { isStandalone, detectOS };
