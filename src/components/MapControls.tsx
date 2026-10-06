import { Plus, Minus, Crosshair, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Zoom / position (modèle A2) : discrets au repos, normaux dès qu'on touche
// ou bouge la carte, puis rediscrets après IDLE_MS sans interaction.
const IDLE_MS = 3000;

const MapControls = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(true); // visibles au chargement, puis discrets
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const wake = () => {
      setActive(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(false), IDLE_MS);
    };
    const onPointer = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('.leaflet-container, [data-map-controls]')) wake();
    };
    const events = ['pointerdown', 'pointermove', 'wheel', 'touchstart'] as const;
    events.forEach((ev) => document.addEventListener(ev, onPointer, { passive: true }));
    timer.current = setTimeout(() => setActive(false), IDLE_MS);
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, onPointer));
      clearTimeout(timer.current);
    };
  }, []);

  const handleRecenter = () => {
    // This is a user gesture (tap) — dispatches event that triggers geo.request()
    // On iOS PWA, this user gesture allows the geolocation permission prompt to appear
    window.dispatchEvent(new Event('recenterMap'));
  };

  const handleZoomIn = () => {
    window.dispatchEvent(new Event('zoomIn'));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new Event('zoomOut'));
  };

  const handleMarketplaceClick = () => {
    navigate('/marketplace');
  };

  return <>
      {/* Left side controls: Zoom + Position */}
      <div
        data-map-controls
        className={`absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2.5 origin-left transition-[opacity,transform] duration-300 ease-out ${active ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.85]'}`}
      >
        <button onClick={handleZoomIn} className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-stone-900/95 btn-float active:scale-95 transition-transform" aria-label="Zoom in">
          <Plus className="text-ink dark:text-white" size={18} strokeWidth={1.9} />
        </button>
        <button onClick={handleZoomOut} className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-stone-900/95 btn-float active:scale-95 transition-transform" aria-label="Zoom out">
          <Minus className="text-ink dark:text-white" size={18} strokeWidth={1.9} />
        </button>
        <button onClick={handleRecenter} className="mt-2 flex size-10 items-center justify-center rounded-full bg-white dark:bg-stone-900/95 btn-float active:scale-95 transition-transform" aria-label="Recentrer sur ma position">
          <Crosshair className="text-ink dark:text-white" size={18} strokeWidth={1.9} />
        </button>
      </div>

      {/* Right side: Marketplace button */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-fade-in">
        <button onClick={handleMarketplaceClick} className="flex size-12 items-center justify-center rounded-full bg-lime btn-float active:scale-95 transition-transform duration-200 animate-scale-in" aria-label="Marketplace">
          <ShoppingCart className="w-5 h-5 text-ink" strokeWidth={1.75} />
        </button>
        <span style={{
        animationDelay: '0.1s'
      }} className="rounded-full bg-ink px-1.5 py-[2px] text-[8.5px] font-semibold uppercase leading-none tracking-[0.04em] text-parchment animate-fade-in">
          <span>Market</span>
        </span>
      </div>
    </>;
};
export default MapControls;
