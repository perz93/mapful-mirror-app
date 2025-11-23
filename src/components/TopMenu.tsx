import { Plus, Calendar, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/afrimap-logo.png";

const TopMenu = () => {
  return (
    <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto">
      <div className="p-4 pt-6 flex items-center justify-between">
        <img 
          src={logo} 
          alt="AFRIMAP EVENTS" 
          className="h-28 w-auto object-contain"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-11 w-11 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl text-stone-900 dark:text-white shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center border border-white/50 dark:border-stone-800/50">
              <Plus size={20} strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-72 animate-fade-in backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-2 rounded-3xl"
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
    </div>
  );
};

export default TopMenu;
