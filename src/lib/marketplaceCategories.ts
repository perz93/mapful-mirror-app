import { DoorOpen, ChefHat, Disc3, Flower2, Tent, Camera, Shirt, Shapes, type LucideIcon } from 'lucide-react';

/**
 * Catégories du Marketplace — source unique (puces, formulaires, détail).
 * Les clés correspondent à l'enum Postgres `marketplace_category` ;
 * les 4 premières gardent leur ancienne clé pour ne pas toucher aux annonces existantes.
 */
export const MARKETPLACE_CATEGORIES: { value: string; fr: string; en: string; icon: LucideIcon }[] = [
  { value: 'location_espaces', fr: 'Lieux & salles', en: 'Venues', icon: DoorOpen },
  { value: 'traiteurs', fr: 'Traiteurs & boissons', en: 'Catering & drinks', icon: ChefHat },
  { value: 'animation_dj', fr: 'Musique & animation', en: 'Music & entertainment', icon: Disc3 },
  { value: 'decoration', fr: 'Décoration & fleurs', en: 'Decor & flowers', icon: Flower2 },
  { value: 'materiel', fr: 'Matériel & location', en: 'Equipment rental', icon: Tent },
  { value: 'photo_video', fr: 'Photo & vidéo', en: 'Photo & video', icon: Camera },
  { value: 'beaute_tenues', fr: 'Beauté & tenues', en: 'Beauty & outfits', icon: Shirt },
  { value: 'autre', fr: 'Autre', en: 'Other', icon: Shapes },
];

export const getMarketplaceCategory = (value: string | null | undefined) =>
  MARKETPLACE_CATEGORIES.find((c) => c.value === value) ?? MARKETPLACE_CATEGORIES[MARKETPLACE_CATEGORIES.length - 1];

export const marketplaceCategoryLabel = (value: string | null | undefined, lang: string = 'fr') => {
  const c = getMarketplaceCategory(value);
  return lang === 'en' ? c.en : c.fr;
};
