import atelierIcon from '@/assets/icons/atelier.png';
import brunchIcon from '@/assets/icons/brunch.png';
import concertIcon from '@/assets/icons/concert.png';
import businessIcon from '@/assets/icons/business.png';
import artIcon from '@/assets/icons/art.png';
import festivalIcon from '@/assets/icons/festival.png';
import soireeIcon from '@/assets/icons/soiree.png';
import meetupIcon from '@/assets/icons/meetup.png';
import religieuxIcon from '@/assets/icons/religieux.png';
import spectacleIcon from '@/assets/icons/spectacle.png';
import sportIcon from '@/assets/icons/sport.png';

/**
 * Catégories d'événements — source unique (barre du bas, recherche,
 * formulaires, pages catégorie, détail). `value` est stocké tel quel
 * dans `events.category` : ne jamais renommer une clé existante.
 */
export interface EventCategory {
  value: string;
  tKey: string;
  path: string;
  icon: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { value: 'nightlife', tKey: 'cat.nightlife', path: '/soirees', icon: soireeIcon },
  { value: 'music', tKey: 'cat.music', path: '/concerts', icon: concertIcon },
  { value: 'festivals', tKey: 'cat.festivals', path: '/festivals', icon: festivalIcon },
  { value: 'shows', tKey: 'cat.shows', path: '/shows', icon: spectacleIcon },
  { value: 'brunch', tKey: 'cat.brunch', path: '/brunch', icon: brunchIcon },
  { value: 'exhibitions', tKey: 'cat.exhibitions', path: '/exhibitions', icon: artIcon },
  { value: 'conferences', tKey: 'cat.conferences', path: '/conferences', icon: businessIcon },
  { value: 'workshops', tKey: 'cat.workshops', path: '/workshops', icon: atelierIcon },
  { value: 'sports', tKey: 'cat.sports', path: '/sports', icon: sportIcon },
  { value: 'family', tKey: 'cat.family', path: '/famille', icon: meetupIcon },
  { value: 'religious', tKey: 'cat.religious', path: '/religious', icon: religieuxIcon },
];

/** Anciennes clés regroupées dans une catégorie plus large. */
const LEGACY: Record<string, string> = { meetups: 'conferences', food: 'brunch', arts: 'exhibitions' };

export const normalizeEventCategory = (value: string | null | undefined) =>
  (value && LEGACY[value]) || value || '';

export const getEventCategory = (value: string | null | undefined) =>
  EVENT_CATEGORIES.find((c) => c.value === normalizeEventCategory(value));

/** Toutes les clés stockées qui correspondent à une catégorie (anciennes incluses). */
export const eventCategoryKeys = (value: string) => [
  value,
  ...Object.entries(LEGACY).filter(([, to]) => to === value).map(([from]) => from),
];
