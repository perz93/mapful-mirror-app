import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

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
      { lat: 5.3600, lng: -4.0083, icon: '🎵', type: 'music' },
      { lat: 5.3700, lng: -4.0000, icon: '🎵', type: 'music' },
      { lat: 5.3500, lng: -4.0150, icon: '🍔', type: 'food' },
      { lat: 5.3800, lng: -3.9950, icon: '🏆', type: 'sports' },
      { lat: 5.3400, lng: -4.0100, icon: '🎨', type: 'arts' },
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

