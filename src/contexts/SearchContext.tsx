import { createContext, useContext, useState, ReactNode } from 'react';

export interface RouteDestination {
  lat: number;
  lng: number;
  label: string;
}

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
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [routeDestination, setRouteDestination] = useState<RouteDestination | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);

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
