import { useCallback, useEffect, useRef } from 'react';
import { X, Clock, Route as RouteIcon } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import itineraryIcon from '@/assets/itinerary-icon.png';

interface RouteInfoPanelProps {
  distanceKm: number | null;
  durationMin: number | null;
  loading: boolean;
  error: boolean;
  mapInstance: L.Map | null;
  routeCoordinates: L.LatLngTuple[];
}

const RouteInfoPanel = ({
  distanceKm,
  durationMin,
  loading,
  error,
  mapInstance,
  routeCoordinates,
}: RouteInfoPanelProps) => {
  const { routeDestination, setRouteDestination } = useSearch();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const dashPathRef = useRef<SVGPathElement>(null);

  // Keep latest routeCoordinates in a ref so the callback never goes stale
  const routeCoordsRef = useRef<L.LatLngTuple[]>(routeCoordinates);
  routeCoordsRef.current = routeCoordinates;

  const mapRef = useRef<L.Map | null>(mapInstance);
  mapRef.current = mapInstance;

  // Direct DOM update — no React state, no re-render lag
  const syncConnector = useCallback(() => {
    const map = mapRef.current;
    const coords = routeCoordsRef.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const glowPath = glowPathRef.current;
    const dashPath = dashPathRef.current;
    if (!map || !panel || !overlay || !svg || !glowPath || !dashPath || coords.length === 0) {
      if (svg) svg.style.display = 'none';
      return;
    }

    const overlayRect = overlay.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();

    // Anchor point: bottom-center of the panel, relative to overlay
    const anchorX = panelRect.left - overlayRect.left + panelRect.width / 2;
    const anchorY = panelRect.top - overlayRect.top + panelRect.height;

    // Offset between map container and overlay to align coordinate systems
    const offsetX = mapRect.left - overlayRect.left;
    const offsetY = mapRect.top - overlayRect.top;

    // Convert ALL route points to overlay pixel coords (no visibility filter)
    const allPoints = coords.map((coord) => {
      const pt = map.latLngToContainerPoint(coord);
      return { x: pt.x + offsetX, y: pt.y + offsetY };
    });

    if (allPoints.length === 0) {
      svg.style.display = 'none';
      return;
    }

    // Prefer points below the panel, fallback to all points
    const preferredPoints = allPoints.filter(({ y }) => y >= anchorY + 18);
    const candidatePoints = preferredPoints.length > 0 ? preferredPoints : allPoints;

    const target = candidatePoints.reduce(
      (best, point) => {
        const dx = point.x - anchorX;
        const dy = point.y - anchorY;
        const score = Math.abs(dx) * 1.35 + Math.abs(dy) + (dy < 0 ? 1000 : 0);
        return score < best.score ? { point, score } : best;
      },
      { point: candidatePoints[0], score: Number.POSITIVE_INFINITY }
    ).point;

    const curveDepth = Math.max(30, Math.min(90, (target.y - anchorY) * 0.45));
    const d = `M ${anchorX} ${anchorY} C ${anchorX} ${anchorY + curveDepth}, ${target.x} ${Math.max(anchorY + curveDepth, target.y - 36)}, ${target.x} ${target.y}`;

    svg.style.display = '';
    glowPath.setAttribute('d', d);
    dashPath.setAttribute('d', d);
  }, []); // No deps — reads everything from refs

  // Bind to map move/zoom — direct DOM, zero lag
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncConnector);
    };

    map.on('move', onMove);
    map.on('zoom', onMove);
    map.on('resize', onMove);

    return () => {
      cancelAnimationFrame(frame);
      map.off('move', onMove);
      map.off('zoom', onMove);
      map.off('resize', onMove);
    };
  }, [mapInstance, syncConnector]);

  // Re-sync when route coordinates arrive or change
  useEffect(() => {
    if (routeCoordinates.length === 0) return;
    // Small delay to let the panel render first
    const frame = requestAnimationFrame(() => {
      syncConnector();
      // Double-sync after a short delay for layout settle
      setTimeout(syncConnector, 100);
    });
    return () => cancelAnimationFrame(frame);
  }, [routeCoordinates, syncConnector]);

  // Sync on panel resize
  useEffect(() => {
    if (!routeDestination) return;

    const observer = new ResizeObserver(() => syncConnector());
    if (overlayRef.current) observer.observe(overlayRef.current);
    if (panelRef.current) observer.observe(panelRef.current);

    window.addEventListener('resize', syncConnector);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncConnector);
    };
  }, [routeDestination, syncConnector]);

  if (!routeDestination) return null;

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      <style>{`
        @keyframes route-panel-in {
          0% { opacity: 0; transform: translateY(-18px) scale(0.96); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes route-dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -48; }
        }
        @keyframes close-btn-in {
          0% { opacity: 0; transform: scale(0.72) rotate(-80deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>

      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full overflow-visible"
        style={{ display: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="routeConnectorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.95)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.35)" />
          </linearGradient>
          <filter id="routeConnectorGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={glowPathRef}
          fill="none"
          stroke="hsl(var(--primary) / 0.15)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#routeConnectorGlow)"
        />
        <path
          ref={dashPathRef}
          fill="none"
          stroke="url(#routeConnectorGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="7 11"
          style={{ animation: 'route-dash-flow 1.2s linear infinite' }}
        />
      </svg>

      <div
        className="absolute inset-x-0 px-5"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 88px)' }}
      >
        <div
          ref={panelRef}
          className="pointer-events-auto relative mx-auto w-full max-w-[18rem]"
          style={{ animation: 'route-panel-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          <button
            onClick={() => setRouteDestination(null)}
            className="absolute -top-3 -right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-900 text-stone-800 dark:text-stone-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
            style={{ animation: 'close-btn-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both' }}
            aria-label="Fermer l'itinéraire"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/80 px-3.5 py-3 shadow-[0_22px_60px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-border/70" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <img src={itineraryIcon} alt="" className="h-8 w-8 object-contain" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Itinéraire</p>
                <p className="mt-0.5 truncate text-sm font-bold text-foreground">{routeDestination.label}</p>

                {loading && (
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">Calcul en cours...</p>
                )}

                {error && (
                  <p className="mt-1 text-[11px] font-medium text-destructive">Itinéraire indisponible</p>
                )}

                {!loading && !error && distanceKm !== null && durationMin !== null && (
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-foreground/80">
                      <RouteIcon size={11} className="text-primary" />
                      {distanceKm.toFixed(1)} km
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1 text-xs font-semibold text-foreground/80">
                      <Clock size={11} className="text-primary" />
                      {durationMin < 60
                        ? `${Math.round(durationMin)} min`
                        : `${Math.floor(durationMin / 60)}h${String(Math.round(durationMin % 60)).padStart(2, '0')}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteInfoPanel;
