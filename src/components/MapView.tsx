import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

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

    // Add tile layer with clear streets like Google Maps
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
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

    // Create custom marker icon with color based on event type
    const createCustomIcon = (iconSvg: string, eventType: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container">
            <div class="marker-pin marker-${eventType}">
              <div class="marker-icon">
                ${iconSvg}
              </div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
    };

    // SVG icons for markers
    const iconSvgs = {
      music: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
      food: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
      sports: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
      arts: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="M12 18v4"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="M4.93 19.07l4.24-4.24"/><path d="M14.83 9.17l4.24-4.24"/></svg>',
    };

    // Add event markers around Abidjan
    const events = [
      { lat: 5.3600, lng: -4.0083, icon: iconSvgs.music, type: 'music', title: 'Indie Music Festival', venue: 'Central Park', date: 'Sat, Nov 16', time: '8:00 PM', price: '15,000 FCFA', capacity: '500', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop', id: '1' },
      { lat: 5.3700, lng: -4.0000, icon: iconSvgs.music, type: 'music', title: 'Jazz Night', venue: 'Blue Note', date: 'Fri, Nov 15', time: '9:00 PM', price: '12,000 FCFA', capacity: '200', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop', id: '2' },
      { lat: 5.3500, lng: -4.0150, icon: iconSvgs.food, type: 'food', title: 'Food Truck Festival', venue: 'Marina Bay', date: 'Sun, Nov 17', time: '12:00 PM', price: 'Gratuit', capacity: '1000', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', id: '3' },
      { lat: 5.3800, lng: -3.9950, icon: iconSvgs.sports, type: 'sports', title: 'Basketball Championship', venue: 'Sports Arena', date: 'Sat, Nov 16', time: '6:00 PM', price: '8,000 FCFA', capacity: '300', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop', id: '4' },
      { lat: 5.3400, lng: -4.0100, icon: iconSvgs.arts, type: 'arts', title: 'Art Exhibition', venue: 'Modern Gallery', date: 'Thu, Nov 14', time: '10:00 AM', price: '5,000 FCFA', capacity: '150', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop', id: '5' },
    ];

    events.forEach(event => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createCustomIcon(event.icon, event.type)
      }).addTo(map);

      // Create popup content with image and more details
      const popupContent = `
        <div class="event-popup-modern">
          <div class="popup-image" style="background-image: url('${event.image}')">
            <div class="popup-image-overlay">
              <div class="popup-icon-modern">${event.icon}</div>
            </div>
          </div>
          <div class="popup-body">
            <p class="popup-venue-modern">${event.venue}</p>
            <h3 class="popup-title-modern">${event.title}</h3>
            <div class="popup-details-grid">
              <div class="popup-detail-item">
                <svg class="popup-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>${event.date}</span>
              </div>
              <div class="popup-detail-item">
                <svg class="popup-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${event.time}</span>
              </div>
              <div class="popup-detail-item">
                <svg class="popup-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span class="popup-price">${event.price}</span>
              </div>
              <div class="popup-detail-item">
                <svg class="popup-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>${event.capacity} places</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const popup = L.popup({
        className: 'custom-popup-modern',
        closeButton: true,
        maxWidth: 210,
      }).setContent(popupContent);

      marker.bindPopup(popup);

      // Center map on marker when popup opens
      marker.on('click', () => {
        map.flyTo([event.lat, event.lng], 15, {
          duration: 0.5,
          easeLinearity: 0.25
        });
      });

      // Add click handler on popup button to navigate to event details
      marker.on('popupopen', () => {
        const popupElement = document.querySelector('.custom-popup-modern');
        if (popupElement) {
          const button = document.createElement('button');
          button.className = 'popup-details-btn-modern';
          button.innerHTML = `
            <span>Voir les détails</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          `;
          button.onclick = () => navigate(`/event/${event.id}`);
          popupElement.querySelector('.popup-body')?.appendChild(button);
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
      window.removeEventListener('recenterMap', handleRecenter);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [navigate]);

  return <div ref={mapRef} className="absolute inset-0 z-0" />;
};

export default MapView;

