import { Music, Trophy, Utensils, Palette } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Music, label: 'Concerts', path: '/concerts' },
    { icon: Trophy, label: 'Sports', path: '/sports' },
    { icon: Utensils, label: 'Food', path: '/food' },
    { icon: Palette, label: 'Arts', path: '/arts' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-4 pb-safe z-20">
      <div className="flex h-[72px] items-center justify-around rounded-xl bg-white dark:bg-stone-900 backdrop-blur-md shadow-2xl mb-4 border border-stone-200 dark:border-stone-700">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex h-12 w-24 flex-col items-center justify-center gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-primary/20 text-primary dark:bg-primary/30'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
              <p className="text-xs font-medium leading-none">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
