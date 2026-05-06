import { useEffect, useCallback, useState } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';

const SplashScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const splash = document.getElementById('instant-splash');
    if (!splash) { setReady(true); return; }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);

    if (isStandalone && !alreadyShown) {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
      // Hold 3s then slide up
      setTimeout(() => {
        splash.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          splash.remove();
          setReady(true);
        }, 700);
      }, 3000);
    } else {
      // No splash — remove immediately
      splash.remove();
      setReady(true);
    }
  }, []);

  return (
    <div className={ready ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 0.3s' }}>
      {children}
    </div>
  );
};

export default SplashScreenWrapper;
