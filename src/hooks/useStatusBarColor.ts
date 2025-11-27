import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useStatusBarColor = () => {
  const location = useLocation();

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // Sur la page index (map), la barre d'état est transparente
    if (location.pathname === '/') {
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', 'transparent');
      }
    } else {
      // Sur toutes les autres pages, la barre d'état est blanche
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff');
      }
    }
  }, [location.pathname]);
};
