import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [40.7589, -73.9851],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
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

    // Add event markers
    const events = [
      { lat: 40.7589, lng: -73.9851, icon: '🎵', type: 'music' },
      { lat: 40.7689, lng: -73.9751, icon: '🎵', type: 'music' },
      { lat: 40.7489, lng: -73.9951, icon: '🍔', type: 'food' },
      { lat: 40.7789, lng: -73.9651, icon: '🏆', type: 'sports' },
      { lat: 40.7389, lng: -73.9851, icon: '🎨', type: 'arts' },
    ];

    events.forEach(event => {
      L.marker([event.lat, event.lng], {
        icon: createCustomIcon(event.icon)
      }).addTo(map);
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

