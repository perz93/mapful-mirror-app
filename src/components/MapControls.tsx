import { Plus, Minus, Navigation, ShoppingCart } from 'lucide-react';
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
        <div className="flex w-12 flex-col overflow-hidden rounded-[18px] bg-white dark:bg-stone-900/95 btn-float">
          <button onClick={handleZoomIn} className="flex h-[50px] items-center justify-center active:bg-stone-100 transition-colors" aria-label="Zoom in">
            <Plus className="text-ink dark:text-white" size={20} strokeWidth={1.9} />
          </button>
          <span className="mx-2.5 h-px bg-stone-200 dark:bg-stone-700/50" />
          <button onClick={handleZoomOut} className="flex h-[50px] items-center justify-center active:bg-stone-100 transition-colors" aria-label="Zoom out">
            <Minus className="text-ink dark:text-white" size={20} strokeWidth={1.9} />
          </button>
        </div>
        <button onClick={handleRecenter} className="flex size-12 items-center justify-center rounded-2xl bg-white dark:bg-stone-900/95 btn-float active:scale-95 transition-transform" aria-label="Recentrer sur ma position">
          <Navigation className="text-ink dark:text-white" size={20} strokeWidth={1.9} />
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
