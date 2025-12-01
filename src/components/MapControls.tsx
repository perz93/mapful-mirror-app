import { Plus, Minus, Crosshair } from 'lucide-react';
import { useEffect, useState } from 'react';
import cartIcon from '@/assets/cart-icon.png';
import { processCartIcon } from '@/utils/processCartIcon';
const MapControls = () => {
  const [processedCartIcon, setProcessedCartIcon] = useState<string>(cartIcon);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processIcon = async () => {
      try {
        const processed = await processCartIcon(cartIcon);
        setProcessedCartIcon(processed);
      } catch (error) {
        console.error('Failed to process cart icon, using original:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    processIcon();
  }, []);

  const handleRecenter = () => {
    window.dispatchEvent(new Event('recenterMap'));
  };

  return <>
    {/* Position button - left side */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2">
      <button 
        onClick={handleRecenter}
        className="flex size-10 items-center justify-center rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl hover:bg-white dark:hover:bg-stone-800 transition-colors border border-stone-200/50 dark:border-stone-700/50"
        aria-label="Recentrer sur ma position"
      >
        <Crosshair className="text-stone-900 dark:text-white" size={20} />
      </button>
    </div>

    {/* Cart icon - right side */}
    <div className="absolute right-4 top-1/2 -translate-y-1/2">
      <button 
        className="flex size-10 items-center justify-center rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl hover:bg-white dark:hover:bg-stone-800 transition-colors border border-stone-200/50 dark:border-stone-700/50"
        aria-label="Panier"
      >
        {!isProcessing && <img src={processedCartIcon} alt="Cart" className="w-6 h-6 object-contain" />}
      </button>
    </div>
  </>;
};
export default MapControls;