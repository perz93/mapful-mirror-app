import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

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

    // Add OpenStreetMap tile layer with grayscale filter
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'map-tiles',
    }).addTo(map);

    // Create custom marker icon
    const createCustomIcon = (iconHtml: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container">
            <div class="marker-pin">
              ${iconHtml}
            </div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });
    };

    // Add event markers around Abidjan
    const events = [
      { lat: 5.3600, lng: -4.0083, icon: '🎵', type: 'music', title: 'Indie Music Festival', venue: 'Central Park', date: 'Sat, Nov 16 • 8:00 PM', id: '1' },
      { lat: 5.3700, lng: -4.0000, icon: '🎵', type: 'music', title: 'Jazz Night', venue: 'Blue Note', date: 'Fri, Nov 15 • 9:00 PM', id: '2' },
      { lat: 5.3500, lng: -4.0150, icon: '🍔', type: 'food', title: 'Food Truck Festival', venue: 'Marina Bay', date: 'Sun, Nov 17 • 12:00 PM', id: '3' },
      { lat: 5.3800, lng: -3.9950, icon: '🏆', type: 'sports', title: 'Basketball Championship', venue: 'Sports Arena', date: 'Sat, Nov 16 • 6:00 PM', id: '4' },
      { lat: 5.3400, lng: -4.0100, icon: '🎨', type: 'arts', title: 'Art Exhibition', venue: 'Modern Gallery', date: 'Thu, Nov 14 • 10:00 AM', id: '5' },
    ];

    events.forEach(event => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createCustomIcon(event.icon)
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="event-popup">
          <div class="popup-icon">${event.icon}</div>
          <div class="popup-content">
            <p class="popup-venue">${event.venue}</p>
            <h3 class="popup-title">${event.title}</h3>
            <p class="popup-date">${event.date}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: true,
        maxWidth: 280,
      });

      // Add click handler to navigate to event details
      marker.on('click', () => {
        setTimeout(() => {
          navigate(`/event/${event.id}`);
        }, 300);
      });
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="absolute inset-0 z-0" />;
};

export default MapView;

