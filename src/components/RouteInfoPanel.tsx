import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Navigation, Clock, Route as RouteIcon } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import itineraryIcon from '@/assets/itinerary-icon.png';

interface RouteInfoPanelProps {
  distanceKm: number | null;
  durationMin: number | null;
  loading: boolean;
  error: boolean;
  connectorTarget: { x: number; y: number } | null;
  onAnchorChange: (anchor: { x: number; y: number } | null) => void;
}

const RouteInfoPanel = ({
  distanceKm,
  durationMin,
  loading,
  error,
  connectorTarget,
  onAnchorChange,
}: RouteInfoPanelProps) => {
  const { routeDestination, setRouteDestination } = useSearch();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelBounds, setPanelBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const updatePanelBounds = useCallback(() => {
    if (!overlayRef.current || !panelRef.current) {
      setPanelBounds(null);
      onAnchorChange(null);
      return;
    }

    const overlayRect = overlayRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const nextBounds = {
      x: panelRect.left - overlayRect.left,
      y: panelRect.top - overlayRect.top,
      width: panelRect.width,
      height: panelRect.height,
    };

    setPanelBounds(nextBounds);
    onAnchorChange({
      x: nextBounds.x + nextBounds.width / 2,
      y: nextBounds.y + nextBounds.height,
    });
  }, [onAnchorChange]);

  useEffect(() => {
    if (!routeDestination) {
      setPanelBounds(null);
      onAnchorChange(null);
      return;
    }

    updatePanelBounds();

    const observer = new ResizeObserver(() => updatePanelBounds());
    if (overlayRef.current) observer.observe(overlayRef.current);
    if (panelRef.current) observer.observe(panelRef.current);

    window.addEventListener('resize', updatePanelBounds);
    const frame = window.requestAnimationFrame(updatePanelBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePanelBounds);
      window.cancelAnimationFrame(frame);
    };
  }, [routeDestination, updatePanelBounds, onAnchorChange]);

  const connectorPath = useMemo(() => {
    if (!panelBounds || !connectorTarget) return null;

    const startX = panelBounds.x + panelBounds.width / 2;
    const startY = panelBounds.y + panelBounds.height;
    const endX = connectorTarget.x;
    const endY = connectorTarget.y;
    const curveDepth = Math.max(30, Math.min(90, (endY - startY) * 0.45));

    return `M ${startX} ${startY} C ${startX} ${startY + curveDepth}, ${endX} ${Math.max(startY + curveDepth, endY - 36)}, ${endX} ${endY}`;
  }, [panelBounds, connectorTarget]);

  if (!routeDestination) return null;

  return (
    <div ref={overlayRef} className="absolute inset-0 z-40 pointer-events-none">
      <style>{`
        @keyframes route-panel-in {
          0% { opacity: 0; transform: translateY(-18px) scale(0.96); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes route-dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -48; }
        }
        @keyframes route-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.82; }
        }
        @keyframes close-btn-in {
          0% { opacity: 0; transform: scale(0.72) rotate(-80deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>

      {connectorPath && connectorTarget && (
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
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
            d={connectorPath}
            fill="none"
            stroke="hsl(var(--primary) / 0.15)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#routeConnectorGlow)"
          />
          <path
            d={connectorPath}
            fill="none"
            stroke="url(#routeConnectorGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="7 11"
            style={{ animation: 'route-dash-flow 1.2s linear infinite' }}
          />
          <circle cx={connectorTarget.x} cy={connectorTarget.y} r="8" fill="hsl(var(--primary) / 0.15)" />
          <circle
            cx={connectorTarget.x}
            cy={connectorTarget.y}
            r="4.5"
            fill="hsl(var(--primary))"
            style={{ animation: 'route-pulse-dot 1.6s ease-in-out infinite' }}
          />
        </svg>
      )}

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
            className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-background/95 text-primary shadow-lg transition-all active:scale-90"
            style={{ animation: 'close-btn-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both' }}
            aria-label="Fermer l'itinéraire"
          >
            <X size={15} strokeWidth={2.5} />
          </button>

          <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/80 px-3.5 py-3 shadow-[0_22px_60px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-border/70" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <img src={itineraryIcon} alt="" className="h-5 w-5 object-contain" />
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
