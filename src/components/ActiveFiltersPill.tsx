import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Pastille affichée sur la carte tant qu'une recherche / un filtre est actif :
 * un tap la rouvre, la croix remet tout à zéro (plus besoin d'effacer à la main).
 */
const ActiveFiltersPill = () => {
  const { searchQuery, activeFilterCount, clearFilters, setSearchOpen } = useSearch();
  const { t } = useLanguage();

  if (activeFilterCount === 0) return null;

  const query = searchQuery.trim();
  const others = activeFilterCount - (query ? 1 : 0);
  const label = query
    ? `« ${query} »`
    : `${activeFilterCount} ${activeFilterCount > 1 ? t('nav.filters') : t('nav.filter')}`;

  return (
    <div className="mt-2 flex h-12 w-full min-w-[168px] max-w-[240px] items-center gap-3 rounded-full bg-ink pl-1.5 pr-1.5 text-parchment shadow-lg animate-scale-in">
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full pl-2.5 pr-1 text-left active:scale-[0.98] transition-transform"
      >
        <Search size={15} strokeWidth={2} className="flex-shrink-0 text-lime" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
        {query && others > 0 && (
          <span className="flex-shrink-0 rounded-full bg-lime px-1.5 text-[11px] font-semibold leading-[18px] text-ink tabular">+{others}</span>
        )}
      </button>
      <button
        type="button"
        onClick={clearFilters}
        aria-label={t('nav.showAll')}
        className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-parchment hover:bg-white/25 active:scale-95 transition"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ActiveFiltersPill;
