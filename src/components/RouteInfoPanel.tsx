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
      className="fixed left-0 right-0 z-40 px-6 max-w-sm mx-auto pointer-events-none"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 88px)',
        animation: 'route-panel-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <style>{`
        @keyframes route-panel-in {
          0% { opacity: 0; transform: translateY(-20px) scale(0.94); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes route-connector-grow {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes route-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 hsl(var(--primary) / 0.55); }
          50% { transform: scale(1.25); opacity: 0.9; box-shadow: 0 0 0 12px hsl(var(--primary) / 0); }
        }
        @keyframes route-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 14px; }
        }
        @keyframes close-btn-in {
          0% { opacity: 0; transform: scale(0.5) rotate(-90deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>

      <div className="pointer-events-auto relative">
        {/* Bouton fermer flottant en haut à droite (style inspiration) */}
        <button
          onClick={() => setRouteDestination(null)}
          className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-white dark:bg-stone-900 border-2 border-primary text-primary flex items-center justify-center active:scale-90 transition-all shadow-lg"
          style={{ animation: 'close-btn-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both' }}
          aria-label="Fermer l'itinéraire"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* Panneau principal compact */}
        <div className="rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/80 dark:border-stone-800/80 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.3)] px-3.5 py-3 relative">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Navigation size={17} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold leading-tight">Itinéraire</p>
              <p className="font-bold text-sm text-stone-900 dark:text-white truncate leading-tight mt-0.5">{routeDestination.label}</p>
              {loading && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Calcul en cours...</p>
              )}
              {error && (
                <p className="text-[11px] text-destructive mt-1">Itinéraire indisponible</p>
              )}
              {!loading && !error && distanceKm !== null && durationMin !== null && (
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <RouteIcon size={11} className="text-primary" />
                    {distanceKm.toFixed(1)} km
                  </span>
                  <span className="h-3 w-px bg-stone-300 dark:bg-stone-700" />
                  <span className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <Clock size={11} className="text-primary" />
                    {durationMin < 60 ? `${Math.round(durationMin)} min` : `${Math.floor(durationMin / 60)}h${String(Math.round(durationMin % 60)).padStart(2, '0')}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connecteur animé reliant le panneau au tracé sur la carte */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full pointer-events-none flex flex-col items-center"
          style={{ animation: 'route-connector-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both', transformOrigin: 'top center' }}
        >
          <div
            className="w-[3px] h-24 rounded-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--primary)) 0 6px, transparent 6px 14px)',
              backgroundSize: '3px 14px',
              animation: 'route-flow 0.7s linear infinite',
            }}
          />
          <div
            className="h-3.5 w-3.5 rounded-full bg-primary -mt-0.5 ring-2 ring-white dark:ring-stone-900"
            style={{ animation: 'route-pulse-dot 1.6s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteInfoPanel;
