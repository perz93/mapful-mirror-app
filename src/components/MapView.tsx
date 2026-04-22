import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { useEvents } from '@/hooks/useEvents';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import RouteInfoPanel from './RouteInfoPanel';
import itineraryIcon from '@/assets/itinerary-icon.png';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { searchQuery, selectedCategories, routeDestination, setRouteDestination } = useSearch();
  const { data: events, isLoading } = useEvents();

  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const didAutoRecenterRef = useRef(false);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeCoordinatesRef = useRef<L.LatLngTuple[]>([]);
  const panelAnchorPointRef = useRef<{ x: number; y: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number | null; durationMin: number | null; loading: boolean; error: boolean }>({
    distanceKm: null,
    durationMin: null,
    loading: false,
    error: false,
  });
  const [panelAnchorPoint, setPanelAnchorPoint] = useState<{ x: number; y: number } | null>(null);
  const [connectorTarget, setConnectorTarget] = useState<{ x: number; y: number } | null>(null);

  const updateConnectorTarget = useCallback(() => {
    const map = mapInstanceRef.current;
    const anchor = panelAnchorPointRef.current;

    if (!map || !anchor || routeCoordinatesRef.current.length === 0) {
      setConnectorTarget(null);
      return;
    }

    const mapSize = map.getSize();
    const visiblePoints = routeCoordinatesRef.current
      .map((coord) => map.latLngToContainerPoint(coord))
      .map((point) => ({ x: point.x, y: point.y }))
      .filter(({ x, y }) => x >= -24 && x <= mapSize.x + 24 && y >= -24 && y <= mapSize.y + 24);

    const preferredPoints = visiblePoints.filter(({ y }) => y >= anchor.y + 18);
    const candidatePoints = preferredPoints.length > 0 ? preferredPoints : visiblePoints;

    if (candidatePoints.length === 0) {
      setConnectorTarget(null);
      return;
    }

    const nextTarget = candidatePoints.reduce(
      (best, point) => {
        const dx = point.x - anchor.x;
        const dy = point.y - anchor.y;
        const score = Math.abs(dx) * 1.35 + Math.abs(dy) + (dy < 0 ? 1000 : 0);

        if (score < best.score) {
          return { point, score };
        }

        return best;
      },
      {
        point: candidatePoints[0],
        score: Number.POSITIVE_INFINITY,
      }
    ).point;

    setConnectorTarget((current) => {
      if (current && Math.abs(current.x - nextTarget.x) < 1 && Math.abs(current.y - nextTarget.y) < 1) {
        return current;
      }
      return nextTarget;
    });
  }, []);

  useEffect(() => {
    panelAnchorPointRef.current = panelAnchorPoint;
    updateConnectorTarget();
  }, [panelAnchorPoint, updateConnectorTarget]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let frame = 0;
    const syncConnector = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => updateConnectorTarget());
    };

    map.on('move', syncConnector);
    map.on('zoom', syncConnector);
    map.on('resize', syncConnector);

    syncConnector();

    return () => {
      window.cancelAnimationFrame(frame);
      map.off('move', syncConnector);
      map.off('zoom', syncConnector);
      map.off('resize', syncConnector);
    };
  }, [updateConnectorTarget]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const savedPosition = sessionStorage.getItem('mapPosition');
    const DEFAULT_INITIAL_ZOOM = 11;

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
      preferCanvas: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 20,
    }).addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      sessionStorage.setItem('mapPosition', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom,
      }));
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocationRef.current = { lat: latitude, lng: longitude };

          if (!savedPosition) {
            map.setView([latitude, longitude], DEFAULT_INITIAL_ZOOM);
          }

          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div class="user-location-pulse"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');

          userMarkerRef.current = userMarker;
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error);
          if (error.code === error.PERMISSION_DENIED && !sessionStorage.getItem('locationToastShown')) {
            sessionStorage.setItem('locationToastShown', '1');
            toast.error('Veuillez activer la localisation dans les paramètres de votre navigateur pour voir votre position sur la carte', {
              duration: 5000,
            });
          }
        }
      );
    }

    const createCustomIcon = (imageUrl: string, eventType: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-image-container">
            <div class="marker-image-wrapper marker-${eventType}">
              <img src="${imageUrl}" alt="Event" class="marker-event-image" />
            </div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
      });
    };

    const iconSvgs = {
      music: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      food: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
      sports: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
      arts: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="M12 18v4"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="M4.93 19.07l4.24-4.24"/><path d="M14.83 9.17l4.24-4.24"/></svg>',
    };

    void createCustomIcon;
    void iconSvgs;

    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      spiderfyDistanceMultiplier: 2,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 19,
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let sizeClass = 'small';
        let colorClass = 'music';

        if (count >= 10) {
          sizeClass = 'large';
        } else if (count >= 5) {
          sizeClass = 'medium';
        }

        const markers = cluster.getAllChildMarkers();
        const typeCount: Record<string, number> = {};
        markers.forEach((marker: any) => {
          const type = marker.eventData?.type || 'music';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        const dominantType = Object.keys(typeCount).reduce((a, b) =>
          typeCount[a] > typeCount[b] ? a : b
        );
        colorClass = dominantType;

        return L.divIcon({
          html: `<div class="cluster-inner cluster-${colorClass}"><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: L.point(50, 50),
        });
      },
    });

    markerClusterGroupRef.current = markerClusterGroup;
    map.addLayer(markerClusterGroup);
    mapInstanceRef.current = map;

    const handleRecenter = () => {
      if (userLocationRef.current) {
        map.flyTo([userLocationRef.current.lat, userLocationRef.current.lng], 15, {
          duration: 1.5,
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userLocationRef.current.lat, userLocationRef.current.lng]);
        }
      } else {
        navigator.geolocation?.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            userLocationRef.current = { lat: latitude, lng: longitude };
            map.flyTo([latitude, longitude], 15, { duration: 1.5 });

            if (!userMarkerRef.current) {
              const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `<div class="user-location-pulse"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });

              const userMarker = L.marker([latitude, longitude], { icon: userIcon })
                .addTo(map)
                .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');

              userMarkerRef.current = userMarker;
            } else {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            }
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              toast.error('Veuillez activer la localisation dans les paramètres de votre navigateur', {
                duration: 5000,
              });
            } else {
              toast.error('Impossible d\'obtenir votre position', {
                duration: 3000,
              });
            }
          }
        );
      }
    };

    window.addEventListener('recenterMap', handleRecenter);

    const handleZoomIn = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomIn();
      }
    };

    const handleZoomOut = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.zoomOut();
      }
    };

    window.addEventListener('zoomIn', handleZoomIn);
    window.addEventListener('zoomOut', handleZoomOut);

    return () => {
      markersRef.current = [];
      routeCoordinatesRef.current = [];
      if (markerClusterGroupRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
      window.removeEventListener('recenterMap', handleRecenter);
      window.removeEventListener('zoomIn', handleZoomIn);
      window.removeEventListener('zoomOut', handleZoomOut);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current || !events || isLoading) return;

    const map = mapInstanceRef.current;
    const markerClusterGroup = markerClusterGroupRef.current;

    markersRef.current = [];
    markerClusterGroup.clearLayers();

    const createCustomIcon = (imageUrl: string, eventType: string) => {
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-image-container">
            <div class="marker-image-wrapper marker-${eventType}">
              <img src="${imageUrl || defaultImage}" alt="Event" class="marker-event-image" />
            </div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
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
        icon: createCustomIcon(event.image_url || '', event.category),
      });

      console.log('Creating marker for event:', event.title);

      const dateFormatted = formatEventDate(event.date);
      const timeFormatted = formatEventTime(event.time);
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';

      const popupContent = `
        <div class="event-popup-card">
          <div class="popup-card-image" style="background-image: url('${event.image_url || defaultImage}')">
            <div class="popup-card-gradient">
              <h3 class="popup-card-title">${event.title}</h3>
              <div class="popup-card-details">
                <div class="popup-date-box">
                  <div class="popup-date-month">${dateFormatted.month}</div>
                  <div class="popup-date-day">${dateFormatted.day}</div>
                  <div class="popup-date-weekday">${dateFormatted.weekday}</div>
                </div>
                <div class="popup-card-info">
                  <div class="popup-venue-row">
                    <p class="popup-card-venue">${event.venue}</p>
                    <div class="popup-card-time">
                      <div class="popup-time-value">${timeFormatted}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="popup-actions" style="display:flex;gap:6px;margin-top:8px;">
                <button class="popup-route-btn" style="flex:1;background:rgba(255,255,255,0.95);color:#1c1917;border:none;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;"><img src="${itineraryIcon}" alt="" style="width:20px;height:20px;object-fit:contain;" />Itinéraire</button>
                <button class="popup-details-btn" style="flex:1;">Voir détails</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const popup = L.popup({
        className: 'custom-popup-card',
        closeButton: true,
        maxWidth: 220,
        minWidth: 220,
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
        console.log('Marker clicked:', event.title);
        const key = `${event.latitude}-${event.longitude}`;
        const countAtPosition = coordCounts.get(key) || 1;

        if (countAtPosition === 1) {
          map.flyTo([event.latitude, event.longitude], 16, {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }
      });

      marker.on('popupopen', () => {
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
        if (bounds.isValid() && !map.getBounds().intersects(bounds)) {
          map.fitBounds(bounds, {
            padding: [36, 36],
            maxZoom: 13,
            animate: true,
          });
        }
      }

      didAutoRecenterRef.current = true;
    }
  }, [events, isLoading, navigate, setRouteDestination]);

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
    routeCoordinatesRef.current = [];
    setConnectorTarget(null);

    if (!routeDestination) {
      setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: false });
      return;
    }

    const destIcon = L.divIcon({
      className: 'route-destination-marker',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:hsl(var(--primary));border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    destinationMarkerRef.current = L.marker([routeDestination.lat, routeDestination.lng], { icon: destIcon }).addTo(map);

    const ensureUserLocation = (): Promise<{ lat: number; lng: number }> =>
      new Promise((resolve, reject) => {
        if (userLocationRef.current) return resolve(userLocationRef.current);
        if (!navigator.geolocation) return reject(new Error('no-geo'));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            userLocationRef.current = loc;
            resolve(loc);
          },
          () => reject(new Error('denied')),
          { timeout: 7000 }
        );
      });

    setRouteInfo({ distanceKm: null, durationMin: null, loading: true, error: false });

    let cancelled = false;

    ensureUserLocation()
      .then(async (origin) => {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${routeDestination.lng},${routeDestination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('osrm-error');
        const data = await res.json();
        if (cancelled) return;
        const route = data.routes?.[0];
        if (!route) throw new Error('no-route');

        const coords: L.LatLngTuple[] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        const polyline = L.polyline(coords, {
          color: 'hsl(24 95% 53%)',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
        routeLayerRef.current = polyline;
        routeCoordinatesRef.current = coords;

        map.fitBounds(polyline.getBounds(), { padding: [60, 60], maxZoom: 15, animate: true });
        window.requestAnimationFrame(() => updateConnectorTarget());

        setRouteInfo({
          distanceKm: route.distance / 1000,
          durationMin: route.duration / 60,
          loading: false,
          error: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.message === 'denied' || err.message === 'no-geo') {
          toast.error('Activez la localisation pour calculer un itinéraire');
        }
        routeCoordinatesRef.current = [];
        setConnectorTarget(null);
        setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [routeDestination, updateConnectorTarget]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current) return;

    const query = searchQuery.toLowerCase().trim();
    const clusterGroup = markerClusterGroupRef.current;

    clusterGroup.clearLayers();

    markersRef.current.forEach((marker) => {
      const eventData = (marker as any).eventData;
      if (!eventData) return;

      const matchesSearch = !query ||
        eventData.title.toLowerCase().includes(query) ||
        eventData.venue.toLowerCase().includes(query) ||
        eventData.type.toLowerCase().includes(query);

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(eventData.category);

      if (matchesSearch && matchesCategory) {
        clusterGroup.addLayer(marker);
      }
    });
  }, [searchQuery, selectedCategories]);

  return (
    <>
      <div ref={mapRef} className="absolute inset-0 z-0" />
      <RouteInfoPanel
        distanceKm={routeInfo.distanceKm}
        durationMin={routeInfo.durationMin}
        loading={routeInfo.loading}
        error={routeInfo.error}
        connectorTarget={connectorTarget}
        onAnchorChange={setPanelAnchorPoint}
      />
    </>
  );
};

export default MapView;
