import { useState } from 'react';
import { X, Plus, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
const TopMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const isLoggedIn = !!user;
  const userProfileImage = "";
  return <>
      {/* Overlay sombre quand le menu est ouvert */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-20 animate-fade-in" />}
      
      <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto">
        <div className="p-4 pt-4 flex items-start justify-end">
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative h-12 w-12 rounded-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-md hover:bg-white/90 dark:hover:bg-stone-900/90 transition-all duration-300 active:scale-95 hover:scale-105 flex items-center justify-center mt-2 shadow-lg">
              <div className={`relative transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isOpen ? <X size={22} strokeWidth={2.5} className="text-black dark:text-white" /> : <div className="flex flex-col gap-1 items-center">
                    <div className="w-5 h-0.5 bg-black dark:bg-white rounded-full"></div>
                    <div className="w-7 h-0.5 bg-black dark:bg-white rounded-full"></div>
                    <div className="w-4 h-0.5 bg-black dark:bg-white rounded-full"></div>
                  </div>}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/20 shadow-2xl p-4 rounded-3xl min-w-[280px]">
            <div className="flex flex-col gap-3">
              {/* Create Event Button - Black elongated */}
              <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:opacity-90 transition-all" asChild>
                <Link to={isLoggedIn ? "/create-event" : "/auth"} className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-full font-semibold">
                  <Plus size={20} strokeWidth={2.5} />
                  <span>Créer un événement</span>
                </Link>
              </DropdownMenuItem>

              {/* Account and Settings - Circular buttons side by side */}
              <div className="flex gap-3 justify-center">
                <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all" asChild>
                  <Link to={isLoggedIn ? "/my-account" : "/auth"} className="flex flex-col items-center gap-2 text-center p-3">
                    {isLoggedIn && userProfileImage ? <Avatar className="h-12 w-12">
                        <AvatarImage src={userProfileImage} alt="Profile" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5">
                          <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </AvatarFallback>
                      </Avatar> : <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center bg-secondary-foreground">
                        <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>}
                    <p className="font-medium text-foreground text-xs">Compte</p>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all" asChild>
                  <Link to={isLoggedIn ? "/settings" : "/auth"} className="flex flex-col items-center gap-2 text-center p-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center bg-secondary-foreground">
                      <Settings className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-foreground text-xs">Paramètres</p>
                  </Link>
                </DropdownMenuItem>
              </div>

              {/* Logout button - only show if logged in */}
              {isLoggedIn && <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer rounded-full p-0 hover:bg-red-950/20 transition-all mt-2">
                  <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-full font-medium w-full text-white bg-amber-600">
                    <LogOut size={18} strokeWidth={2} />
                    <span className="bg-transparent">Déconnexion</span>
                  </div>
                </DropdownMenuItem>}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </>;
};
export default TopMenu;