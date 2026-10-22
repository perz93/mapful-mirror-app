import { normalizeEventCategory } from '@/lib/eventCategories';
import { useEffect, useRef, useState } from 'react';
import { escapeHtml, safeUrl } from '@/lib/escapeHtml';
import { addBaseMap } from '@/lib/mapTiles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/hooks/useEvents';
import { useGeolocation } from '@/hooks/useGeolocation';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/components/PillToast';
import RouteInfoPanel from './RouteInfoPanel';
import { fuzzyMatch } from '@/lib/fuzzyMatch';
import { getDistanceKm } from '@/hooks/useNearbyEvents';
import { eventCity } from '@/lib/cities';
import { isMultiDay, lastDay } from '@/lib/eventStatus';
import { matchesDateFilter } from '@/lib/dateFilters';
import { supabase } from '@/integrations/supabase/client';
import { softCase } from '@/lib/softCase';
import { focusPosition } from '@/lib/imageFocus';

/** Durée du déploiement / regroupement des pastilles (0,3 s en dur dans leaflet.markercluster) */
const CLUSTER_ANIM_MS = 650;

type ClusterAnimInternals = {
  _queue: Array<() => void>;
  _queueTimeout: ReturnType<typeof setTimeout> | null;
  _processQueue: () => void;
  _enqueue: (fn: () => void) => void;
  _animationZoomIn: (previousZoom: number, newZoom: number) => void;
  _animationZoomOut: (previousZoom: number, newZoom: number) => void;
};

/**
 * Les pastilles sortent du groupe (et y rentrent) plus lentement et sans fondu :
 * on allonge l'attente interne de la librairie et on pose .cluster-zooming sur
 * la carte le temps du mouvement (styles dans index.css).
 */
const slowClusterAnimation = (group: L.MarkerClusterGroup, map: L.Map) => {
  const g = group as unknown as ClusterAnimInternals;
  g._enqueue = function (fn) {
    this._queue.push(fn);
    if (!this._queueTimeout) this._queueTimeout = setTimeout(() => this._processQueue(), CLUSTER_ANIM_MS);
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const flag = () => {
    const container = map.getContainer();
    container.classList.add('cluster-zooming');
    clearTimeout(timer);
    timer = setTimeout(() => container.classList.remove('cluster-zooming'), CLUSTER_ANIM_MS + 50);
  };
  const zoomIn = g._animationZoomIn;
  const zoomOut = g._animationZoomOut;
  g._animationZoomIn = function (previousZoom, newZoom) { flag(); zoomIn.call(this, previousZoom, newZoom); };
  g._animationZoomOut = function (previousZoom, newZoom) { flag(); zoomOut.call(this, previousZoom, newZoom); };
};

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { searchQuery, selectedCategories, routeDestination, setRouteDestination, distanceFilter, cityFilter, dateFilter, priceFilter } = useSearch();
  const { t } = useLanguage();
  const { data: events, isLoading } = useEvents();
  const geo = useGeolocation();
  // Itinéraire affiché : les recentrages automatiques ne doivent pas le cacher
  const routeActiveRef = useRef(false);
  routeActiveRef.current = !!routeDestination;

  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const didAutoRecenterRef = useRef(false);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const heatLayerRef = useRef<any>(null);
  const didFlyToUserRef = useRef(false);

  // Expose map instance and route coords to RouteInfoPanel via state
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLngTuple[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number | null; durationMin: number | null; loading: boolean; error: boolean; needsLocation?: boolean }>({
    distanceKm: null,
    durationMin: null,
    loading: false,
    error: false,
  });

  // ========================================
  // Map initialization (runs once)
  // ========================================
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const savedPosition = sessionStorage.getItem('mapPosition');
    const DEFAULT_INITIAL_ZOOM = 9;

    let initialCenter: [number, number] = [5.3600, -4.0083];
    let initialZoom = DEFAULT_INITIAL_ZOOM;

    if (savedPosition) {
      const { lat, lng, zoom } = JSON.parse(savedPosition);
      initialCenter = [lat, lng];
      initialZoom = Math.min(Number(zoom) || DEFAULT_INITIAL_ZOOM, DEFAULT_INITIAL_ZOOM);
    }

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      preferCanvas: true,
      // Pas de fondu sur les tuiles : la carte apparaît net
      fadeAnimation: false,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    const removeBaseMap = addBaseMap(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      sessionStorage.setItem('mapPosition', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom,
      }));
    });

    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      // Groupe + étoile : les étiquettes trop proches sont regroupées à tous les zooms
      // (sinon elles s'empilent) ; le clic sur un groupe est géré plus bas.
      zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: false,
      spiderfyDistanceMultiplier: 2.6,
      spiderLegPolylineOptions: { weight: 1.5, color: '#14140f', opacity: 0.3 },
      removeOutsideVisibleBounds: true,
      // Déploiement animé, ralenti et sans fondu : voir slowClusterAnimation
      animate: true,
      animateAddingMarkers: false,
      maxClusterRadius: 80,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let sizeClass = 'small';
        if (count >= 10) sizeClass = 'large';
        else if (count >= 5) sizeClass = 'medium';

        const markers = cluster.getAllChildMarkers();
        const typeCount: Record<string, number> = {};
        markers.forEach((marker: any) => {
          const type = marker.eventData?.type || 'music';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        const dominantType = Object.keys(typeCount).reduce((a, b) =>
          typeCount[a] > typeCount[b] ? a : b
        );

        return L.divIcon({
          html: `<div class="cluster-inner cluster-${dominantType}"><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: L.point(34, 34),
        });
      },
    });

    // Clic sur un groupe : on zoome dessus (jusqu'au zoom 16) pour séparer les événements ;
    // s'ils restent groupés une fois là (même lieu ou quelques rues d'écart), on les ouvre
    // en étoile au centre de la zone visible (entre le haut et le cadre événement du bas).
    const STAR_ZOOM = 16;
    // Étoile adaptée aux étiquettes (larges et basses) : un cercle dont le rayon grandit avec
    // le nombre d'événements, en partant du haut, pour que deux étiquettes voisines ne se touchent pas.
    (L.MarkerCluster.prototype as unknown as {
      _generatePointsCircle: (count: number, centerPt: L.Point) => L.Point[];
    })._generatePointsCircle = (count, centerPt) => {
      const radius = Math.min(120, 50 + count * 9);
      const step = (Math.PI * 2) / count;
      return Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI / 2 + i * step;
        return L.point(centerPt.x + radius * Math.cos(angle), centerPt.y + radius * Math.sin(angle)).round();
      });
    };
    const openStar = (cluster: L.MarkerCluster) => {
      const size = map.getSize();
      const target = L.point(size.x / 2, (100 + (size.y - 360)) / 2);
      const offset = map.latLngToContainerPoint(cluster.getLatLng()).subtract(target);
      if (Math.abs(offset.x) < 8 && Math.abs(offset.y) < 8) {
        cluster.spiderfy();
        return;
      }
      map.once('moveend', () => cluster.spiderfy());
      map.panBy(offset, { duration: 0.35 });
    };
    markerClusterGroup.on('clusterclick', (e: L.LeafletEvent) => {
      const cluster = (e as L.LeafletEvent & { layer: L.MarkerCluster }).layer;
      const bounds = cluster.getBounds();
      const fitZoom = Math.min(map.getBoundsZoom(bounds, false, L.point(80, 500)), STAR_ZOOM);
      if (fitZoom <= map.getZoom()) {
        openStar(cluster);
        return;
      }
      const children = cluster.getAllChildMarkers();
      map.once('moveend', () => {
        // Laisse le regroupement se recalculer après le zoom
        setTimeout(() => {
          const parent = markerClusterGroup.getVisibleParent(children[0]) as L.Marker | L.MarkerCluster | null;
          if (parent && parent !== children[0] && 'getChildCount' in parent && parent.getChildCount() === children.length) {
            openStar(parent);
          }
        }, 300);
      });
      map.flyToBounds(bounds, { paddingTopLeft: [40, 120], paddingBottomRight: [40, 380], maxZoom: STAR_ZOOM, duration: 0.7 });
    });
    // Dans l'étoile, l'étiquette est centrée sur le bout de son trait (et non posée au-dessus)
    markerClusterGroup.on('spiderfied', (e: L.LeafletEvent) => {
      (e as L.LeafletEvent & { markers: L.Marker[] }).markers.forEach((m) => m.getElement()?.classList.add('in-star'));
    });
    markerClusterGroup.on('unspiderfied', (e: L.LeafletEvent) => {
      (e as L.LeafletEvent & { markers: L.Marker[] }).markers.forEach((m) => m.getElement()?.classList.remove('in-star'));
    });

    slowClusterAnimation(markerClusterGroup, map);
    markerClusterGroupRef.current = markerClusterGroup;
    map.addLayer(markerClusterGroup);
    mapInstanceRef.current = map;
    setMapInstance(map);

    // Force map to recalculate size after splash screen disappears
    // The splash keeps the container at opacity:0 for up to 3.7s in standalone mode
    // Leaflet needs invalidateSize once the container is visible
    const sizeTimers = [100, 500, 1000, 2000, 4000].map(delay =>
      setTimeout(() => map.invalidateSize(), delay)
    );

    // Zoom handlers
    const handleZoomIn = () => map.zoomIn();
    const handleZoomOut = () => map.zoomOut();

    window.addEventListener('zoomIn', handleZoomIn);
    window.addEventListener('zoomOut', handleZoomOut);

    return () => {
      sizeTimers.forEach(t => clearTimeout(t));
      removeBaseMap();
      markersRef.current = [];
      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      if (markerClusterGroupRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
      window.removeEventListener('zoomIn', handleZoomIn);
      window.removeEventListener('zoomOut', handleZoomOut);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapInstance(null);
    };
  }, [navigate]);

  // ========================================
  // Geolocation → update user marker on map
  // ========================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geo.position) return;

    const { lat, lng } = geo.position;

    // Place or update user marker
    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="user-location-pulse"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<div class="popup-body"><strong>${t('map.yourPosition')}</strong></div>`);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
    }

    // Fly to user position on first fix (only if no saved map position)
    if (!didFlyToUserRef.current && !sessionStorage.getItem('mapPosition')) {
      didFlyToUserRef.current = true;
      if (!routeActiveRef.current) map.flyTo([lat, lng], 15, { duration: 1.5 });
    }
  }, [geo.position]);

  // Listen for recenter → direct getCurrentPosition (must stay in user gesture stack)
  useEffect(() => {
    const handler = () => {
      if (!navigator.geolocation || !mapInstanceRef.current) return;
      // Direct call — not through the hook — to preserve user gesture context for iOS
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const map = mapInstanceRef.current;
          if (!map) return;

          // Update marker
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `<div class="user-location-pulse"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(map)
              .bindPopup(`<div class="popup-body"><strong>${t('map.yourPosition')}</strong></div>`);
          } else {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          }

          map.flyTo([latitude, longitude], 15, { duration: 1.5 });

          // Also update sessionStorage for geo hook
          try {
            sessionStorage.setItem('user_geo', JSON.stringify({
              lat: latitude, lng: longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            }));
          } catch {}
        },
        (err) => {
          if (err.code === 1) {
            // Permission denied — on iOS/Android, can't re-ask, must go to settings
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
            if (isIOS && isStandalone) {
              toast.info(t('map.iosVibe'), { duration: 6000 });
            } else if (isIOS) {
              toast.info(t('map.iosSafari'), { duration: 6000 });
            } else {
              toast.info(t('map.enableLocation'), { duration: 5000 });
            }
          } else {
            toast.error(t('map.gpsNotFound'));
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };
    window.addEventListener('recenterMap', handler);
    return () => window.removeEventListener('recenterMap', handler);
  }, []);

  // Listen for external "fly to" requests (e.g., from search suggestions)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lat: number; lng: number; zoom?: number };
      const map = mapInstanceRef.current;
      if (!map || !detail) return;
      map.flyTo([detail.lat, detail.lng], detail.zoom ?? 16, { duration: 0.8 });
    };
    window.addEventListener('map:flyto', handler);
    return () => window.removeEventListener('map:flyto', handler);
  }, []);

  // ========================================
  // Events markers + heatmap
  // ========================================
  useEffect(() => {
    if (!mapInstance || !markerClusterGroupRef.current || !events || isLoading) return;

    const map = mapInstance;
    const markerClusterGroup = markerClusterGroupRef.current;

    markersRef.current = [];
    markerClusterGroup.clearLayers();

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // P4 : étiquette avec mini photo + nom court (heure affichée quand l'événement est sélectionné)
    const createCustomIcon = (imageUrl: string, eventType: string, title: string, time: string) => {
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=80&q=60&fm=webp';
      const hour = (time || '').slice(0, 5).replace(':', 'h').replace(/h00$/, 'h');
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="pin-label" data-cat="${escapeHtml(eventType)}">
            <span class="pin-label-img"><img src="${safeUrl(imageUrl, defaultImage)}" alt="" loading="lazy" /></span>
            <b class="pin-label-title">${escapeHtml(softCase(title))}</b>${hour ? `<em class="pin-label-time"> · ${escapeHtml(hour)}</em>` : ''}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -44],
      });
    };

    const formatEventDate = (dateStr: string) => {
      try {
        const date = parseISO(dateStr);
        return {
          month: format(date, 'MMM', { locale: fr }).toUpperCase(),
          day: format(date, 'd'),
          weekday: format(date, 'EEE', { locale: fr }).toUpperCase(),
        };
      } catch {
        return { month: 'NOV', day: '16', weekday: 'SAM' };
      }
    };

    const formatEventTime = (timeStr: string) => {
      try {
        const [hours, minutes] = timeStr.split(':');
        return `${hours}h${minutes}`;
      } catch {
        return '20h00';
      }
    };

    const coordCounts = new Map<string, number>();
    events.forEach((event) => {
      const key = `${event.latitude}-${event.longitude}`;
      coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
    });

    events.forEach((event) => {
      const marker = L.marker([event.latitude, event.longitude], {
        icon: createCustomIcon(event.image_url || '', event.category, event.title, event.time),
      });

      const dateFormatted = formatEventDate(event.date);
      if (isMultiDay(event)) dateFormatted.day = `${dateFormatted.day}–${format(parseISO(lastDay(event)), 'd')}`;
      const timeFormatted = event.end_time
        ? `${formatEventTime(event.time)} – ${formatEventTime(event.end_time)}`
        : formatEventTime(event.time);
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=320&q=70&fm=webp';

      const popupContent = `
        <div class="event-popup-card">
          <div class="popup-card-image" style="background-image: url('${safeUrl(event.image_url, defaultImage)}'); background-position: ${focusPosition(event.image_focus)}">
            <div class="popup-card-gradient">
              <div class="popup-card-row">
                <div class="popup-date-box">
                  <div class="popup-date-month">${dateFormatted.month}</div>
                  <div class="popup-date-day">${dateFormatted.day}</div>
                </div>
                <div class="popup-card-info">
                  <h3 class="popup-card-title">${escapeHtml(softCase(event.title))}</h3>
                  <div class="popup-card-meta">${escapeHtml(softCase(event.venue))} · ${escapeHtml(timeFormatted)}</div>
                </div>
              </div>
              <div class="popup-actions">
                <button class="popup-route-btn">Itinéraire</button>
                <button class="popup-details-btn">Voir détails →</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const popup = L.popup({
        className: 'custom-popup-card',
        closeButton: true,
        maxWidth: 240,
        minWidth: 240,
      }).setContent(popupContent);

      marker.bindPopup(popup);

      (marker as any).eventData = {
        ...event,
        type: event.category,
        lat: event.latitude,
        lng: event.longitude,
        image: event.image_url,
      };
      markersRef.current.push(marker);
      markerClusterGroup.addLayer(marker);

      marker.on('click', () => {
        const key = `${event.latitude}-${event.longitude}`;
        const countAtPosition = coordCounts.get(key) || 1;
        // Ouvert depuis une étoile : on ne zoome pas (le zoom refermerait l'étoile et la fiche)
        const inStar = !!(marker as L.Marker & { _preSpiderfyLatlng?: L.LatLng })._preSpiderfyLatlng;
        if (countAtPosition === 1 && !inStar) {
          map.flyTo([event.latitude, event.longitude], 16, {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }
      });

      marker.on('popupclose', () => {
        marker.getElement()?.classList.remove('is-selected');
      });

      marker.on('popupopen', async () => {
        marker.getElement()?.classList.add('is-selected');
        const popupInstance = marker.getPopup();
        const popupElement = popupInstance?.getElement();
        if (!popupElement) return;

        const detailsBtn = popupElement.querySelector('.popup-details-btn') as HTMLElement | null;
        if (detailsBtn) {
          detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(`/event/${event.id}`);
          });
        }

        const routeBtn = popupElement.querySelector('.popup-route-btn') as HTMLElement | null;
        if (routeBtn) {
          routeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setRouteDestination({
              lat: Number(event.latitude),
              lng: Number(event.longitude),
              label: event.title,
            });
            marker.closePopup();
          });
        }

      });
    });


    if (!didAutoRecenterRef.current) {
      const coords = events
        .map((e) => [Number(e.latitude), Number(e.longitude)] as [number, number])
        .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        if (bounds.isValid() && !routeActiveRef.current && !map.getBounds().intersects(bounds)) {
          map.fitBounds(bounds, {
            padding: [36, 36],
            maxZoom: 13,
            animate: true,
          });
        }
      }
      didAutoRecenterRef.current = true;
    }
  }, [events, isLoading, navigate, setRouteDestination, mapInstance]);

  // ========================================
  // Route calculation
  // ========================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }
    setRouteCoordinates([]);

    if (!routeDestination) {
      setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: false });
      return;
    }

    // Point d'arrivée (modèle I5) : pastille lime + nom de l'événement posé dessus
    const safeLabel = String(routeDestination.label ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    const destIcon = L.divIcon({
      className: 'route-destination-marker',
      html: `<div style="position:relative;width:24px;height:24px">
        <div style="position:absolute;bottom:84px;left:50%;transform:translateX(-50%);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#14140f;color:#f5f5eb;border-radius:999px;padding:5px 11px;font:600 12.5px 'Instrument Sans',sans-serif;box-shadow:0 6px 16px rgba(20,20,15,.3)">${safeLabel}</div>
        <div style="width:24px;height:24px;border-radius:50%;background:#a6e22e;border:4px solid #fff;box-shadow:0 4px 12px rgba(20,20,15,.35)"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    // Au-dessus du pin photo de l'événement (même position), nom placé plus haut que lui
    destinationMarkerRef.current = L.marker([routeDestination.lat, routeDestination.lng], { icon: destIcon, zIndexOffset: 2000, interactive: false }).addTo(map);

    if (!geo.position) {
      // Position en cours (ouverture depuis la page d'un événement) : on attend
      if (geo.loading) {
        setRouteInfo({ distanceKm: null, durationMin: null, loading: true, error: false });
        return;
      }
      // Pas de toast (il se superposait aux pastilles) : la pastille le dit
      setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: true, needsLocation: true });
      return;
    }

    setRouteInfo({ distanceKm: null, durationMin: null, loading: true, error: false });

    let cancelled = false;
    const origin = geo.position;

    (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${routeDestination.lng},${routeDestination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('osrm-error');
        const data = await res.json();
        if (cancelled) return;
        const route = data.routes?.[0];
        if (!route) throw new Error('no-route');

        const coords: L.LatLngTuple[] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        const polyline = L.polyline(coords, {
          color: '#14140f',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        routeLayerRef.current = polyline;
        setRouteCoordinates(coords);

        // Marges : panneau d'itinéraire en haut, carte de l'événement + menu en bas
        map.fitBounds(polyline.getBounds(), { paddingTopLeft: [70, 190], paddingBottomRight: [70, 360], maxZoom: 15, animate: true });

        setRouteInfo({
          distanceKm: route.distance / 1000,
          durationMin: route.duration / 60,
          loading: false,
          error: false,
        });
      } catch {
        if (cancelled) return;
        setRouteCoordinates([]);
        setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: true });
      }
    })();

    return () => { cancelled = true; };
  }, [routeDestination, geo.position, geo.loading]);

  // Itinéraire affiché : on masque les indicateurs d'événements (seuls restent ta position,
  // le tracé et le point d'arrivée) ; ils reviennent à la fermeture de l'itinéraire.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = markerClusterGroupRef.current;
    if (!map || !clusterGroup) return;
    if (routeDestination) {
      map.closePopup();
      if (map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup);
    } else if (!map.hasLayer(clusterGroup)) {
      map.addLayer(clusterGroup);
    }
  }, [routeDestination, mapInstance]);

  // ========================================
  // Search & distance filter
  // ========================================
  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current) return;

    const query = searchQuery.toLowerCase().trim();
    const clusterGroup = markerClusterGroupRef.current;

    clusterGroup.clearLayers();

    const now = new Date();

    markersRef.current.forEach((marker) => {
      const eventData = (marker as any).eventData;
      if (!eventData) return;

      const matchesSearch = !query ||
        fuzzyMatch(eventData.title, query) ||
        fuzzyMatch(eventData.venue, query) ||
        fuzzyMatch(eventData.type, query);

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(normalizeEventCategory(eventData.category));

      let matchesDistance = true;
      if (distanceFilter && geo.position) {
        const dist = getDistanceKm(
          geo.position.lat, geo.position.lng,
          eventData.lat, eventData.lng
        );
        matchesDistance = dist <= distanceFilter;
      }

      const matchesCity = !cityFilter || eventCity(eventData) === cityFilter;

      // Date filter
      const matchesDate = matchesDateFilter(eventData, dateFilter, now);

      // Price filter
      let matchesPrice = true;
      if (priceFilter === 'free') {
        matchesPrice = !eventData.is_paid;
      } else if (priceFilter === 'paid') {
        matchesPrice = !!eventData.is_paid;
      }

      if (matchesSearch && matchesCategory && matchesCity && matchesDistance && matchesDate && matchesPrice) {
        clusterGroup.addLayer(marker);
      }
    });
  }, [searchQuery, selectedCategories, cityFilter, distanceFilter, dateFilter, priceFilter, geo.position]);

  return (
    <>
      <div ref={mapRef} className="absolute inset-0 z-0" />

      <RouteInfoPanel
        distanceKm={routeInfo.distanceKm}
        durationMin={routeInfo.durationMin}
        loading={routeInfo.loading}
        error={routeInfo.error}
        needsLocation={routeInfo.needsLocation}
        mapInstance={mapInstance}
        routeCoordinates={routeCoordinates}
      />
    </>
  );
};

export default MapView;
