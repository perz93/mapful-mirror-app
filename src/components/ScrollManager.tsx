import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'upvibe-scroll-positions';
const MAX_ENTRIES = 50;

const readStore = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, number>) => {
  try {
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) keys.slice(0, keys.length - MAX_ENTRIES).forEach((k) => delete store[k]);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* stockage indisponible */ }
};

/**
 * Position de défilement, page par page :
 * - retour arrière (ou avant) : on retrouve l'endroit où on était ;
 * - nouvelle page : on part du haut.
 * Le contenu (liste, images) arrive parfois après l'affichage : on réessaie
 * pendant un court moment, et on s'arrête dès que l'utilisateur fait défiler.
 */
const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef<Record<string, number>>(readStore());
  // Page à laquelle on attribue le défilement. Mise à jour AVANT de faire
  // défiler la nouvelle page : sinon le saut en haut de la page suivante
  // était enregistré sur la page qu'on quitte (retour en haut au 2e passage).
  const currentKey = useRef(location.key);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  // Mémorise la position de la page affichée pendant qu'on fait défiler
  useEffect(() => {
    let frame = 0;
    const save = () => {
      frame = 0;
      positions.current[currentKey.current] = window.scrollY;
      writeStore(positions.current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(save); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    currentKey.current = location.key;
    // Retour arrière (geste ou bouton) : pas d'animation d'entrée, la page
    // réapparaît telle qu'on l'avait laissée (sinon elle « scintille »)
    document.documentElement.classList.toggle('nav-pop', navigationType === 'POP');
    if (location.hash) return; // ancre (#faq…) : le navigateur s'en charge

    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
      return;
    }

    const target = positions.current[location.key] ?? 0;
    if (target <= 0) {
      window.scrollTo(0, 0);
      return;
    }

    let cancelled = false;
    let timer = 0;
    const stop = () => { cancelled = true; };
    // L'utilisateur reprend la main : on n'insiste plus
    window.addEventListener('touchstart', stop, { passive: true, once: true });
    window.addEventListener('wheel', stop, { passive: true, once: true });

    const started = performance.now();
    const attempt = () => {
      if (cancelled) return;
      const reachable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(target, Math.max(reachable, 0)));
      // La page n'est pas encore assez longue (liste en chargement) : on réessaie
      if (reachable < target && performance.now() - started < 2500) {
        timer = window.setTimeout(attempt, 60);
      }
    };
    attempt();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('wheel', stop);
    };
  }, [location.key, location.hash, navigationType]);

  return null;
};

export default ScrollManager;
