import { X, Navigation, Clock, Route as RouteIcon } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

interface RouteInfoPanelProps {
  distanceKm: number | null;
  durationMin: number | null;
  loading: boolean;
  error: boolean;
}

const RouteInfoPanel = ({ distanceKm, durationMin, loading, error }: RouteInfoPanelProps) => {
  const { routeDestination, setRouteDestination } = useSearch();

  if (!routeDestination) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-fade-in pointer-events-auto">
      <div className="rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Navigation size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Itinéraire vers</p>
            <p className="font-semibold text-stone-900 dark:text-white truncate">{routeDestination.label}</p>
            {loading && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Calcul de l'itinéraire...</p>
            )}
            {error && (
              <p className="text-xs text-destructive mt-1">Impossible de calculer l'itinéraire</p>
            )}
            {!loading && !error && distanceKm !== null && durationMin !== null && (
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-sm font-medium text-stone-700 dark:text-stone-300">
                  <RouteIcon size={14} />
                  {distanceKm.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-stone-700 dark:text-stone-300">
                  <Clock size={14} />
                  {durationMin < 60 ? `${Math.round(durationMin)} min` : `${Math.floor(durationMin / 60)}h${String(Math.round(durationMin % 60)).padStart(2, '0')}`}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setRouteDestination(null)}
            className="h-9 w-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
            aria-label="Fermer l'itinéraire"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteInfoPanel;
