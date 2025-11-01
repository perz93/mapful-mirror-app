import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 search-bar-gradient">
      <div className="p-4 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search events, artists, or venues"
            className="h-12 w-full rounded-full bg-white/90 dark:bg-background-dark/90 pl-12 pr-4 text-sm shadow-lg backdrop-blur-md transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
