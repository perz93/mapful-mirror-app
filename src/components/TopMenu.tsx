import { useState } from 'react';
import { X, Plus, User, Settings, LogOut, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationInbox } from "@/hooks/useNotificationInbox";
const TopMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const { unreadCount } = useNotificationInbox();
  const isLoggedIn = !!user;
  const userProfileImage = "";
  return <>
      {/* Overlay sombre quand le menu est ouvert */}
      {isOpen && <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-20 animate-fade-in" />}

      <div className="fixed left-0 right-0 top-0 z-30 max-w-md mx-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="p-4 pt-2 flex items-start justify-between">
          {/* Bell icon — left */}
          <button
            onClick={() => navigate(isLoggedIn ? '/notifications' : '/auth')}
            className="relative h-12 w-12 rounded-full bg-white/95 dark:bg-stone-900/90 backdrop-blur-md hover:bg-white transition-all duration-300 active:scale-95 flex items-center justify-center mt-2 shadow-lg"
          >
            <Bell size={20} strokeWidth={1.75} className="text-ink" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-lime text-ink text-[10px] font-medium px-1 ring-2 ring-white tabular">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Menu burger — right */}
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative h-12 w-12 rounded-full bg-white/95 dark:bg-stone-900/90 backdrop-blur-md hover:bg-white transition-all duration-300 active:scale-95 flex items-center justify-center mt-2 shadow-lg">
              <div className={`relative transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isOpen ? <X size={22} strokeWidth={1.75} className="text-ink dark:text-white" /> : <div className="flex flex-col gap-1 items-center">
                    <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                    <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                    <div className="w-5 h-[1.5px] bg-ink dark:bg-white rounded-full"></div>
                  </div>}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in bg-white dark:bg-stone-900 border border-stone-200 shadow-2xl p-3 rounded-3xl min-w-[280px]">
            <div className="flex flex-col gap-3">
              {/* Create Event Button - Black elongated */}
              <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:opacity-90 transition-all focus:bg-transparent focus:outline-none" asChild>
                <Link to={isLoggedIn ? "/create-event" : "/auth"} className="flex items-center justify-center gap-2 bg-lime text-ink h-12 px-6 rounded-full font-medium">
                  <Plus size={18} strokeWidth={2} />
                  <span>Créer un événement</span>
                </Link>
              </DropdownMenuItem>

              {/* Account and Settings - Circular buttons side by side */}
              <div className="flex gap-3 justify-center">
                <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:bg-transparent focus:bg-transparent focus:outline-none transition-all" asChild>
                  <Link to={isLoggedIn ? "/my-account" : "/auth"} className="flex flex-col items-center gap-2 text-center p-3">
                    {isLoggedIn && userProfileImage ? <Avatar className="h-12 w-12">
                        <AvatarImage src={userProfileImage} alt="Profile" />
                        <AvatarFallback className="bg-parchment">
                          <User className="h-5 w-5 text-ink" strokeWidth={1.5} />
                        </AvatarFallback>
                      </Avatar> : <div className="h-12 w-12 rounded-full bg-parchment dark:bg-stone-800 flex items-center justify-center">
                        <User className="h-5 w-5 text-ink" strokeWidth={1.5} />
                      </div>}
                    <p className="font-medium text-stone-600 text-xs">Compte</p>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer rounded-full p-0 hover:bg-transparent focus:bg-transparent focus:outline-none transition-all" asChild>
                  <Link to={isLoggedIn ? "/settings" : "/auth"} className="flex flex-col items-center gap-2 text-center p-3">
                    <div className="h-12 w-12 rounded-full bg-parchment dark:bg-stone-800 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-ink" strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-stone-600 text-xs">Paramètres</p>
                  </Link>
                </DropdownMenuItem>
              </div>

              {/* Logout button - only show if logged in */}
              {isLoggedIn && <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer rounded-full p-0 hover:bg-transparent focus:bg-transparent focus:outline-none transition-all mt-2">
                  <div className="flex items-center justify-center gap-2 h-11 px-6 rounded-full font-medium w-full text-ink border border-stone-200 hover:border-ink transition-colors">
                    <LogOut size={16} strokeWidth={1.75} />
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