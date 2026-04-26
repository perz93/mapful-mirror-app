import { Search, Plus, Calendar, User, Settings, Filter, MapPin, Navigation, Loader2, X, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from '@/contexts/SearchContext';
import { useEvents } from '@/hooks/useEvents';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 8;

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

interface AddressResult {
  lat: string;
  lon: string;
  display_name: string;
}

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory, setRouteDestination } = useSearch();
  const { data: events } = useEvents();
  const [showFilters, setShowFilters] = useState(false);
  const [focused, setFocused] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);

  // Filtered events (max 5)
  const matchingEvents = (events || []).filter(e => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q);
  }).slice(0, 5);

  // Debounced address search via Nominatim
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setAddressResults([]);
      return;
    }
    setSearchingAddress(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=4&countrycodes=ci&q=${encodeURIComponent(searchQuery + ' Abidjan')}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
        const data: AddressResult[] = await res.json();
        setAddressResults(data);
      } catch {
        setAddressResults([]);
      } finally {
        setSearchingAddress(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const selectAddress = (r: AddressResult) => {
    const label = r.display_name.split(',').slice(0, 2).join(',');
    setRouteDestination({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label,
    });
    setSearchQuery('');
    setFocused(false);
    inputRef.current?.blur();
  };

  const selectEvent = (eventId: string) => {
    // Center map on the event by saving its position then triggering search filter
    const ev = events?.find(e => e.id === eventId);
    if (ev) {
      sessionStorage.setItem('mapPosition', JSON.stringify({ lat: ev.latitude, lng: ev.longitude, zoom: 16 }));
      setSearchQuery(ev.title);
    }
    setFocused(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAddressResults([]);
    inputRef.current?.focus();
  };

  const showSuggestions = focused && searchQuery.trim().length > 0;

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
              placeholder="Rechercher événement ou adresse..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                setFocused(true);
                const el = e.target as HTMLInputElement;
                const length = el.value.length;
                requestAnimationFrame(() => {
                  try { el.setSelectionRange(length, length); } catch { /* */ }
                });
              }}
              onBlur={() => {
                // Delay so click on suggestion can register
                setTimeout(() => setFocused(false), 200);
              }}
              className="h-11 w-full rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 pl-10 pr-10 text-sm shadow-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:shadow-2xl border border-white/50 dark:border-stone-800/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-stone-900 dark:text-white caret-stone-900 dark:caret-white"
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'text',
                userSelect: 'text',
                touchAction: 'manipulation'
              }}
            />
            {searchQuery && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                className="absolute top-1/2 -translate-y-1/2 right-2 h-7 w-7 rounded-full bg-stone-200/90 dark:bg-stone-700/90 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 flex items-center justify-center shadow-sm transition-all active:scale-90 animate-fade-in"
                aria-label="Effacer la recherche"
                title="Effacer"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

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

        {/* Unified suggestions panel (events + addresses) */}
        {showSuggestions && (matchingEvents.length > 0 || addressResults.length > 0 || searchingAddress) && (
          <div className="px-4 -mt-2 animate-fade-in">
            <div className="rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {matchingEvents.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">Événements</p>
                  {matchingEvents.map(ev => (
                    <button
                      key={ev.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectEvent(ev.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{ev.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{ev.venue}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(addressResults.length > 0 || searchingAddress) && (
                <div className="p-2 border-t border-stone-100 dark:border-stone-800">
                  <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <Navigation size={11} /> Itinéraire vers une adresse
                    {searchingAddress && <Loader2 size={11} className="animate-spin" />}
                  </p>
                  {addressResults.map((r, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectAddress(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                          {r.display_name.split(',').slice(0, 2).join(',')}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{r.display_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
    </div>
  );
};

export default SearchBar;
