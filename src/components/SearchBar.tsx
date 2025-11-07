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
      <div className="p-4 pt-6 flex items-center gap-2 backdrop-blur-xl bg-background/30">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search events, artists, or venues"
            className="h-10 w-full rounded-full backdrop-blur-xl bg-white/80 dark:bg-stone-800/80 pl-11 pr-4 text-sm shadow-lg transition-all placeholder:text-stone-400 focus:bg-white/90 dark:focus:bg-stone-700/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center">
              <Plus size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 animate-fade-in backdrop-blur-xl bg-background/80 border border-border/50 shadow-2xl p-2"
          >
            <DropdownMenuItem className="cursor-pointer rounded-lg p-3 hover:bg-primary/10 transition-all" asChild>
              <a href="/create-event" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Créer un événement</p>
                  <p className="text-xs text-muted-foreground">Organiser un nouvel événement</p>
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg p-3 hover:bg-primary/10 transition-all" asChild>
              <a href="/my-account" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Mon compte</p>
                  <p className="text-xs text-muted-foreground">Gérer votre profil</p>
                </div>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg p-3 hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Paramètres</p>
                  <p className="text-xs text-muted-foreground">Préférences et confidentialité</p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SearchBar;
