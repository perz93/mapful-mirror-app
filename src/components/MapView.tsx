import { useEffect, useRef } from 'react';
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

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { searchQuery, selectedCategories } = useSearch();
  const { data: events, isLoading } = useEvents();

  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const didAutoRecenterRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map - Centered on Abidjan, Côte d'Ivoire
    // Check if there's a saved map position
    const savedPosition = sessionStorage.getItem('mapPosition');

    // Lower = more zoomed out
    const DEFAULT_INITIAL_ZOOM = 11;

    let initialCenter: [number, number] = [5.3600, -4.0083];
    let initialZoom = DEFAULT_INITIAL_ZOOM;

    if (savedPosition) {
      const { lat, lng, zoom } = JSON.parse(savedPosition);
      initialCenter = [lat, lng];
      // Prevent reopening the app too zoomed-in
      initialZoom = Math.min(Number(zoom) || DEFAULT_INITIAL_ZOOM, DEFAULT_INITIAL_ZOOM);
    }

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true, // Better performance
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    // Add tile layer with balanced colors (soft but not too white)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 20,
    }).addTo(map);

    // Save map position on move
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      sessionStorage.setItem('mapPosition', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom
      }));
    });

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocationRef.current = { lat: latitude, lng: longitude };
          
          // Center map on user location only on first visit
          if (!savedPosition) {
            map.setView([latitude, longitude], DEFAULT_INITIAL_ZOOM);
          }
          // Add user location marker
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
          // Show toast only once per session
          if (error.code === error.PERMISSION_DENIED && !sessionStorage.getItem('locationToastShown')) {
            sessionStorage.setItem('locationToastShown', '1');
            toast.error('Veuillez activer la localisation dans les paramètres de votre navigateur pour voir votre position sur la carte', {
              duration: 5000
            });
          }
        }
      );
    }

    // Create custom marker icon with event image
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

    // SVG icons for markers
    const iconSvgs = {
      music: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      food: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
      sports: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
      arts: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="M12 18v4"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="M4.93 19.07l4.24-4.24"/><path d="M14.83 9.17l4.24-4.24"/></svg>',
    };

    // Create marker cluster group with custom options
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
        let colorClass = 'music'; // Default color
        
        // Determine cluster size
        if (count >= 10) {
          sizeClass = 'large';
        } else if (count >= 5) {
          sizeClass = 'medium';
        }
        
        // Get dominant event type from markers in cluster
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

    // Listen for recenter event from MapControls
    const handleRecenter = () => {
      if (userLocationRef.current) {
        map.flyTo([userLocationRef.current.lat, userLocationRef.current.lng], 15, {
          duration: 1.5
        });
        
        // Update user marker position
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userLocationRef.current.lat, userLocationRef.current.lng]);
        }
      } else {
        // Request location again if not available
        navigator.geolocation?.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            userLocationRef.current = { lat: latitude, lng: longitude };
            map.flyTo([latitude, longitude], 15, { duration: 1.5 });
            
            // Add or update user location marker
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
                duration: 5000
              });
            } else {
              toast.error('Impossible d\'obtenir votre position', {
                duration: 3000
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

    // Cleanup
    return () => {
      markersRef.current = [];
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

  // Add markers when events data is loaded
  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current || !events || isLoading) return;

    const map = mapInstanceRef.current;
    const markerClusterGroup = markerClusterGroupRef.current;

    // Clear existing markers
    markersRef.current = [];
    markerClusterGroup.clearLayers();

    // Create custom marker icon with event image
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

    // Format helpers
    const formatEventDate = (dateStr: string) => {
      try {
        const date = parseISO(dateStr);
        return {
          month: format(date, 'MMM', { locale: fr }).toUpperCase(),
          day: format(date, 'd'),
          weekday: format(date, 'EEE', { locale: fr }).toUpperCase()
        };
      } catch {
        return { month: 'NOV', day: '16', weekday: 'SAM' };
      }
    };

    const formatEventTime = (timeStr: string) => {
      try {
        // timeStr is in format HH:MM:SS
        const [hours, minutes] = timeStr.split(':');
        return `${hours}h${minutes}`;
      } catch {
        return '20h00';
      }
    };

    // Create and store all markers
    const coordCounts = new Map<string, number>();
    events.forEach(event => {
      const key = `${event.latitude}-${event.longitude}`;
      coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
    });

    events.forEach(event => {
      const marker = L.marker([event.latitude, event.longitude], {
        icon: createCustomIcon(event.image_url || '', event.category)
      });
      
      console.log('Creating marker for event:', event.title);

      const dateFormatted = formatEventDate(event.date);
      const timeFormatted = formatEventTime(event.time);
      const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';

      // Create popup content exactly like reference
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
              <button class="popup-details-btn">Voir détails</button>
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
      
      // Store marker with event data - map category to type for filtering
      (marker as any).eventData = {
        ...event,
        type: event.category, // Map category to type for compatibility
        lat: event.latitude,
        lng: event.longitude,
        image: event.image_url
      };
      markersRef.current.push(marker);

      // Add to cluster group AFTER binding popup
      markerClusterGroup.addLayer(marker);

      // Center map on marker with zoom effect only when it is alone at this position
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
 
      // Add click handler only on "Voir détails" button
      marker.on('popupopen', () => {
        console.log('Popup opened for:', event.title);
        const popupInstance = marker.getPopup();
        const popupElement = popupInstance?.getElement();
        if (!popupElement) return;
 
        const detailsBtn = popupElement.querySelector('.popup-details-btn') as HTMLElement | null;
        if (detailsBtn) {
          detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Navigating to event:', event.id);
            navigate(`/event/${event.id}`);
          });
        }
      });
    });

    // If the map was previously moved far away (saved position), ensure the user still sees events.
    // Run once per component mount to avoid fighting the user.
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
  }, [events, isLoading, navigate]);

  // Filter markers based on search query and selected categories
  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterGroupRef.current) return;

    const query = searchQuery.toLowerCase().trim();
    const clusterGroup = markerClusterGroupRef.current;

    // Clear and rebuild cluster
    clusterGroup.clearLayers();

    markersRef.current.forEach(marker => {
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

  return <div ref={mapRef} className="absolute inset-0 z-0" />;
};

export default MapView;

