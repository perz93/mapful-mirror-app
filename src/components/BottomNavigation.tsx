import { useEffect, useRef, useState } from 'react';
import { Music, Trophy, Utensils, Palette, Users, Monitor, Wrench, Sparkles, Theater, Image, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

      const maxScroll = Math.max(scrollWidth - clientWidth, 0);
      const widthPercent = scrollWidth > 0 ? Math.min((clientWidth / scrollWidth) * 100, 100) : 100;
      const leftPercent = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - widthPercent) : 0;

      setIndicator({
        width: widthPercent,
        left: leftPercent,
        visible: true,
      });
    };

    const timer = setTimeout(updateIndicator, 150);

    el.addEventListener('scroll', updateIndicator, { passive: true } as AddEventListenerOptions);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timer);
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Recherche:', searchQuery);
      // TODO: Implémenter la logique de recherche
      setSearchOpen(false);
    }
  };

  return (
    <>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto top-[15%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] w-[90vw] sm:w-full p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Rechercher un événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Nom de l'événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full h-11 pl-10 pr-4 rounded-3xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="w-full h-11 rounded-3xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              Rechercher
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex-shrink-0 px-4 pb-safe z-40 ${className}`}>
        <div className="h-[72px] rounded-xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 shadow-2xl mb-2 border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
          <div className="relative h-full flex items-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-shrink-0 h-14 w-14 ml-2 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Rechercher"
            >
              <Search size={24} strokeWidth={2} />
            </button>

            <div className="flex-1 relative h-full min-w-0">
              <div
                ref={scrollRef}
                className="flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-black px-2 gap-1 whitespace-nowrap"
              >
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`flex-shrink-0 flex h-12 min-w-[90px] flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
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
                <div className="pointer-events-none absolute bottom-1 left-10 right-10 h-0.5 rounded-full bg-black/5 dark:bg-black/20">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: `${indicator.width}%`,
                      transform: `translateX(${indicator.left}%)`,
                      transition: 'transform 0.2s ease-out, width 0.2s ease-out',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
