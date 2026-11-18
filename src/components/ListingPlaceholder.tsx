import { getMarketplaceCategory } from '@/lib/marketplaceCategories';

const TILT = [-12, 10, -4, 14, -8, 6, 12, -14, 4];

/**
 * Image par défaut d'une annonce sans photo : fond gris doux, icône de la
 * catégorie en motif léger, et la même icône dans un rond blanc au centre.
 * Dessinée en CSS : rien à stocker, s'adapte à toutes les tailles.
 */
const ListingPlaceholder = ({ category, className = '', small = false }: { category: string | null | undefined; className?: string; small?: boolean }) => {
  const { src } = getMarketplaceCategory(category);
  const n = small ? 3 : 4;
  return (
    <div aria-hidden className={`relative flex items-center justify-center overflow-hidden bg-[#e9e9ec] ${className}`}>
      <div
        className="absolute inset-[-6%] grid place-items-center opacity-20"
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}
      >
        {Array.from({ length: n * n }, (_, i) => (
          <img key={i} src={src} alt="" className="w-[44%] object-contain" style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }} />
        ))}
      </div>
      <span className="relative flex aspect-square w-[40%] items-center justify-center rounded-full bg-white shadow-[0_6px_18px_-8px_rgba(0,0,0,0.2)]">
        <img src={src} alt="" className="w-[52%] object-contain" />
      </span>
    </div>
  );
};

export default ListingPlaceholder;
