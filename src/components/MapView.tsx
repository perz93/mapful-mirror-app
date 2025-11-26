import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { searchQuery } = useSearch();

  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map - Centered on Abidjan, Côte d'Ivoire
    const map = L.map(mapRef.current, {
      center: [5.3600, -4.0083],
      zoom: 13,
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

    // Try to get user's location and center map on it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocationRef.current = { lat: latitude, lng: longitude };
          
          // Center map on user location
          map.setView([latitude, longitude], 14);
          
          // Add user location marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div class="user-location-pulse"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          
          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error);
          // Keep default Abidjan location
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
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: true,
      maxClusterRadius: 80,
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

    // Add event markers around Abidjan
    const events = [
      { lat: 5.3600, lng: -4.0083, icon: iconSvgs.music, type: 'music', title: 'Indie Music Festival', venue: 'Central Park', date: 'Sat, Nov 16', time: '8:00 PM', price: '15,000 FCFA', capacity: '500', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop', id: '1' },
      { lat: 5.3700, lng: -4.0000, icon: iconSvgs.music, type: 'music', title: 'Jazz Night', venue: 'Blue Note', date: 'Fri, Nov 15', time: '9:00 PM', price: '12,000 FCFA', capacity: '200', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop', id: '2' },
      { lat: 5.3500, lng: -4.0150, icon: iconSvgs.food, type: 'food', title: 'Food Truck Festival', venue: 'Marina Bay', date: 'Sun, Nov 17', time: '12:00 PM', price: 'Gratuit', capacity: '1000', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', id: '3' },
      { lat: 5.3800, lng: -3.9950, icon: iconSvgs.sports, type: 'sports', title: 'Basketball Championship', venue: 'Sports Arena', date: 'Sat, Nov 16', time: '6:00 PM', price: '8,000 FCFA', capacity: '300', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop', id: '4' },
      { lat: 5.3400, lng: -4.0100, icon: iconSvgs.arts, type: 'arts', title: 'Art Exhibition', venue: 'Modern Gallery', date: 'Thu, Nov 14', time: '10:00 AM', price: '5,000 FCFA', capacity: '150', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop', id: '5' },
    ];

    // Create and store all markers
    events.forEach(event => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createCustomIcon(event.image, event.type)
      });
      
      console.log('Creating marker for event:', event.title);

      // Create popup content exactly like reference
      const popupContent = `
        <div class="event-popup-card">
          <div class="popup-card-image" style="background-image: url('${event.image}')">
            <div class="popup-card-gradient">
              <h3 class="popup-card-title">${event.title}</h3>
              <div class="popup-card-bottom">
                <div class="popup-date-box">
                  <div class="popup-date-month">NOV</div>
                  <div class="popup-date-day">16</div>
                  <div class="popup-date-weekday">SAM</div>
                </div>
                <div class="popup-card-info">
                  <p class="popup-card-venue">${event.venue}</p>
                  <p class="popup-card-address">${event.venue}</p>
                </div>
                <div class="popup-card-time">${event.time}</div>
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
      
      // Store marker with event data
      (marker as any).eventData = event;
      markersRef.current.push(marker);

      // Add to cluster group AFTER binding popup
      markerClusterGroup.addLayer(marker);

      // Center map on marker when clicked
      marker.on('click', () => {
        console.log('Marker clicked:', event.title);
        map.flyTo([event.lat, event.lng], 15, {
          duration: 0.5,
          easeLinearity: 0.25
        });
      });

      // Add click handler on popup to navigate to event details
      marker.on('popupopen', () => {
        console.log('Popup opened for:', event.title);
        const popupElement = document.querySelector('.custom-popup-card') as HTMLElement;
        if (popupElement) {
          popupElement.style.cursor = 'pointer';
          popupElement.addEventListener('click', () => {
            console.log('Navigating to event:', event.id);
            navigate(`/event/${event.id}`);
          });
        }
      });
    });

    mapInstanceRef.current = map;

    // Listen for recenter event from MapControls
    const handleRecenter = () => {
      if (userLocationRef.current) {
        map.flyTo([userLocationRef.current.lat, userLocationRef.current.lng], 15, {
          duration: 1.5
        });
      } else {
        // Request location again if not available
        navigator.geolocation?.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          userLocationRef.current = { lat: latitude, lng: longitude };
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
          
          // Add user location marker if not already added
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div class="user-location-pulse"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          
          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="popup-body"><strong>Votre position</strong></div>');
        });
      }
    };

    window.addEventListener('recenterMap', handleRecenter);

    // Cleanup
    return () => {
      markersRef.current = [];
      if (markerClusterGroupRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
      window.removeEventListener('recenterMap', handleRecenter);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [navigate]);

  // Filter markers based on search query
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

      if (matchesSearch) {
        clusterGroup.addLayer(marker);
      }
    });
  }, [searchQuery]);

  return <div ref={mapRef} className="absolute inset-0 z-0" />;
};

export default MapView;

