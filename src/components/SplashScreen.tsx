import { useState, useEffect, useCallback } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);     // bg fade-in
    const t2 = setTimeout(() => setPhase(2), 1000);    // logo
    const t3 = setTimeout(() => setPhase(3), 1800);    // slogan
    const t4 = setTimeout(() => setPhase(4), 2600);    // sub text
    const t5 = setTimeout(() => setPhase(5), 3200);    // features
    const t6 = setTimeout(() => setPhase(6), 3800);    // button + progress

    // Progress bar
    const t7 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 3;
        });
      }, 25);
    }, 4000);

    // Exit — slide up
    const t8 = setTimeout(() => setExiting(true), 5200);
    const t9 = setTimeout(() => onFinish(), 5900);

    return () => [t1, t2, t3, t4, t5, t6, t7, t8, t9].forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Background image */}
      <div
        className={`absolute inset-0 bg-cover bg-top bg-no-repeat transition-all duration-1200 ease-out ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.08]'
        }`}
        style={{ backgroundImage: "url('/splash-bg.jpg')" }}
      />

      {/* Gradient overlay bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-10 px-6 max-w-md mx-auto w-full">

        {/* Logo VOBE */}
        <div
          className={`mb-2 transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90'
          }`}
        >
          <img src="/vobe-logo.png" alt="VOBE" className="h-20 w-auto" />
        </div>

        {/* Slogan */}
        <div
          className={`mb-2 transition-all duration-600 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-base font-medium text-stone-700 tracking-wide text-center">
            Explore. Réserve. <span className="text-[#ee9d2b] font-bold italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Vibrez.</span>
          </p>
        </div>

        {/* Sub text */}
        <div
          className={`mb-6 transition-all duration-600 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm text-center text-stone-500">
            Tous les <span className="text-[#ee9d2b] font-semibold">événements</span>.<br />
            Près de <span className="text-[#ee9d2b] font-semibold">vous</span>.
          </p>
        </div>

        {/* Features row */}
        <div
          className={`w-full mb-4 transition-all duration-600 ease-out ${
            phase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="backdrop-blur-2xl bg-white/60 border border-white/70 rounded-2xl p-3.5 shadow-sm">
            <div className="grid grid-cols-4 gap-1">
              {[
                { icon: '📍', title: 'Événements', sub: 'près de vous' },
                { icon: '🛒', title: 'Marketplace', sub: 'local' },
                { icon: '✨', title: 'Expériences', sub: 'uniques' },
                { icon: '📅', title: 'Vivez', sub: 'à fond' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-0.5">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-[10px] font-bold text-stone-700 leading-tight">{item.title}</p>
                  <p className="text-[8px] text-stone-400 leading-tight">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`w-full mb-5 transition-all duration-500 ease-out ${
            phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="w-full h-11 rounded-full bg-gradient-to-r from-[#ee9d2b] to-[#e08820] flex items-center justify-center shadow-lg shadow-[#ee9d2b]/25">
            <span className="text-white font-semibold text-sm">Découvrir les événements</span>
            <span className="text-white/80 ml-1.5 text-lg">›</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={`w-full transition-all duration-400 ${
            phase >= 6 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-center text-[11px] text-stone-400 mb-1.5">Chargement...</p>
          <div className="w-48 mx-auto h-1 rounded-full bg-stone-200/60 overflow-hidden">
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
