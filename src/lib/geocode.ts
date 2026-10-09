/**
 * Recherche de lieux pour la création d'événement (Nominatim / OpenStreetMap).
 * Toute la Côte d'Ivoire, sans dépendre de la position de l'utilisateur :
 * taper « Bouaké » doit donner la ville de Bouaké, pas une rue d'Abidjan.
 * Les villes connues (lib/cities) qui correspondent à la saisie passent en tête.
 */
import { CITIES, cityOf, normalizeName } from '@/lib/cities';

export interface PlaceResult {
  lat: number;
  lng: number;
  /** Nom court : le lieu ou la rue */
  title: string;
  /** Quartier, ville */
  subtitle: string;
  /** Ville, commune ou village */
  locality?: string;
}

type NominatimAddress = Record<string, string | undefined>;
interface NominatimItem {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

const BASE = 'https://nominatim.openstreetmap.org';

const normalize = normalizeName;

/** Villes de la liste dont le nom correspond à la saisie (« bouake », « Yamoussou »…). */
const matchingCities = (query: string): PlaceResult[] => {
  const q = normalize(query);
  if (q.length < 3) return [];
  return CITIES
    .filter((c) => {
      const name = normalize(c.name);
      return name.startsWith(q) || q === name || q.startsWith(`${name} `) || q.endsWith(` ${name}`);
    })
    .map((c) => ({ lat: c.lat, lng: c.lng, title: c.name, subtitle: "Côte d'Ivoire" }));
};

const isOnlyCity = (query: string) => {
  const q = normalize(query);
  return CITIES.some((c) => normalize(c.name).startsWith(q) || normalize(c.name) === q);
};

const toPlace = (item: NominatimItem): PlaceResult => {
  const a = item.address ?? {};
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const title = item.name || a.road || a.neighbourhood || a.suburb || item.display_name.split(',')[0];
  const area = a.suburb || a.neighbourhood || a.quarter || a.city_district;
  const town = a.city || a.town || a.village || a.municipality || cityOf(lat, lng) || '';
  const subtitle = [area !== title ? area : null, town !== title ? town : null].filter(Boolean).join(', ');
  const locality = a.city || a.town || a.village || a.municipality || undefined;
  return { lat, lng, title, subtitle, locality };
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const cities = matchingCities(query);
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    countrycodes: 'ci',
    addressdetails: '1',
    limit: '5',
    'accept-language': 'fr',
  });
  let places: PlaceResult[] = [];
  try {
    const res = await fetch(`${BASE}/search?${params}`, { signal });
    if (res.ok) places = ((await res.json()) as NominatimItem[]).map(toPlace);
  } catch (err) {
    if (!cities.length) throw err;
  }
  // La saisie est juste un nom de ville : la ville d'abord, puis les lieux trouvés ailleurs
  if (cities.length && isOnlyCity(query)) {
    const rest = places.filter((p) => !cities.some((c) => normalize(c.title) === normalize(p.title)));
    return [...cities, ...rest].slice(0, 5);
  }
  return [...places, ...cities.filter((c) => !places.some((p) => normalize(p.title) === normalize(c.title)))].slice(0, 5);
}

/** Nom lisible d'un point (pour « Ma position »). */
export async function reversePlace(lat: number, lng: number): Promise<PlaceResult | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '17',
    addressdetails: '1',
    'accept-language': 'fr',
  });
  try {
    const res = await fetch(`${BASE}/reverse?${params}`);
    if (!res.ok) return null;
    const item: NominatimItem = await res.json();
    return item?.lat ? toPlace(item) : null;
  } catch {
    return null;
  }
}
