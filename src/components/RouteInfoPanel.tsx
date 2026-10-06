import { X, Clock } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface RouteInfoPanelProps {
  distanceKm: number | null;
  durationMin: number | null;
  loading: boolean;
  error: boolean;
  mapInstance?: L.Map | null;
  routeCoordinates?: L.LatLngTuple[];
}

const formatDuration = (min: number) =>
  min < 60 ? `${Math.round(min)} min` : `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, '0')}`;

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

/**
 * Itinéraire (modèle I5) : deux pastilles flottantes — durée, distance — et
 * un bouton fermer. Le nom de la destination est posé sur le point d'arrivée
 * (voir le marqueur dans MapView).
 */
const RouteInfoPanel = ({ distanceKm, durationMin, loading, error }: RouteInfoPanelProps) => {
  const { routeDestination, setRouteDestination } = useSearch();
  const { t } = useLanguage();

  if (!routeDestination) return null;

  const ready = !loading && !error && distanceKm !== null && durationMin !== null;
  const pill = 'btn-float flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[15px] text-ink';

  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
      style={{ zIndex: 1000, top: 'calc(env(safe-area-inset-top, 0px) + 84px)', animation: 'route-pills-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both' }}
    >
      <style>{`
        @keyframes route-pills-in {
          0% { opacity: 0; transform: translateY(-12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="pointer-events-auto flex items-center gap-2">
        {ready ? (
          <>
            <span className={`${pill} font-bold`}>
              <Clock size={17} strokeWidth={2} />
              {formatDuration(durationMin)}
            </span>
            <span className={`${pill} font-semibold text-stone-600`}>{formatDistance(distanceKm)}</span>
          </>
        ) : (
          <span className={`${pill} font-medium ${error ? 'text-red-600' : 'text-stone-500'}`}>
            {error ? t('map.routeUnavailable') : t('map.routeCalculating')}
          </span>
        )}
        <button
          type="button"
          onClick={() => setRouteDestination(null)}
          aria-label={t('map.closeRoute')}
          className="btn-float flex size-11 items-center justify-center rounded-full bg-ink text-parchment active:scale-95 transition-transform"
        >
          <X size={17} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
};

export default RouteInfoPanel;
