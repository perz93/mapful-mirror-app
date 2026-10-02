import type { ComponentType } from 'react';
import lieuxPng from '@/assets/icons/market/lieux.png';
import traiteursPng from '@/assets/icons/market/traiteurs.png';
import animationPng from '@/assets/icons/market/animation.png';
import decorationPng from '@/assets/icons/market/decoration.png';
import materielPng from '@/assets/icons/market/materiel.png';
import photoPng from '@/assets/icons/market/photo.png';
import beautePng from '@/assets/icons/market/beaute.png';
import autrePng from '@/assets/icons/market/autre.png';

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
  { value: 'materiel', fr: 'Matériel & location', en: 'Equipment rental', icon: pngIcon(materielPng) },
  { value: 'photo_video', fr: 'Photo & vidéo', en: 'Photo & video', icon: pngIcon(photoPng) },
  { value: 'beaute_tenues', fr: 'Beauté & tenues', en: 'Beauty & outfits', icon: pngIcon(beautePng) },
  { value: 'autre', fr: 'Autre', en: 'Other', icon: pngIcon(autrePng) },
];

export const getMarketplaceCategory = (value: string | null | undefined) =>
  MARKETPLACE_CATEGORIES.find((c) => c.value === value) ?? MARKETPLACE_CATEGORIES[MARKETPLACE_CATEGORIES.length - 1];

export const marketplaceCategoryLabel = (value: string | null | undefined, lang: string = 'fr') => {
  const c = getMarketplaceCategory(value);
  return lang === 'en' ? c.en : c.fr;
};
