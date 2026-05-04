import { Plus, Minus, Crosshair, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const MapControls = () => {
  const navigate = useNavigate();
  const handleRecenter = () => {
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
      <div className="absolute left-4 top-[40%] -translate-y-1/2 flex flex-col items-start gap-3">
        <div className="flex flex-col gap-0 shadow-lg rounded-full overflow-hidden">
          <button onClick={handleZoomIn} className="flex size-10 items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 transition-colors border-b border-stone-200/50 dark:border-stone-700/50" aria-label="Zoom in">
            <Plus className="text-stone-900 dark:text-white" size={20} />
          </button>
          <button onClick={handleZoomOut} className="flex size-10 items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 transition-colors" aria-label="Zoom out">
            <Minus className="text-stone-900 dark:text-white" size={20} />
          </button>
        </div>
        <button onClick={handleRecenter} className="flex size-10 items-center justify-center rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl hover:bg-white dark:hover:bg-stone-800 transition-colors border border-stone-200/50 dark:border-stone-700/50" aria-label="Recentrer sur ma position">
          <Crosshair className="text-stone-900 dark:text-white" size={20} />
        </button>
      </div>

      {/* Right side: Marketplace button */}
      <div className="absolute right-4 top-[40%] -translate-y-1/2 flex flex-col items-center gap-1.5 animate-fade-in">
        <button onClick={handleMarketplaceClick} className="flex size-14 items-center justify-center rounded-full bg-[#ee9d2b] shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200 animate-scale-in" aria-label="Marketplace">
          <ShoppingCart className="w-7 h-7 text-white" strokeWidth={2} />
        </button>
        <span style={{
        animationDelay: '0.1s'
      }} className="text-xs font-medium italic backdrop-blur-sm px-2.5 py-1 rounded-full text-white animate-fade-in bg-muted-foreground">
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Marketplace</span>
        </span>
      </div>
    </>;
};
export default MapControls;