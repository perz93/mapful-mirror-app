import { Music, Trophy, Utensils, Palette, Users, Monitor, Wrench, Sparkles, Theater, Image } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation = ({ className = "" }: BottomNavigationProps) => {
  const location = useLocation();
  const navItems = [{
    icon: Music,
    label: 'Concerts',
    path: '/concerts'
  }, {
    icon: Trophy,
    label: 'Sports',
    path: '/sports'
  }, {
    icon: Utensils,
    label: 'Restauration',
    path: '/food'
  }, {
    icon: Palette,
    label: 'Arts',
    path: '/arts'
  }, {
    icon: Users,
    label: 'Meetups',
    path: '/meetups'
  }, {
    icon: Monitor,
    label: 'Conférences',
    path: '/conferences'
  }, {
    icon: Wrench,
    label: 'Ateliers',
    path: '/workshops'
  }, {
    icon: Sparkles,
    label: 'Festivals',
    path: '/festivals'
  }, {
    icon: Theater,
    label: 'Spectacles',
    path: '/shows'
  }, {
    icon: Image,
    label: 'Expositions',
    path: '/exhibitions'
  }];
  return <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex-shrink-0 px-4 pb-safe z-40 ${className}`}>
      <div className="h-[72px] rounded-xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 shadow-2xl mb-2 border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
        <div className="flex items-center h-full overflow-x-auto scrollbar-hide px-2 gap-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return <Link key={index} to={item.path} className={`flex h-12 min-w-[90px] flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${isActive ? 'bg-primary/20 text-primary dark:bg-primary/30' : 'text-stone-500 dark:text-stone-400'}`} style={{ transitionProperty: 'all' }}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? 'currentColor' : 'none'} className="transition-all duration-300 ease-in-out" />
                <p className="text-xs font-medium leading-none transition-all duration-300 ease-in-out">{item.label}</p>
              </Link>;
          })}
        </div>
      </div>
    </div>;
};
export default BottomNavigation;