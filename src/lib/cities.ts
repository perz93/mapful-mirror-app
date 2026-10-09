/**
 * Villes de Côte d'Ivoire pour le filtre « Ville » de la recherche.
 * La ville d'une publication est déduite de ses coordonnées : on prend la
 * ville la plus proche, en tenant compte de son étendue (radiusKm), pour
 * qu'un événement à Cocody reste à Abidjan et pas à Bingerville.
 */
import { getDistanceKm } from '@/hooks/useNearbyEvents';

export interface City {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export const CITIES: City[] = [
  { name: 'Abidjan', lat: 5.345, lng: -4.024, radiusKm: 16 },
  { name: 'Bingerville', lat: 5.355, lng: -3.885, radiusKm: 3 },
  { name: 'Anyama', lat: 5.494, lng: -4.052, radiusKm: 3 },
  { name: 'Grand-Bassam', lat: 5.211, lng: -3.739, radiusKm: 4 },
  { name: 'Assinie', lat: 5.137, lng: -3.288, radiusKm: 6 },
  { name: 'Jacqueville', lat: 5.205, lng: -4.415, radiusKm: 4 },
  { name: 'Dabou', lat: 5.326, lng: -4.377, radiusKm: 3 },
  { name: 'Grand-Lahou', lat: 5.137, lng: -5.024, radiusKm: 3 },
  { name: 'Aboisso', lat: 5.468, lng: -3.207, radiusKm: 3 },
  { name: 'Agboville', lat: 5.928, lng: -4.213, radiusKm: 3 },
  { name: 'Adzopé', lat: 6.107, lng: -3.86, radiusKm: 3 },
  { name: 'Tiassalé', lat: 5.898, lng: -4.823, radiusKm: 3 },
  { name: 'Divo', lat: 5.837, lng: -5.357, radiusKm: 4 },
  { name: 'Yamoussoukro', lat: 6.827, lng: -5.289, radiusKm: 8 },
  { name: 'Toumodi', lat: 6.556, lng: -5.019, radiusKm: 3 },
  { name: 'Dimbokro', lat: 6.646, lng: -4.705, radiusKm: 3 },
  { name: 'Abengourou', lat: 6.73, lng: -3.496, radiusKm: 4 },
  { name: 'Bondoukou', lat: 8.04, lng: -2.8, radiusKm: 4 },
  { name: 'Bouaké', lat: 7.69, lng: -5.03, radiusKm: 8 },
  { name: 'Katiola', lat: 8.137, lng: -5.101, radiusKm: 3 },
  { name: 'Korhogo', lat: 9.458, lng: -5.629, radiusKm: 6 },
  { name: 'Ferkessédougou', lat: 9.593, lng: -5.197, radiusKm: 3 },
  { name: 'Boundiali', lat: 9.522, lng: -6.487, radiusKm: 3 },
  { name: 'Odienné', lat: 9.51, lng: -7.569, radiusKm: 3 },
  { name: 'Séguéla', lat: 7.961, lng: -6.673, radiusKm: 3 },
  { name: 'Touba', lat: 8.284, lng: -7.684, radiusKm: 3 },
  { name: 'Man', lat: 7.412, lng: -7.554, radiusKm: 5 },
  { name: 'Danané', lat: 7.26, lng: -8.155, radiusKm: 3 },
  { name: 'Duékoué', lat: 6.742, lng: -7.349, radiusKm: 3 },
  { name: 'Guiglo', lat: 6.543, lng: -7.493, radiusKm: 3 },
  { name: 'Daloa', lat: 6.877, lng: -6.45, radiusKm: 6 },
  { name: 'Issia', lat: 6.492, lng: -6.586, radiusKm: 3 },
  { name: 'Bouaflé', lat: 6.99, lng: -5.744, radiusKm: 3 },
  { name: 'Sinfra', lat: 6.621, lng: -5.912, radiusKm: 3 },
  { name: 'Gagnoa', lat: 6.131, lng: -5.951, radiusKm: 5 },
  { name: 'Soubré', lat: 5.785, lng: -6.594, radiusKm: 3 },
  { name: 'San-Pédro', lat: 4.748, lng: -6.636, radiusKm: 6 },
  { name: 'Sassandra', lat: 4.951, lng: -6.083, radiusKm: 3 },
];

/** Ville d'une publication d'après ses coordonnées (la plus proche). */
export const cityOf = (lat: number, lng: number): string | null => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let best: City | null = null;
  let bestScore = Infinity;
  for (const city of CITIES) {
    const score = getDistanceKm(lat, lng, city.lat, city.lng) - city.radiusKm;
    if (score < bestScore) {
      bestScore = score;
      best = city;
    }
  }
  return best?.name ?? null;
};

export const findCity = (name: string | null) => CITIES.find((c) => c.name === name) ?? null;
