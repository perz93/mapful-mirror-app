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
    <div
      className="fixed left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 88px)',
        animation: 'route-panel-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <style>{`
        @keyframes route-panel-in {
          0% { opacity: 0; transform: translateY(-24px) scale(0.96); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes route-connector-grow {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes route-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 hsl(var(--primary) / 0.6); }
          50% { transform: scale(1.15); opacity: 0.85; box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
        }
        @keyframes route-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 16px; }
        }
      `}</style>
      <div className="pointer-events-auto rounded-3xl backdrop-blur-2xl bg-white/90 dark:bg-stone-900/90 border border-white/70 dark:border-stone-800/70 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] p-4 relative">
        {/* Connector reliant le panneau au tracé sur la carte */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pointer-events-none flex flex-col items-center"
          style={{ animation: 'route-connector-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both', transformOrigin: 'top center' }}
        >
          <div
            className="w-[3px] h-10 rounded-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--primary)) 0 6px, transparent 6px 12px)',
              backgroundSize: '3px 12px',
              animation: 'route-flow 0.8s linear infinite',
            }}
          />
          <div
            className="h-3 w-3 rounded-full bg-primary mt-0.5"
            style={{ animation: 'route-pulse-dot 1.8s ease-in-out infinite' }}
          />
        </div>

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
