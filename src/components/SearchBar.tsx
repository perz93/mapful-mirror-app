import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pt-6">
      <div className="relative">
        <div className="flex w-full h-12 rounded-lg shadow-lg">
          <div className="flex items-center justify-center pl-4 rounded-l-lg bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm text-stone-400 dark:text-stone-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search events, artists, or venues"
            className="flex-1 h-full px-4 pl-2 text-base font-normal leading-normal text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm rounded-r-lg border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
