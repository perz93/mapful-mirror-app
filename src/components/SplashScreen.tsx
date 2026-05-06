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

      {/* Content — positioned exactly in the glass card zone (45%-78% of screen) */}
      <div className="absolute left-0 right-0 z-10 flex flex-col items-center justify-center px-8" style={{ top: '44%', bottom: '22%' }}>

        {/* Logo — full width of card */}
        <div
          className={`mb-5 transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-75'
          }`}
        >
          <img src="/vibe-logo.png" alt="VIBE" className="w-72 max-w-[80vw] drop-shadow-xl" />
        </div>

        {/* Slogan */}
        <div
          className={`mb-3 transition-all duration-600 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-[26px] text-center text-white font-semibold tracking-wide" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 3px 20px rgba(0,0,0,0.5)' }}>
            Explore. Réserve. <span className="text-[#ee9d2b] italic">Vibrez.</span>
          </p>
        </div>

        {/* Sub text */}
        <div
          className={`transition-all duration-600 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-[20px] text-center text-white/90 italic leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            Tous les <span className="text-[#ee9d2b] font-bold">événements</span>.<br />
            Près de <span className="text-[#ee9d2b] font-bold">vous</span>.
          </p>
        </div>
      </div>

      {/* Progress bar — fixed at bottom */}
      <div
        className={`absolute bottom-8 left-0 right-0 z-10 transition-all duration-400 ${
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
