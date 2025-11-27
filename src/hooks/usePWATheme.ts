import { useEffect } from 'react';

export const usePWATheme = () => {
  useEffect(() => {
    // Détecter si l'app est en mode PWA (standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    if (isPWA) {
      // Forcer le thème clair en mode PWA
      document.documentElement.classList.remove('dark');
      
      // Observer les changements de classe et empêcher l'activation du mode sombre
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.remove('dark');
            }
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, []);
};
