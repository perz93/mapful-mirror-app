import { useState } from 'react';
import { X, Calendar, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/afrimap-logo.png";

const TopMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto">
      <div className="p-4 pt-4 flex items-start justify-between">
        <img 
          src={logo} 
          alt="AFRIMAP EVENTS" 
          className="h-28 w-auto object-contain"
        />
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="h-12 w-12 rounded-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-stone-900/90 transition-all active:scale-95 flex items-center justify-center mt-2 shadow-lg">
              {isOpen ? (
                <X size={24} strokeWidth={2.5} className="text-black dark:text-white" />
              ) : (
                <div className="flex flex-col gap-1 items-center">
                  <div className="w-5 h-0.5 bg-black dark:bg-white rounded-full"></div>
                  <div className="w-7 h-0.5 bg-black dark:bg-white rounded-full"></div>
                  <div className="w-4 h-0.5 bg-black dark:bg-white rounded-full"></div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="animate-fade-in backdrop-blur-2xl bg-white/95 dark:bg-stone-900/95 border border-white/60 dark:border-stone-800/60 shadow-2xl p-3 rounded-3xl"
          >
            <div className="flex gap-2">
              <DropdownMenuItem className="cursor-pointer rounded-2xl p-3 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all flex-1" asChild>
                <a href="/create-event" className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-white text-xs">Créer</p>
                  </div>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-2xl p-3 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all flex-1" asChild>
                <a href="/my-account" className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-white text-xs">Compte</p>
                  </div>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-2xl p-3 hover:bg-stone-100/50 dark:hover:bg-stone-800/30 transition-all flex-1">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-white text-xs">Paramètres</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopMenu;
