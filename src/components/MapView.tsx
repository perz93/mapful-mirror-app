import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const center: [number, number] = [40.7589, -73.9851]; // New York City

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="absolute inset-0 z-0"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
    </MapContainer>
  );
};

export default MapView;

