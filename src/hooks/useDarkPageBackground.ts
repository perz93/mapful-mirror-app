import { useEffect } from 'react';

/**
 * iOS teinte le flou de la barre d'état avec le fond de la page : sur les
 * pages avec une affiche en haut, un fond clair donnait un bandeau blanchâtre.
 */
export const useDarkPageBackground = (enabled = true) => {
  useEffect(() => {
    // Seulement une fois la page affichée : pendant le chargement et
    // l'animation d'entrée, le fond crème reste visible (pas de noir).
    if (!enabled) return;
    const root = document.documentElement;
    const prev = [root.style.backgroundColor, document.body.style.backgroundColor];
    const id = window.setTimeout(() => {
      root.style.backgroundColor = '#14140f';
      document.body.style.backgroundColor = '#14140f';
    }, 600);
    return () => {
      window.clearTimeout(id);
      root.style.backgroundColor = prev[0];
      document.body.style.backgroundColor = prev[1];
    };
  }, [enabled]);
};
