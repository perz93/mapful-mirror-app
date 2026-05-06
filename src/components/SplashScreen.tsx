import { useState, useEffect } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);     // image visible
    const t2 = setTimeout(() => setPhase(2), 3500);     // start exit
    const t3 = setTimeout(() => {
      setExiting(true);
    }, 4500);
    const t4 = setTimeout(() => {
      onFinish();
    }, 5200);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] transition-all duration-700 ease-out ${
        exiting ? 'opacity-0 translate-y-[-30px] scale-[1.02]' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      {/* Full image as splash — the image already contains all the text/UI */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.05]'
        }`}
        style={{ backgroundImage: "url('/splash-bg.jpg')" }}
      />
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
