import { useEffect } from 'react';

const SPLASH_SHOWN_KEY = 'splash_shown_session';
/** Durée totale minimale du splash, comptée depuis l'ouverture de l'app
 *  (logo vers 1,8 s, image et trait vert vers 2,9 s). */
const MIN_SPLASH_MS = 3300;
/** Sur un téléphone lent, l'app arrive après l'animation : on laisse quand
 *  même un court instant avant de faire glisser le splash. */
const MIN_AFTER_READY_MS = 400;

const SplashScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const splash = document.getElementById('instant-splash');
    // Fond noir le temps du splash (barre d'état comprise), puis fond normal
    const endSplash = () => document.documentElement.classList.remove('splashing');
    if (!splash) { endSplash(); return; }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);

    if (!isStandalone || alreadyShown) {
      splash.remove();
      endSplash();
      return;
    }

    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    // L'app est déjà affichée sous le splash : quand il glisse, on la voit
    // directement (avant, elle restait invisible et laissait un écran noir).
    // Le temps compte depuis l'ouverture, pas depuis la fin du chargement,
    // sinon l'attente s'ajoutait au chargement sur les téléphones lents.
    const wait = Math.max(MIN_AFTER_READY_MS, MIN_SPLASH_MS - performance.now());
    let removeTimer = 0;
    const slideTimer = window.setTimeout(() => {
      endSplash();
      // Sortie en zoom : le splash grossit et s'efface, l'app apparaît derrière
      splash.style.transform = 'scale(1.35)';
      splash.style.opacity = '0';
      removeTimer = window.setTimeout(() => splash.remove(), 650);
    }, wait);
    return () => {
      window.clearTimeout(slideTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return <>{children}</>;
};

export default SplashScreenWrapper;
