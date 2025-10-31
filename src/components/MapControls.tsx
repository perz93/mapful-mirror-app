import { Plus, Minus, Crosshair } from 'lucide-react';

const MapControls = () => {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3">
      <div className="flex flex-col gap-0 shadow-lg rounded-full">
        <button className="flex size-10 items-center justify-center rounded-t-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-background-dark/90 transition-colors">
          <Plus className="text-stone-900 dark:text-white" size={20} />
        </button>
        <button className="flex size-10 items-center justify-center rounded-b-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-background-dark/90 transition-colors">
          <Minus className="text-stone-900 dark:text-white" size={20} />
        </button>
      </div>
      <button className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm shadow-lg hover:bg-white/90 dark:hover:bg-background-dark/90 transition-colors">
        <Crosshair className="text-stone-900 dark:text-white" size={20} />
      </button>
    </div>
  );
};

export default MapControls;
