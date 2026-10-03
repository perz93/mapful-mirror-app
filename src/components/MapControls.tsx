import { Plus, Minus, Crosshair, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MapControls = () => {
  const navigate = useNavigate();

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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start gap-3">
        <div className="flex flex-col gap-0 shadow-lg rounded-full overflow-hidden">
          <button onClick={handleZoomIn} className="flex size-10 items-center justify-center bg-white dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-800 transition-colors border-b border-stone-200 dark:border-stone-700/50" aria-label="Zoom in">
            <Plus className="text-ink dark:text-white" size={18} strokeWidth={1.75} />
          </button>
          <button onClick={handleZoomOut} className="flex size-10 items-center justify-center bg-white dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-800 transition-colors" aria-label="Zoom out">
            <Minus className="text-ink dark:text-white" size={18} strokeWidth={1.75} />
          </button>
        </div>
        <button onClick={handleRecenter} className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-stone-900/95 shadow-lg hover:bg-white dark:hover:bg-stone-800 transition-colors" aria-label="Recentrer sur ma position">
          <Crosshair className="text-ink dark:text-white" size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Right side: Marketplace button */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-fade-in">
        <button onClick={handleMarketplaceClick} className="flex size-12 items-center justify-center rounded-full bg-lime shadow-xl active:scale-95 transition-transform duration-200 animate-scale-in" aria-label="Marketplace">
          <ShoppingCart className="w-5 h-5 text-ink" strokeWidth={1.75} />
        </button>
        <span style={{
        animationDelay: '0.1s'
      }} className="eyebrow px-2 py-0.5 rounded-full text-[9px] tracking-[0.08em] text-parchment animate-fade-in bg-ink">
          <span>Marketplace</span>
        </span>
      </div>
    </>;
};
export default MapControls;
