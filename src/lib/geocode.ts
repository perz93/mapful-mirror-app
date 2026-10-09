/**
 * Recherche de lieux pour la création d'événement (Nominatim / OpenStreetMap).
 * Toute la Côte d'Ivoire, pas seulement Abidjan : on privilégie seulement les
 * résultats proches de l'utilisateur (ou de la carte) quand on connaît sa position.
 */
import { cityOf } from '@/lib/cities';

export interface PlaceResult {
  lat: number;
  lng: number;
  /** Nom court : le lieu ou la rue */
  title: string;
  /** Quartier, ville */
  subtitle: string;
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

const toPlace = (item: NominatimItem): PlaceResult => {
  const a = item.address ?? {};
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const title = item.name || a.road || a.neighbourhood || a.suburb || item.display_name.split(',')[0];
  const area = a.suburb || a.neighbourhood || a.quarter || a.city_district;
  const town = a.city || a.town || a.village || a.municipality || cityOf(lat, lng) || '';
  const subtitle = [area !== title ? area : null, town !== title ? town : null].filter(Boolean).join(', ');
  return { lat, lng, title, subtitle };
};

export async function searchPlaces(
  query: string,
  near?: { lat: number; lng: number } | null,
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    countrycodes: 'ci',
    addressdetails: '1',
    limit: '5',
    'accept-language': 'fr',
  });
  if (near) {
    // Boîte d'environ 60 km autour du point : favorise sans exclure le reste du pays
    const d = 0.3;
    params.set('viewbox', `${near.lng - d},${near.lat + d},${near.lng + d},${near.lat - d}`);
  }
  const res = await fetch(`${BASE}/search?${params}`, { signal });
  if (!res.ok) return [];
  const data: NominatimItem[] = await res.json();
  return data.map(toPlace);
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
