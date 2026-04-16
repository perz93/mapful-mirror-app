import { Search, Plus, Calendar, User, Settings, Filter, Navigation } from 'lucide-react';
import { useRef, useState } from "react";
import RouteSearchPanel from './RouteSearchPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from '@/contexts/SearchContext';

const CATEGORIES = [
  { id: 'music', label: 'Musique', color: 'bg-purple-500' },
  { id: 'sports', label: 'Sports', color: 'bg-green-500' },
  { id: 'food', label: 'Food', color: 'bg-orange-500' },
  { id: 'arts', label: 'Arts', color: 'bg-pink-500' },
  { id: 'meetups', label: 'Meetups', color: 'bg-blue-500' },
  { id: 'conferences', label: 'Conférences', color: 'bg-indigo-500' },
  { id: 'workshops', label: 'Ateliers', color: 'bg-yellow-500' },
  { id: 'festivals', label: 'Festivals', color: 'bg-red-500' },
  { id: 'shows', label: 'Spectacles', color: 'bg-teal-500' },
  { id: 'exhibitions', label: 'Expositions', color: 'bg-cyan-500' },
];

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

  return (
    <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto">
      <div className="flex flex-col">
        <div className="p-4 pt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400 dark:text-stone-500">
            <Search size={18} strokeWidth={1.5} />
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            placeholder="Rechercher un événement..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => {
              const el = e.target as HTMLInputElement;
              const length = el.value.length;
              requestAnimationFrame(() => {
                try {
                  el.setSelectionRange(length, length);
                } catch {
                  // ignore selection errors on some mobile browsers
                }
              });
            }}
            className="h-11 w-full rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 pl-10 pr-4 text-sm shadow-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:shadow-2xl border border-white/50 dark:border-stone-800/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-stone-900 dark:text-white caret-stone-900 dark:caret-white"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'text',
              userSelect: 'text',
              touchAction: 'manipulation'
            }}
          />
        </div>
        
        <button
          onClick={() => setShowRoute(true)}
          aria-label="Itinéraire"
          className="h-11 w-11 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl text-primary shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center border border-white/50 dark:border-stone-800/50"
        >
          <Navigation size={20} strokeWidth={1.5} />
        </button>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 w-11 rounded-2xl backdrop-blur-2xl shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center border relative ${
            selectedCategories.length > 0 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white border-white/50 dark:border-stone-800/50'
          }`}
        >
          <Filter size={20} strokeWidth={1.5} />
          {selectedCategories.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {selectedCategories.length}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-11 w-11 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl text-stone-900 dark:text-white shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center border border-white/50 dark:border-stone-800/50">
              <Plus size={20} strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-72 animate-fade-in backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-2 rounded-3xl z-50"
          >
            <DropdownMenuItem className="cursor-pointer rounded-2xl p-3.5 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all mb-1" asChild>
              <a href="/create-event" className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 dark:text-white text-sm">Créer un événement</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Organiser un nouvel événement</p>
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-2xl p-3.5 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all mb-1" asChild>
              <a href="/my-account" className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 dark:text-white text-sm">Mon compte</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Gérer votre profil</p>
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-2xl p-3.5 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 dark:text-white text-sm">Paramètres</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light">Préférences et confidentialité</p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Category Filters Dropdown */}
      {showFilters && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-stone-900 dark:text-white">Filtrer par catégorie</p>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Tout effacer
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategories.includes(category.id)
                      ? `${category.color} text-white shadow-lg scale-105`
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:scale-105'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
      {showRoute && <RouteSearchPanel onClose={() => setShowRoute(false)} />}
    </div>
  );
};

export default SearchBar;
