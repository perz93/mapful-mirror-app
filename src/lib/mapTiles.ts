// Fond de carte OpenStreetMap : aucune clé API requise.
// (Les tuiles CARTO renvoyaient « API key required » sur les domaines non autorisés.)
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_OPTIONS = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  className: 'map-tiles',
} as const;
