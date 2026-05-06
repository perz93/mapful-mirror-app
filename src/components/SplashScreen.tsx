import { useState, useEffect, useCallback } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 3000);
    const t2 = setTimeout(() => onFinish(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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
