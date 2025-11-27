import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useStatusBarColor = () => {
  const location = useLocation();

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // La barre d'état est toujours transparente sur toutes les pages
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 'transparent');
    }
  }, [location.pathname]);
};
