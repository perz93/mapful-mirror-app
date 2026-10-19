import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Bouton « carte » flottant et intelligent : il n'apparaît que lorsqu'un simple « retour »
 * ne ramène pas à la carte (on s'est enfoncé de plusieurs pages, ou on est arrivé
 * directement sur une page via un lien). Il revient alors à la carte en un geste.
 *
 * On suit la pile des pages visitées dans l'app : PUSH empile, POP dépile (retour),
 * REPLACE remplace le sommet.
 */
const HomeFab = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const stackRef = useRef<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);

  useEffect(() => {
    const s = stackRef.current;
    const path = location.pathname;
    if (s.length === 0) s.push(path);
    else if (navType === 'PUSH') s.push(path);
    else if (navType === 'REPLACE') s[s.length - 1] = path;
    else {
      // POP : en général un retour ; on revient à la dernière occurrence de cette page
      const idx = s.lastIndexOf(path);
      if (idx >= 0) s.length = idx + 1;
      else s.splice(0, s.length, path);
    }
    setStack([...s]);
  }, [location.key, location.pathname, navType]);

  const here = stack[stack.length - 1];
  const previous = stack[stack.length - 2];
  // Pas sur la page de connexion : elle a déjà son bouton fermer, et le bouton gênerait le formulaire
  const visible = !!here && here !== '/' && here !== '/auth' && previous !== '/';
  if (!visible) return null;

  const goHome = () => {
    // Si la carte est plus bas dans la pile, on y revient (l'historique reste propre) ;
    // sinon (arrivée par un lien), on l'ouvre.
    const mapIdx = stack.lastIndexOf('/');
    if (mapIdx >= 0) navigate(mapIdx - (stack.length - 1));
    else navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={goHome}
      aria-label={lang === 'fr' ? 'Retour à la carte' : 'Back to map'}
      className="map-shadow fixed right-4 z-50 flex size-12 items-center justify-center rounded-full bg-ink text-lime animate-scale-in active:scale-95 transition-transform"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}
    >
      <MapIcon size={20} strokeWidth={1.75} />
    </button>
  );
};

export default HomeFab;
