import { useEffect, useRef, useState } from 'react';
import { Music, Trophy, Utensils, Palette, Users, Monitor, Wrench, Sparkles, Theater, Image } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  className?: string;
}

interface ScrollIndicatorState {
  width: number;
  left: number;
  visible: boolean;
}

const BottomNavigation = ({ className = "" }: BottomNavigationProps) => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<ScrollIndicatorState>({
    width: 100,
    left: 0,
    visible: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateIndicator = () => {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      if (scrollWidth <= clientWidth) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const maxScroll = scrollWidth - clientWidth;
      const widthPercent = (clientWidth / scrollWidth) * 100;
      const leftPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - widthPercent) : 0;

      setIndicator({
        width: widthPercent,
        left: leftPercent,
        visible: true,
      });
    };

    updateIndicator();
    el.addEventListener('scroll', updateIndicator);
    window.addEventListener('resize', updateIndicator);

    return () => {
      el.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, []);

  const navItems = [
    { icon: Music, label: 'Concerts', path: '/concerts' },
    { icon: Trophy, label: 'Sports', path: '/sports' },
    { icon: Utensils, label: 'Restauration', path: '/food' },
    { icon: Palette, label: 'Arts', path: '/arts' },
    { icon: Users, label: 'Meetups', path: '/meetups' },
    { icon: Monitor, label: 'Conférences', path: '/conferences' },
    { icon: Wrench, label: 'Ateliers', path: '/workshops' },
    { icon: Sparkles, label: 'Festivals', path: '/festivals' },
    { icon: Theater, label: 'Spectacles', path: '/shows' },
    { icon: Image, label: 'Expositions', path: '/exhibitions' },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex-shrink-0 px-4 pb-safe z-40 ${className}`}>
      <div className="h-[72px] rounded-xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 shadow-2xl mb-2 border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
        <div className="relative h-full">
          <div
            ref={scrollRef}
            className="flex items-center h-full overflow-x-auto scrollbar-black px-2 gap-1"
          >
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex h-12 min-w-[90px] flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'bg-primary/20 text-primary dark:bg-primary/30'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                  style={{ transitionProperty: 'all' }}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    fill={isActive ? 'currentColor' : 'none'}
                    className="transition-all duration-300 ease-in-out"
                  />
                  <p className="text-xs font-medium leading-none transition-all duration-300 ease-in-out">
                    {item.label}
                  </p>
                </Link>
              );
            })}
          </div>

          {indicator.visible && (
            <div className="pointer-events-none absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-black/5 dark:bg-black/20">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${indicator.width}%`,
                  transform: `translateX(${indicator.left}%)`,
                  backgroundColor: 'hsl(var(--scroll-indicator))',
                  transition: 'transform 0.2s ease-out, width 0.2s ease-out',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
