import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LargeTitleProps {
  children: ReactNode;
  className?: string;
  /** Titre court de la barre compacte (par défaut : le contenu du grand titre s'il est du texte) */
  compactTitle?: string;
  /** Destination du bouton retour de la barre compacte ; sinon page précédente */
  backTo?: string;
  /** Action à droite de la barre compacte (facultatif) */
  right?: ReactNode;
}

/**
 * Grand titre de page qui « se rétracte » au défilement : quand il sort de
 * l'écran, une barre compacte (retour + titre centré) apparaît en haut,
 * comme dans les apps iOS.
 */
const LargeTitle = ({ children, className = '', compactTitle, backTo, right }: LargeTitleProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Barre ≈ 60 px sous la zone de sécurité : le titre « passe dessous »
    const io = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting && entry.boundingClientRect.top < 120),
      { rootMargin: '-72px 0px 0px 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const label = compactTitle ?? (typeof children === 'string' ? children : '');
  const backClass =
    'inline-flex size-12 btn-float flex-shrink-0 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform';

  const bar = (
    <div
      aria-hidden={!collapsed}
      className={`fixed inset-x-0 top-0 z-40 mx-auto max-w-md border-b bg-parchment/90 backdrop-blur-md transition-[opacity,transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        collapsed
          ? 'translate-y-0 opacity-100 border-stone-200'
          : 'pointer-events-none -translate-y-2 opacity-0 border-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="relative flex h-14 items-center justify-between px-4">
        {backTo ? (
          <Link to={backTo} aria-label="Retour" tabIndex={collapsed ? 0 : -1} className={backClass}>
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
        ) : (
          <button type="button" onClick={() => navigate(-1)} aria-label="Retour" tabIndex={collapsed ? 0 : -1} className={backClass}>
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
        )}
        <p className="pointer-events-none absolute inset-x-16 truncate text-center font-display text-[18px] leading-none tracking-[-0.025em] text-ink">
          {label}
        </p>
        <div className="flex min-w-10 justify-end">{right}</div>
      </div>
    </div>
  );

  return (
    <>
      <h1 ref={ref} className={className}>
        {children}
      </h1>
      {typeof document !== 'undefined' && createPortal(bar, document.body)}
    </>
  );
};

export default LargeTitle;
