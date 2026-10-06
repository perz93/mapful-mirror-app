import { useEffect } from 'react';

/**
 * iOS teinte le flou de la barre d'état avec le fond de la page : sur les
 * pages avec une affiche en haut, un fond clair donnait un bandeau blanchâtre.
 */
export const useDarkPageBackground = () => {
  useEffect(() => {
    const root = document.documentElement;
    const prev = [root.style.backgroundColor, document.body.style.backgroundColor];
    root.style.backgroundColor = '#14140f';
    document.body.style.backgroundColor = '#14140f';
    return () => {
      root.style.backgroundColor = prev[0];
      document.body.style.backgroundColor = prev[1];
    };
  }, []);
};
