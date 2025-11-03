import { Search, Plus, Calendar, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SearchBar = () => {
  return (
    <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto">
      <div className="p-4 pt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search events, artists, or venues"
            className="h-10 w-full rounded-full bg-white dark:bg-stone-800 pl-11 pr-4 text-sm shadow-lg transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center">
              <Plus size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 animate-fade-in">
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="/create-event" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Créer un événement</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a href="/my-account" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Mon compte</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SearchBar;
