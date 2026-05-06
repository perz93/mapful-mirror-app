import { useState, useEffect, useCallback } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);     // bg
    const t2 = setTimeout(() => setPhase(2), 1000);    // logo
    const t3 = setTimeout(() => setPhase(3), 1800);    // slogan
    const t4 = setTimeout(() => setPhase(4), 2600);    // sub text
    const t5 = setTimeout(() => setPhase(5), 3400);    // progress

    const t6 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 3;
        });
      }, 25);
    }, 3600);

    const t7 = setTimeout(() => setExiting(true), 5000);
    const t8 = setTimeout(() => onFinish(), 5700);

    return () => [t1, t2, t3, t4, t5, t6, t7, t8].forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.05]'
        }`}
        style={{ backgroundImage: "url('/splash-bg.jpg')" }}
      />

      {/* Content — logo + texts positioned in the glass card area of the image */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 max-w-md mx-auto w-full">
        {/* Push content to the card area (roughly center-bottom of image) */}
        <div className="flex-[1.1]" />

        {/* Logo */}
        <div
          className={`mb-4 transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-85'
          }`}
        >
          <img src="/vibe-logo.png" alt="VIBE" className="h-24 w-auto drop-shadow-lg" />
        </div>

        {/* Slogan */}
        <div
          className={`mb-2 transition-all duration-600 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-lg text-center text-white italic font-semibold tracking-wide" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            Explore. Réserve. <span className="text-[#ee9d2b]">Vibrez.</span>
          </p>
        </div>

        {/* Sub text */}
        <div
          className={`mb-6 transition-all duration-600 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm text-center text-white/80 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>
            Tous les <span className="text-[#ee9d2b] font-semibold">événements</span>.<br />
            Près de <span className="text-[#ee9d2b] font-semibold">vous</span>.
          </p>
        </div>

        <div className="flex-1" />

        {/* Progress bar */}
        <div
          className={`w-full mb-10 transition-all duration-400 ${
            phase >= 5 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-center text-[11px] text-white/60 mb-2 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Chargement...</p>
          <div className="w-40 mx-auto h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ee9d2b] to-[#e08820]"
              style={{ width: `${progress}%`, transition: 'width 0.08s linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SplashScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);

    if (isStandalone && !alreadyShown) {
      setShowSplash(true);
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    } else {
      setReady(true);
    }
  }, []);

  const handleFinish = useCallback(() => {
    setShowSplash(false);
    setReady(true);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleFinish} />}
      <div className={ready ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 0.3s' }}>
        {children}
      </div>
    </>
  );
};

export default SplashScreenWrapper;
