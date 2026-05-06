import { useState, useEffect } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase timeline
    const t1 = setTimeout(() => setPhase(1), 300);    // bg visible
    const t2 = setTimeout(() => setPhase(2), 800);    // logo VOBE
    const t3 = setTimeout(() => setPhase(3), 1600);   // slogan
    const t4 = setTimeout(() => setPhase(4), 2400);   // features + button
    const t5 = setTimeout(() => setPhase(5), 3000);   // progress bar

    // Progress bar animation
    const t6 = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
    }, 3200);

    // Exit
    const t7 = setTimeout(() => {
      setExiting(true);
    }, 5000);

    const t8 = setTimeout(() => {
      onFinish();
    }, 5600);

    return () => {
      [t1, t2, t3, t4, t5, t6, t7, t8].forEach(clearTimeout);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden transition-all duration-600 ${
        exiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        }`}
        style={{ backgroundImage: "url('/splash-bg.jpg')" }}
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/80" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 w-full max-w-md mx-auto">
        {/* Spacer to push content down */}
        <div className="flex-1" />

        {/* Logo VOBE */}
        <div
          className={`transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'
          }`}
        >
          <h1 className="text-7xl font-black text-white tracking-tight" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            V<span className="text-[#ee9d2b]">O</span>BE
          </h1>
        </div>

        {/* Slogan */}
        <div
          className={`mt-3 transition-all duration-600 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-base font-medium text-white/90 tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Explore. Réserve. <span className="text-[#ee9d2b] font-bold italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Vibrez.</span>
          </p>
        </div>

        {/* Sub text */}
        <div
          className={`mt-4 transition-all duration-600 ease-out delay-100 ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-sm text-center text-white/70" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
            Tous les <span className="text-[#ee9d2b] font-semibold">événements</span>.<br />
            Près de <span className="text-[#ee9d2b] font-semibold">vous</span>.
          </p>
        </div>

        <div className="flex-1" />

        {/* Features row */}
        <div
          className={`w-full transition-all duration-600 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="backdrop-blur-2xl bg-white/70 border border-white/60 rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '📍', title: 'Événements', sub: 'près de vous' },
                { icon: '🛒', title: 'Marketplace', sub: 'local' },
                { icon: '✨', title: 'Expériences', sub: 'uniques' },
                { icon: '📅', title: 'Vivez', sub: 'à fond' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-1"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-[10px] font-bold text-stone-800 leading-tight">{item.title}</p>
                  <p className="text-[9px] text-stone-500 leading-tight">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`w-full mt-4 transition-all duration-500 ease-out ${
            phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="w-full h-12 rounded-full bg-gradient-to-r from-[#ee9d2b] to-[#e08820] flex items-center justify-center shadow-lg shadow-[#ee9d2b]/30">
            <span className="text-white font-semibold text-sm">Découvrir les événements</span>
            <span className="text-white ml-2">›</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={`w-full mt-6 mb-8 transition-all duration-400 ${
            phase >= 5 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-center text-xs text-stone-500 mb-2">Chargement...</p>
          <div className="w-full h-1 rounded-full bg-stone-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ee9d2b] to-[#e08820] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper that handles session check
const SplashScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only show in standalone PWA mode AND only once per session
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

  const handleFinish = () => {
    setShowSplash(false);
    setReady(true);
  };

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
