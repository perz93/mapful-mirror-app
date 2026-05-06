import { useState, useEffect, useCallback } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [bgVisible, setBgVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setBgVisible(true), 200);
    // Show logo + ALL texts together
    const t2 = setTimeout(() => setContentVisible(true), 1000);
    // Progress bar
    const t3 = setTimeout(() => setProgressVisible(true), 2500);
    const t4 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 4;
        });
      }, 25);
    }, 2700);
    // Exit
    const t5 = setTimeout(() => setExiting(true), 4500);
    const t6 = setTimeout(() => onFinish(), 5200);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
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
          bgVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.05]'
        }`}
        style={{ backgroundImage: "url('/splash-bg.jpg')" }}
      />

      {/* All content appears together, centered in the card zone */}
      <div
        className={`absolute inset-x-0 z-10 flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
          contentVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'
        }`}
        style={{ top: '40%', bottom: '18%' }}
      >
        {/* Logo */}
        <img
          src="/vibe-logo.png"
          alt="VIBE"
          className="drop-shadow-2xl mb-5"
          style={{ width: '65vw', maxWidth: '320px' }}
        />

        {/* Slogan */}
        <p
          className="text-[28px] text-center text-white font-bold tracking-wide mb-2"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 3px 24px rgba(0,0,0,0.6)' }}
        >
          Explore. Réserve. <span className="text-[#ee9d2b] italic">Vibrez.</span>
        </p>

        {/* Sub text */}
        <p
          className="text-[21px] text-center text-white/90 italic leading-relaxed"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
        >
          Tous les <span className="text-[#ee9d2b] font-bold">événements</span>.<br />
          Près de <span className="text-[#ee9d2b] font-bold">vous</span>.
        </p>
      </div>

      {/* Progress bar */}
      <div
        className={`absolute bottom-10 left-0 right-0 z-10 transition-all duration-500 ${
          progressVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-center text-[11px] text-white/50 mb-2 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Chargement...
        </p>
        <div className="w-40 mx-auto h-1 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ee9d2b] to-[#e08820]"
            style={{ width: `${progress}%`, transition: 'width 0.06s linear' }}
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
