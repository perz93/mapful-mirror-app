import { useState } from 'react';
import { Navigation, X, Loader2, Search } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { toast } from 'sonner';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const RouteSearchPanel = ({ onClose }: { onClose: () => void }) => {
  const { setRouteDestination } = useSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ci&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      if (data.length === 0) toast.info('Aucun résultat trouvé');
    } catch {
      toast.error('Erreur de recherche');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r: NominatimResult) => {
    const label = r.display_name.split(',').slice(0, 2).join(',');
    setRouteDestination({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label,
    });
    onClose();
  };

  return (
    <div className="fixed inset-x-0 top-0 z-40 max-w-md mx-auto p-4 pt-6 animate-fade-in">
      <div className="rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-3">
        <div className="flex items-center gap-2">
          <Navigation size={18} className="text-primary flex-shrink-0 ml-1" />
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Où aller ?"
              className="flex-1 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center active:scale-95 transition-all"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-800 dark:text-stone-200"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteSearchPanel;
