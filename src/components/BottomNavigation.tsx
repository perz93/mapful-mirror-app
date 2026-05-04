import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearch } from '@/contexts/SearchContext';

// Import custom icons
import atelierIcon from '@/assets/icons/atelier.png';
import brunchIcon from '@/assets/icons/brunch.png';
import concertIcon from '@/assets/icons/concert.png';
import conferenceIcon from '@/assets/icons/conference.png';
import expositionIcon from '@/assets/icons/exposition.png';
import festivalIcon from '@/assets/icons/festival.png';
import meetupIcon from '@/assets/icons/meetup.png';
import religieuxIcon from '@/assets/icons/religieux.png';
import spectacleIcon from '@/assets/icons/spectacle.png';
import sportIcon from '@/assets/icons/sport.png';

const CATEGORIES = [
  { id: 'workshops', label: 'Ateliers', color: 'bg-yellow-500' },
  { id: 'brunch', label: 'Brunch', color: 'bg-amber-500' },
  { id: 'music', label: 'Concerts', color: 'bg-purple-500' },
  { id: 'conferences', label: 'Conférences', color: 'bg-indigo-500' },
  { id: 'exhibitions', label: 'Expositions', color: 'bg-cyan-500' },
  { id: 'festivals', label: 'Festivals', color: 'bg-red-500' },
  { id: 'meetups', label: 'Meetups', color: 'bg-blue-500' },
  { id: 'religious', label: 'Religieux', color: 'bg-violet-500' },
  { id: 'shows', label: 'Spectacles', color: 'bg-teal-500' },
  { id: 'sports', label: 'Sports', color: 'bg-green-500' },
];

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
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory, distanceFilter, setDistanceFilter } = useSearch();
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
    { icon: atelierIcon, label: 'Ateliers', path: '/workshops' },
    { icon: brunchIcon, label: 'Brunch', path: '/brunch' },
    { icon: concertIcon, label: 'Concerts', path: '/concerts' },
    { icon: conferenceIcon, label: 'Conférences', path: '/conferences' },
    { icon: expositionIcon, label: 'Expositions', path: '/exhibitions' },
    { icon: festivalIcon, label: 'Festivals', path: '/festivals' },
    { icon: meetupIcon, label: 'Meetups', path: '/meetups' },
    { icon: religieuxIcon, label: 'Religieux', path: '/religious' },
    { icon: spectacleIcon, label: 'Spectacles', path: '/shows' },
    { icon: sportIcon, label: 'Sports', path: '/sports' },
  ];

  const handleSearch = () => {
    setSearchOpen(false);
  };

  return (
    <>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto top-[15%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] w-[90vw] sm:w-full p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Rechercher un événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pb-2">
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
            
            {/* Category Filters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Catégories</p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Tout effacer
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategories.includes(category.id)
                        ? `${category.color} text-white shadow-lg scale-105`
                        : 'bg-muted text-muted-foreground hover:scale-105'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Autour de moi</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Tout', value: null },
                  { label: '500m', value: 0.5 },
                  { label: '1 km', value: 1 },
                  { label: '2 km', value: 2 },
                  { label: '5 km', value: 5 },
                  { label: '10 km', value: 10 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setDistanceFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      distanceFilter === opt.value
                        ? 'bg-[#ee9d2b] text-white shadow-lg scale-105'
                        : 'bg-muted text-muted-foreground hover:scale-105'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full h-11 rounded-3xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm"
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
                className="flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-hide px-2 gap-1 whitespace-nowrap"
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
                      <img
                        src={item.icon}
                        alt={item.label}
                        className={`w-6 h-6 transition-all duration-300 ease-in-out ${
                          isActive ? 'opacity-100' : 'opacity-60'
                        }`}
                      />
                      <p className="text-xs font-medium italic leading-none transition-all duration-300 ease-in-out" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
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
