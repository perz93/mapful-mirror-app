import { createContext, useContext, useState, ReactNode } from 'react';

export interface RouteDestination {
  lat: number;
  lng: number;
  label: string;
}

export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type PriceFilter = 'all' | 'free' | 'paid';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  routeDestination: RouteDestination | null;
  setRouteDestination: (dest: RouteDestination | null) => void;
  distanceFilter: number | null;
  setDistanceFilter: (km: number | null) => void;
  dateFilter: DateFilter;
  setDateFilter: (f: DateFilter) => void;
  priceFilter: PriceFilter;
  setPriceFilter: (f: PriceFilter) => void;
  /** Nombre de filtres actifs (texte, catégories, distance, date, prix) */
  activeFilterCount: number;
  /** Tout réinitialiser en un geste */
  clearFilters: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [routeDestination, setRouteDestination] = useState<RouteDestination | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedCategories.length +
    (distanceFilter !== null ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDistanceFilter(null);
    setDateFilter('all');
    setPriceFilter('all');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery,
      selectedCategories,
      setSelectedCategories,
      toggleCategory,
      routeDestination,
      setRouteDestination,
      distanceFilter,
      setDistanceFilter,
      dateFilter,
      setDateFilter,
      priceFilter,
      setPriceFilter,
      activeFilterCount,
      clearFilters,
      searchOpen,
      setSearchOpen,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
