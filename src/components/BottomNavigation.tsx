import { Music, Trophy, Utensils, Palette } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { icon: Music, label: 'Concerts', active: true },
    { icon: Trophy, label: 'Sports', active: false },
    { icon: Utensils, label: 'Food', active: false },
    { icon: Palette, label: 'Arts', active: false },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 flex-shrink-0 px-4 pb-4">
      <div className="flex h-[72px] items-center justify-around rounded-xl bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm shadow-lg">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex h-12 w-24 flex-col items-center justify-center gap-1 rounded-lg transition-transform active:scale-95 ${
              item.active
                ? 'bg-primary/20 text-primary dark:bg-primary/30'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} fill={item.active ? 'currentColor' : 'none'} />
            <p className="text-xs font-medium leading-none">{item.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
