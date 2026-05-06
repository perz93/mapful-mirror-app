import { useState, useEffect, useCallback } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2600);
    const t5 = setTimeout(() => setPhase(5), 3400);

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
      className={`fixed inset-0 z-[200] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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

      {/* Content positioned in the glass card area (center of the image) */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 max-w-md mx-auto w-full">

        {/* Spacer — push content to the card zone (roughly 45-75% from top) */}
        <div className="flex-[0.52]" />

        {/* Logo — BIG */}
        <div
          className={`mb-5 transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-80'
          }`}
        >
          <img src="/vibe-logo.png" alt="VIBE" className="h-36 w-auto drop-shadow-xl" />
        </div>

        {/* Slogan — BIG */}
        <div
          className={`mb-3 transition-all duration-600 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-2xl text-center text-white font-semibold tracking-wide" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            Explore. Réserve. <span className="text-[#ee9d2b] italic">Vibrez.</span>
          </p>
        </div>

        {/* Sub text */}
        <div
          className={`transition-all duration-600 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-lg text-center text-white/90 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
            Tous les <span className="text-[#ee9d2b] font-bold">événements</span>.<br />
            Près de <span className="text-[#ee9d2b] font-bold">vous</span>.
          </p>
        </div>

        {/* Fill remaining space */}
        <div className="flex-[0.48]" />

        {/* Progress bar at bottom */}
        <div
          className={`w-full mb-8 transition-all duration-400 ${
            phase >= 5 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-center text-[11px] text-white/50 mb-2 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Chargement...</p>
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
