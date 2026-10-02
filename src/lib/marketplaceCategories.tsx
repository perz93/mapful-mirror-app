import type { ComponentType } from 'react';
import { Tent, Camera, Shirt, Shapes } from 'lucide-react';
import lieuxPng from '@/assets/icons/market/lieux.png';
import traiteursPng from '@/assets/icons/market/traiteurs.png';
import animationPng from '@/assets/icons/market/animation.png';
import decorationPng from '@/assets/icons/market/decoration.png';

type IconProps = { size?: number | string; strokeWidth?: number | string; className?: string };
type CategoryIcon = ComponentType<IconProps>;

/** Icône dessinée (PNG) utilisable comme une icône lucide : <Icon size={16} /> */
const pngIcon = (src: string): CategoryIcon => {
  const Png = ({ size = 16, className = '' }: IconProps) => (
    <img src={src} alt="" width={size} height={size} className={`object-contain ${className}`} style={{ width: size, height: size }} />
  );
  return Png;
};

/**
 * Catégories du Marketplace — source unique (puces, formulaires, détail).
 * Les clés correspondent à l'enum Postgres `marketplace_category` ;
 * les 4 premières gardent leur ancienne clé pour ne pas toucher aux annonces existantes.
 */
export const MARKETPLACE_CATEGORIES: { value: string; fr: string; en: string; icon: CategoryIcon }[] = [
  { value: 'location_espaces', fr: 'Lieux & salles', en: 'Venues', icon: pngIcon(lieuxPng) },
  { value: 'traiteurs', fr: 'Traiteurs & boissons', en: 'Catering & drinks', icon: pngIcon(traiteursPng) },
  { value: 'animation_dj', fr: 'Musique & animation', en: 'Music & entertainment', icon: pngIcon(animationPng) },
  { value: 'decoration', fr: 'Décoration & fleurs', en: 'Decor & flowers', icon: pngIcon(decorationPng) },
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
