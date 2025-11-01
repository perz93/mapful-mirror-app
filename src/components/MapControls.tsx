import { Plus, Minus, Crosshair } from 'lucide-react';
const MapControls = () => {
  return <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3">
      <div className="flex flex-col gap-0 shadow-lg rounded-full">
        
        
      </div>
      <button className="flex size-10 items-center justify-center rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl hover:bg-white transition-colors border border-stone-200/50 dark:border-stone-700/50">
        <Crosshair className="text-stone-900 dark:text-white" size={20} />
      </button>
    </div>;
};
export default MapControls;