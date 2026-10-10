import L from 'leaflet';

/**
 * Fond de carte VIBE.
 *
 * Carte vectorielle OpenFreeMap (aucune clé API) rendue par MapLibre sous les
 * marqueurs Leaflet, et recolorée pour un rendu doux : fond presque blanc, routes
 * beige clair, eau bleu pâle, parcs vert tendre, quartiers en capitales grises.
 * Si WebGL ou le style ne sont pas disponibles, on retombe sur les tuiles
 * raster OpenStreetMap.
 */

const VECTOR_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_TILE_OPTIONS = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
  className: 'map-tiles',
} as const;

/** Crédits cartographiques, affichés dans Paramètres (obligation de la licence ODbL). */
export const MAP_CREDITS = [
  { label: 'OpenStreetMap', href: 'https://www.openstreetmap.org/copyright' },
  { label: 'OpenFreeMap', href: 'https://openfreemap.org' },
  { label: 'OpenMapTiles', href: 'https://openmaptiles.org' },
];

const C = {
  land: '#fafaf8',
  residential: '#f7f6f2',
  building: '#efede6',
  water: '#a9d9f2',
  park: '#e8f1de',
  wood: '#e2edd5',
  road: '#efe9da',
  roadMajor: '#eae0c6',
  roadCasing: '#e3d9bf',
  rail: '#d6d3cb',
  boundary: '#e0ddd4',
  label: '#8c887c',
  labelStrong: '#4a473f',
  halo: '#fafaf8',
};

type StyleLayer = {
  id: string;
  type: string;
  'source-layer'?: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};
type StyleSpec = { layers: StyleLayer[]; [key: string]: unknown };

const has = (id: string, ...parts: string[]) => parts.some((p) => id.includes(p));

/** Recolore le style Positron par couche, sans dépendre de ses identifiants exacts. */
export function recolorStyle(style: StyleSpec): StyleSpec {
  const layers: StyleLayer[] = [];

  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const src = layer['source-layer'] ?? '';
    const paint = { ...(layer.paint ?? {}) };
    const layout = { ...(layer.layout ?? {}) };

    // On épure : pas de pictos de POI ni d'étiquettes de numéros.
    if (src === 'poi' || src === 'housenumber' || src === 'aerodrome_label') continue;

    if (layer.type === 'background') {
      paint['background-color'] = C.land;
    } else if (layer.type === 'fill') {
      if (src === 'water') paint['fill-color'] = C.water;
      else if (src === 'park' || has(id, 'park', 'grass')) paint['fill-color'] = C.park;
      else if (src === 'landcover') paint['fill-color'] = has(id, 'wood', 'forest') ? C.wood : C.park;
      else if (src === 'building') {
        paint['fill-color'] = C.building;
        paint['fill-outline-color'] = C.building;
      } else if (src === 'landuse') paint['fill-color'] = C.residential;
      if ('fill-pattern' in paint) delete paint['fill-pattern'];
    } else if (layer.type === 'line') {
      if (src === 'waterway' || src === 'water') paint['line-color'] = C.water;
      else if (src === 'boundary') paint['line-color'] = C.boundary;
      else if (src === 'transportation') {
        if (has(id, 'rail', 'transit')) paint['line-color'] = C.rail;
        else if (has(id, 'casing')) paint['line-color'] = C.roadCasing;
        else if (has(id, 'motorway', 'trunk', 'primary', 'major')) paint['line-color'] = C.roadMajor;
        else paint['line-color'] = C.road;
      }
    } else if (layer.type === 'symbol') {
      if (src === 'water_name' || src === 'waterway') {
        paint['text-color'] = '#3f7fa6';
      } else if (src === 'place') {
        const isCity = has(id, 'city', 'capital', 'town');
        paint['text-color'] = isCity ? C.labelStrong : C.label;
        if (!isCity && !has(id, 'country', 'state', 'continent')) {
          layout['text-transform'] = 'uppercase';
          layout['text-letter-spacing'] = 0.08;
        }
      } else {
        paint['text-color'] = C.label;
      }
      paint['text-halo-color'] = C.halo;
      paint['text-halo-width'] = 1.4;
    }

    layers.push({ ...layer, paint, layout });
  }

  return { ...style, layers };
}

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

/**
 * Ajoute le fond de carte stylé. Renvoie une fonction de nettoyage.
 * Pendant le chargement, le conteneur affiche le fond clair avec le reflet
 * de chargement du site (classe .map-loading), retiré dès que les tuiles sont là.
 * En cas d'échec du vectoriel, tuiles OSM.
 *
 * Pas de contrôle d'attribution sur la carte (choix produit) : les crédits
 * OpenStreetMap / OpenFreeMap sont affichés dans Paramètres (MAP_CREDITS).
 */
export function addBaseMap(map: L.Map): () => void {
  let disposed = false;
  let current: L.Layer | null = null;
  const container = map.getContainer();
  container.classList.add('map-loading');
  const doneLoading = () => container.classList.remove('map-loading');
  // Filet de sécurité : jamais de reflet infini si un événement manque.
  const safety = window.setTimeout(doneLoading, 8000);

  const showRaster = () => {
    if (disposed || current) return;
    const raster = L.tileLayer(MAP_TILE_URL, MAP_TILE_OPTIONS);
    raster.once('load', doneLoading);
    current = raster.addTo(map);
  };

  if (!supportsWebGL()) {
    showRaster();
  } else {
    (async () => {
      try {
        const [res] = await Promise.all([
          fetch(VECTOR_STYLE_URL),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ]);
        if (!res.ok) throw new Error(`style ${res.status}`);
        const style = recolorStyle(await res.json());
        const { maplibreGL } = await import('@maplibre/maplibre-gl-leaflet');
        if (disposed) return;

        const vector = maplibreGL({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style: style as any,
          attributionControl: false,
        });
        current = vector.addTo(map);
        vector.getMaplibreMap().once('idle', doneLoading);
      } catch (err) {
        console.warn('[map] fond vectoriel indisponible, tuiles OSM utilisées', err);
        current = null;
        showRaster();
      }
    })();
  }

  return () => {
    disposed = true;
    window.clearTimeout(safety);
    doneLoading();
    if (current && map.hasLayer(current)) map.removeLayer(current);
  };
}
