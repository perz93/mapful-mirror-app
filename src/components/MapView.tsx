import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import { useEvents } from '@/hooks/useEvents';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import RouteInfoPanel from './RouteInfoPanel';
import itineraryIcon from '@/assets/itinerary-icon.png';
import { fuzzyMatch } from '@/lib/fuzzyMatch';
import { getDistanceKm } from '@/hooks/useNearbyEvents';
import { supabase } from '@/integrations/supabase/client';

// Tile layer URLs
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function getPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

// Detect if running as installed PWA (standalone mode)
function isStandalonePWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { searchQuery, selectedCategories, routeDestination, setRouteDestination, distanceFilter } = useSearch();
  const { data: events, isLoading } = useEvents();

  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const didAutoRecenterRef = useRef(false);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const geoRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showGeoBanner, setShowGeoBanner] = useState(false);

  // Expose map instance and route coords to RouteInfoPanel via state
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLngTuple[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number | null; durationMin: number | null; loading: boolean; error: boolean }>({
    distanceKm: null,
    durationMin: null,
    loading: false,
    error: false,
  });

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
      preferCanvas: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    const isDark = getPrefersDark();
    const tileLayer = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Listen for dark mode changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(e.matches ? TILE_DARK : TILE_LIGHT);
      }
    };
    darkModeQuery.addEventListener('change', handleDarkModeChange);

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
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      spiderfyDistanceMultiplier: 2,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 12,
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let sizeClass = 'small';

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

        return L.divIcon({
          html: `<div class="cluster-inner cluster-${dominantType}"><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: L.point(50, 50),
        });
      },
    });

    markerClusterGroupRef.current = markerClusterGroup;
    map.addLayer(markerClusterGroup);
    mapInstanceRef.current = map;
    setMapInstance(map);

    const placeUserMarker = (latitude: number, longitude: number) => {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `<div class="user-location-pulse"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');
      } else {
        userMarkerRef.current.setLatLng([latitude, longitude]);
      }
    };

    let hasFlyedTo = false;
    const shouldFlyOnFirstFix = !savedPosition;

    const onGeoSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      userLocationRef.current = { lat: latitude, lng: longitude };
      setShowGeoBanner(false);

      // Clear retry timer since we got a fix
      if (geoRetryTimerRef.current) {
        clearTimeout(geoRetryTimerRef.current);
        geoRetryTimerRef.current = null;
      }

      if (shouldFlyOnFirstFix && !hasFlyedTo) {
        hasFlyedTo = true;
        map.flyTo([latitude, longitude], 15, { duration: 1.5 });
      }
      placeUserMarker(latitude, longitude);
    };

    let geoRetryCount = 0;
    const MAX_GEO_RETRIES = 6;

    const onGeoError = (err: GeolocationPositionError) => {
      console.log('[Geo] Error:', err.code, err.message, 'PWA:', isStandalonePWA(), 'retry:', geoRetryCount);

      if (userLocationRef.current) return; // Already have position, ignore error

      // Strategy: first try low accuracy, then high accuracy, alternate
      // iOS PWA sometimes needs enableHighAccuracy:true to trigger the real GPS chip
      if (geoRetryCount < MAX_GEO_RETRIES) {
        const useHighAccuracy = geoRetryCount % 2 === 1; // alternate
        const delay = geoRetryCount < 2 ? 2000 : 5000;
        geoRetryCount++;

        geoRetryTimerRef.current = setTimeout(() => {
          if (userLocationRef.current) return;
          navigator.geolocation.getCurrentPosition(
            onGeoSuccess,
            onGeoError,
            { enableHighAccuracy: useHighAccuracy, timeout: 12000, maximumAge: 0 }
          );
        }, delay);
      }

      // Show banner after 2nd failure (give it a chance first)
      if (geoRetryCount >= 2) {
        setShowGeoBanner(true);
      }
    };

    const locateUser = (flyTo: boolean) => {
      if (!navigator.geolocation) return;

      if (flyTo) hasFlyedTo = false;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          onGeoSuccess(position);
          if (flyTo) {
            map.flyTo([position.coords.latitude, position.coords.longitude], 15, { duration: 1.5 });
            hasFlyedTo = true;
          }
        },
        onGeoError,
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    };

    // Use watchPosition for continuous tracking — more reliable in PWA standalone
    // Use enableHighAccuracy:true — critical for iOS PWA to get a real GPS fix
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        onGeoSuccess,
        (err) => {
          // watchPosition error is less critical, just log it
          console.log('[Geo] Watch error:', err.code, err.message);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
      );
    }

    const handleRecenter = () => locateUser(true);

    // Immediate getCurrentPosition — try low accuracy first (faster), then watchPosition handles high accuracy
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        onGeoError,
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    }

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
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      // Clean up geolocation watch and retry timer
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (geoRetryTimerRef.current) {
        clearTimeout(geoRetryTimerRef.current);
        geoRetryTimerRef.current = null;
      }
      markersRef.current = [];
      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
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
      setMapInstance(null);
    };
  }, [navigate]);

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

  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current || !events || isLoading) return;

    const map = mapInstanceRef.current;
    const markerClusterGroup = markerClusterGroupRef.current;

    markersRef.current = [];
    markerClusterGroup.clearLayers();

    // Remove old heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const createCustomIcon = (imageUrl: string, eventType: string) => {
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-image-container">
            <div class="marker-image-wrapper marker-${eventType}">
              <img src="${imageUrl || defaultImage}" alt="Event" class="marker-event-image" loading="lazy" />
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
                    <span class="popup-badge-glass">${event.venue}</span>
                    <span class="popup-badge-glass">${timeFormatted}</span>
                  </div>
                </div>
              </div>
              <div class="popup-hype-row" data-event-id="${event.id}">
                <span class="popup-hype-count">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                  <span class="popup-hype-number">...</span> y vont
                </span>
                <button class="popup-going-btn" data-event-id="${event.id}">J'y vais</button>
              </div>
              <div class="popup-actions" style="display:flex;gap:6px;margin-top:6px;">
                <button class="popup-route-btn popup-btn-glass"><img src="${itineraryIcon}" alt="" style="width:20px;height:20px;object-fit:contain;" />Itinéraire</button>
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
        const key = `${event.latitude}-${event.longitude}`;
        const countAtPosition = coordCounts.get(key) || 1;

        if (countAtPosition === 1) {
          map.flyTo([event.latitude, event.longitude], 16, {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        }
      });

      marker.on('popupopen', async () => {
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

        // Load attendee count for popup hype row
        const hypeNumber = popupElement.querySelector('.popup-hype-number') as HTMLElement | null;
        const goingBtn = popupElement.querySelector('.popup-going-btn') as HTMLElement | null;

        if (hypeNumber) {
          const { count } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          hypeNumber.textContent = String(count ?? 0);
        }

        if (goingBtn) {
          // Check if current user is going
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from('event_attendees')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (data) {
              goingBtn.classList.add('popup-going-active');
              goingBtn.textContent = "J'y serai !";
            }

            goingBtn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const isActive = goingBtn.classList.contains('popup-going-active');

              if (isActive) {
                await supabase.from('event_attendees').delete()
                  .eq('event_id', event.id).eq('user_id', user.id);
                goingBtn.classList.remove('popup-going-active');
                goingBtn.textContent = "J'y vais";
                if (hypeNumber) {
                  hypeNumber.textContent = String(Math.max(0, parseInt(hypeNumber.textContent || '0') - 1));
                }
              } else {
                await supabase.from('event_attendees').insert({ event_id: event.id, user_id: user.id });
                goingBtn.classList.add('popup-going-active');
                goingBtn.textContent = "J'y serai !";
                if (hypeNumber) {
                  hypeNumber.textContent = String(parseInt(hypeNumber.textContent || '0') + 1);
                }
              }
            });
          } else {
            goingBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              navigate('/auth');
            });
          }
        }
      });
    });

    // Add heatmap layer based on event affluence (attendee %)
    // Only visible when zoom >= 12 (when clusters separate into individual markers)
    const HEATMAP_MIN_ZOOM = 11;

    (async () => {
      try {
        const eventIds = events.map((e) => e.id);
        const { data: attendeeCounts } = await supabase
          .from('event_attendees')
          .select('event_id')
          .in('event_id', eventIds);

        const countMap: Record<string, number> = {};
        if (attendeeCounts) {
          for (const row of attendeeCounts) {
            countMap[row.event_id] = (countMap[row.event_id] || 0) + 1;
          }
        }

        const heatPoints = events.map((e) => {
          const count = countMap[e.id] || 0;
          const capacity = e.capacity || 50;
          const pct = Math.min(count / capacity, 1);
          const intensity = 0.35 + pct * 0.65;
          return [e.latitude, e.longitude, intensity] as [number, number, number];
        });

        if (heatPoints.length > 0 && mapInstanceRef.current) {
          if (heatLayerRef.current) {
            mapInstanceRef.current.removeLayer(heatLayerRef.current);
          }

          const heatLayer = (L as any).heatLayer(heatPoints, {
            radius: 35,
            blur: 25,
            maxZoom: 18,
            max: 1.0,
            minOpacity: 0.3,
            gradient: {
              0.0:  '#dbeafe', // bleu très clair — 0-15%
              0.15: '#93c5fd', // bleu clair — 15%
              0.30: '#3b82f6', // bleu pur — 15-50%
              0.50: '#2563eb', // bleu pur intense — 50%
              0.60: '#f97316', // orange — 50-100%
              0.80: '#ea580c', // orange foncé
              1.00: '#dc2626', // orange-rouge — 100%
            },
          });

          heatLayerRef.current = heatLayer;

          // Show/hide heatmap based on zoom level
          const updateHeatmapVisibility = () => {
            if (!mapInstanceRef.current) return;
            const zoom = mapInstanceRef.current.getZoom();
            if (zoom >= HEATMAP_MIN_ZOOM) {
              if (!mapInstanceRef.current.hasLayer(heatLayer)) {
                mapInstanceRef.current.addLayer(heatLayer);
              }
            } else {
              if (mapInstanceRef.current.hasLayer(heatLayer)) {
                mapInstanceRef.current.removeLayer(heatLayer);
              }
            }
          };

          // Initial check
          updateHeatmapVisibility();
          // Listen for zoom changes
          mapInstanceRef.current.on('zoomend', updateHeatmapVisibility);

          // Scintillement pour les events >= 50% affluence
          const hotEvents = events.filter((e) => {
            const count = countMap[e.id] || 0;
            const capacity = e.capacity || 50;
            return (count / capacity) >= 0.50;
          });

          if (hotEvents.length > 0) {
            hotEvents.forEach((e) => {
              const el = document.createElement('div');
              el.className = 'heatmap-pulse-marker';
              const icon = L.divIcon({
                className: 'heatmap-pulse-icon',
                html: el.outerHTML,
                iconSize: [60, 60],
                iconAnchor: [30, 30],
              });
              const pulseMarker = L.marker([e.latitude, e.longitude], {
                icon,
                interactive: false,
                zIndexOffset: -1000,
              });
              markerClusterGroup.addLayer(pulseMarker);
            });
          }
        }
      } catch (err) {
        console.error('Heatmap load failed:', err);
      }
    })();

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
    setRouteCoordinates([]);

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
        setRouteCoordinates(coords);

        map.fitBounds(polyline.getBounds(), { padding: [60, 60], maxZoom: 15, animate: true });

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
        setRouteCoordinates([]);
        setRouteInfo({ distanceKm: null, durationMin: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [routeDestination]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current) return;

    const query = searchQuery.toLowerCase().trim();
    const clusterGroup = markerClusterGroupRef.current;

    clusterGroup.clearLayers();

    markersRef.current.forEach((marker) => {
      const eventData = (marker as any).eventData;
      if (!eventData) return;

      const matchesSearch = !query ||
        fuzzyMatch(eventData.title, query) ||
        fuzzyMatch(eventData.venue, query) ||
        fuzzyMatch(eventData.type, query);

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(eventData.category);

      let matchesDistance = true;
      if (distanceFilter && userLocationRef.current) {
        const dist = getDistanceKm(
          userLocationRef.current.lat, userLocationRef.current.lng,
          eventData.lat, eventData.lng
        );
        matchesDistance = dist <= distanceFilter;
      }

      if (matchesSearch && matchesCategory && matchesDistance) {
        clusterGroup.addLayer(marker);
      }
    });
  }, [searchQuery, selectedCategories, distanceFilter]);

  const [geoLoading, setGeoLoading] = useState(false);

  // Handle manual geo permission request (user tap = gesture → triggers iOS prompt)
  const handleGeoRetry = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);

    // Try high accuracy first (user gesture = good time to request real GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userLocationRef.current = { lat: latitude, lng: longitude };
        setShowGeoBanner(false);
        setGeoLoading(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `<div class="user-location-pulse"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');
          } else {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          }
        }
      },
      (err) => {
        setGeoLoading(false);
        setShowGeoBanner(true);
        // Different message based on error code
        if (err.code === 1) {
          // PERMISSION_DENIED
          if (isStandalonePWA()) {
            toast.error('Allez dans Réglages > Confidentialité > Service de localisation > vérifiez que votre navigateur et cette app sont autorisés');
          } else {
            toast.error('Autorisez la localisation dans les paramètres du navigateur');
          }
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT
          toast.error('Position GPS introuvable, réessayez dans quelques secondes');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <>
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Geo banner — shown when geolocation fails */}
      {showGeoBanner && (
        <div
          className="absolute z-[1000] left-4 right-4 animate-fade-in"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 70px)' }}
        >
          <button
            onClick={handleGeoRetry}
            disabled={geoLoading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#ee9d2b]/15 flex items-center justify-center">
              {geoLoading ? (
                <div className="w-4 h-4 border-2 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ee9d2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z"/>
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-stone-900 dark:text-white">
                {geoLoading ? 'Recherche GPS en cours...' : 'Position introuvable'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {geoLoading ? 'Veuillez patienter' : 'Touchez pour localiser votre position'}
              </p>
            </div>
            {!geoLoading && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ee9d2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74"/>
                <path d="M21 3v6h-6"/>
              </svg>
            )}
          </button>
        </div>
      )}

      <RouteInfoPanel
        distanceKm={routeInfo.distanceKm}
        durationMin={routeInfo.durationMin}
        loading={routeInfo.loading}
        error={routeInfo.error}
        mapInstance={mapInstance}
        routeCoordinates={routeCoordinates}
      />
    </>
  );
};

export default MapView;
