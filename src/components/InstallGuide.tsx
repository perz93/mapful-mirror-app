import { useState, useEffect, useCallback } from 'react';
import { X, Share, Plus, MoreVertical, Download, ChevronRight, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'install_guide_dismissed';
const INSTALL_PROMPT_KEY = 'install_guide_shown_count';

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
// iOS Step Illustrations (animated SVGs)
// ==========================================

const IOSShareIcon = () => (
  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20">
    <Share size={28} className="text-blue-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
      <span className="text-white text-[10px] font-bold">1</span>
    </div>
  </div>
);

const IOSAddIcon = () => (
  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20">
    <Plus size={28} className="text-green-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
      <span className="text-white text-[10px] font-bold">2</span>
    </div>
  </div>
);

const IOSConfirmIcon = () => (
  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ee9d2b]/10 border border-[#ee9d2b]/20">
    <Smartphone size={28} className="text-[#ee9d2b]" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ee9d2b] flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
      <span className="text-white text-[10px] font-bold">3</span>
    </div>
  </div>
);

// ==========================================
// Android Step Illustrations
// ==========================================

const AndroidMenuIcon = () => (
  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20">
    <MoreVertical size={28} className="text-green-500" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
      <span className="text-white text-[10px] font-bold">1</span>
    </div>
  </div>
);

const AndroidInstallIcon = () => (
  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ee9d2b]/10 border border-[#ee9d2b]/20">
    <Download size={28} className="text-[#ee9d2b]" />
    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ee9d2b] flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
      <span className="text-white text-[10px] font-bold">2</span>
    </div>
  </div>
);

// ==========================================
// Step Component
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
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
      isActive
        ? 'bg-white/80 dark:bg-stone-800/80 shadow-lg scale-100 opacity-100'
        : 'bg-white/40 dark:bg-stone-800/40 scale-95 opacity-60'
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

    const detectedOS = detectOS();
    if (detectedOS === 'unknown') return;
    setOs(detectedOS);

    // Check if dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Re-show after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show count check (max 3 times)
    const count = parseInt(localStorage.getItem(INSTALL_PROMPT_KEY) || '0');
    if (count >= 3) return;

    // Show after 8 seconds
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(INSTALL_PROMPT_KEY, String(count + 1));
      setTimeout(() => setAnimating(true), 50);
    }, 8000);

    return () => clearTimeout(timer);
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

  const handleClose = useCallback(() => {
    setAnimating(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setTimeout(() => setVisible(false), 300);
  }, []);

  const handleInstallAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      handleClose();
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, handleClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`relative w-full max-w-md mx-auto transition-all duration-500 ease-out ${
          animating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="mx-3 mb-3 rounded-3xl backdrop-blur-2xl bg-stone-50/95 dark:bg-stone-900/95 border border-white/20 dark:border-stone-700/30 shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-4 h-8 w-8 rounded-full bg-stone-200/80 dark:bg-stone-700/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <X size={14} className="text-stone-500" />
          </button>

          {/* Content */}
          <div className="px-5 pb-6 pt-2">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ee9d2b]/10 mb-3">
                <Smartphone size={28} className="text-[#ee9d2b]" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                Installe l'app !
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Ajoute Mapful à ton écran d'accueil pour un accès rapide
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
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#ee9d2b] text-white shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
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

            {/* Benefits */}
            <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-stone-400 dark:text-stone-500">
              <span className="flex items-center gap-1">⚡ Plus rapide</span>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="flex items-center gap-1">🔔 Notifications</span>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="flex items-center gap-1">📱 Plein écran</span>
            </div>

            {/* Later button */}
            <button
              onClick={handleClose}
              className="w-full mt-4 py-2.5 rounded-full text-sm font-medium text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
export { isStandalone, detectOS };
