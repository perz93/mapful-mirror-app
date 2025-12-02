import { Plus, Minus, Crosshair } from 'lucide-react';
import cartIcon from '@/assets/panier-dachat.png';

const MapControls = () => {
  const handleRecenter = () => {
    window.dispatchEvent(new Event('recenterMap'));
  };

  const handleZoomIn = () => {
    window.dispatchEvent(new Event('zoomIn'));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new Event('zoomOut'));
  };

  const handleCartClick = () => {
    // TODO: Handle cart click
    console.log('Cart clicked');
  };

  return (
    <>
      {/* Left side controls: Zoom + Position */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start gap-3">
        <div className="flex flex-col gap-0 shadow-lg rounded-full overflow-hidden">
          <button 
            onClick={handleZoomIn}
            className="flex size-10 items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 transition-colors border-b border-stone-200/50 dark:border-stone-700/50"
            aria-label="Zoom in"
          >
            <Plus className="text-stone-900 dark:text-white" size={20} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="flex size-10 items-center justify-center bg-white/95 dark:bg-stone-900/95 backdrop-blur-md hover:bg-white dark:hover:bg-stone-800 transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="text-stone-900 dark:text-white" size={20} />
          </button>
        </div>
        <button 
          onClick={handleRecenter}
          className="flex size-10 items-center justify-center rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl hover:bg-white dark:hover:bg-stone-800 transition-colors border border-stone-200/50 dark:border-stone-700/50"
          aria-label="Recentrer sur ma position"
        >
          <Crosshair className="text-stone-900 dark:text-white" size={20} />
        </button>
      </div>

      {/* Right side: Cart button */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button 
          onClick={handleCartClick}
          className="flex size-12 items-center justify-center rounded-full shadow-2xl hover:scale-105 transition-transform overflow-hidden"
          aria-label="Panier"
        >
          <img src={cartIcon} alt="Panier" className="w-full h-full object-cover" />
        </button>
      </div>
    </>
  );
};

export default MapControls;
