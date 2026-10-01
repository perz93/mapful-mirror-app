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
import { useLanguage } from '@/contexts/LanguageContext';

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

const CATEGORIES_META = [
  { id: 'workshops', tKey: 'cat.workshops', color: 'bg-ink' },
  { id: 'brunch', tKey: 'cat.brunch', color: 'bg-ink' },
  { id: 'music', tKey: 'cat.music', color: 'bg-ink' },
  { id: 'conferences', tKey: 'cat.conferences', color: 'bg-ink' },
  { id: 'exhibitions', tKey: 'cat.exhibitions', color: 'bg-ink' },
  { id: 'festivals', tKey: 'cat.festivals', color: 'bg-ink' },
  { id: 'meetups', tKey: 'cat.meetups', color: 'bg-ink' },
  { id: 'religious', tKey: 'cat.religious', color: 'bg-ink' },
  { id: 'shows', tKey: 'cat.shows', color: 'bg-ink' },
  { id: 'sports', tKey: 'cat.sports', color: 'bg-ink' },
];

interface BottomNavigationProps {
  className?: string;
}

interface ScrollIndicatorState {
  thumbWidth: number;  // % of track
  thumbLeft: number;   // % position
  canScroll: boolean;
}

const BottomNavigation = ({ className = "" }: BottomNavigationProps) => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory, distanceFilter, setDistanceFilter } = useSearch();
  const { t } = useLanguage();
  const [indicator, setIndicator] = useState<ScrollIndicatorState>({
    thumbWidth: 0,
    thumbLeft: 0,
    canScroll: false,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 1) {
        setIndicator({ thumbWidth: 100, thumbLeft: 0, canScroll: false });
        return;
      }
      // Thumb width = visible portion as % of total
      const thumbW = (clientWidth / scrollWidth) * 100;
      // Thumb position = scroll progress mapped to remaining track space
      const thumbL = (scrollLeft / maxScroll) * (100 - thumbW);
      setIndicator({ thumbWidth: thumbW, thumbLeft: thumbL, canScroll: true });
    };

    const timer = setTimeout(update, 150);
    el.addEventListener('scroll', update, { passive: true } as AddEventListenerOptions);
    window.addEventListener('resize', update);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const navItems = [
    { icon: atelierIcon, label: t('cat.workshops'), path: '/workshops' },
    { icon: brunchIcon, label: t('cat.brunch'), path: '/brunch' },
    { icon: concertIcon, label: t('cat.music'), path: '/concerts' },
    { icon: conferenceIcon, label: t('cat.conferences'), path: '/conferences' },
    { icon: expositionIcon, label: t('cat.exhibitions'), path: '/exhibitions' },
    { icon: festivalIcon, label: t('cat.festivals'), path: '/festivals' },
    { icon: meetupIcon, label: t('cat.meetups'), path: '/meetups' },
    { icon: religieuxIcon, label: t('cat.religious'), path: '/religious' },
    { icon: spectacleIcon, label: t('cat.shows'), path: '/shows' },
    { icon: sportIcon, label: t('cat.sports'), path: '/sports' },
  ];

  const handleSearch = () => {
    setSearchOpen(false);
  };

  return (
    <>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto top-[12%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] w-[90vw] sm:w-full p-0 rounded-3xl border-0 bg-transparent shadow-none [&>button]:hidden">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="text-[28px] leading-none font-medium tracking-tighter text-ink">
                {t('nav.search')}
              </h2>
              <button
                onClick={() => setSearchOpen(false)}
                className="h-9 w-9 rounded-full bg-parchment flex items-center justify-center hover:bg-stone-200 transition-all active:scale-95"
              >
                <span className="text-ink text-sm">✕</span>
              </button>
            </div>

            {/* Search input */}
            <div className="px-5 pb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                <input
                  type="text"
                  placeholder={t('nav.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  className="w-full h-12 pl-10 pr-4 rounded-full bg-parchment border border-transparent text-ink placeholder:text-stone-400 focus:outline-none focus:bg-white text-[15px]"
                  autoFocus
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-200 mx-5" />

            {/* Categories */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-stone-500">{t('nav.categories')}</p>
                {selectedCategories.length > 0 && (
                  <button onClick={() => setSelectedCategories([])} className="text-xs text-ink font-medium link-underline">
                    {t('nav.clearBtn')}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES_META.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all active:scale-95 ${
                      selectedCategories.includes(category.id)
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-ink'
                    }`}
                  >
                    {t(category.tKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-200 mx-5" />

            {/* Distance */}
            <div className="px-5 py-4 space-y-3">
              <p className="eyebrow text-stone-500">{t('nav.nearMe')}</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: t('nav.allDistance'), value: null },
                  { label: '500m', value: 0.5 },
                  { label: '1 km', value: 1 },
                  { label: '2 km', value: 2 },
                  { label: '5 km', value: 5 },
                  { label: '10 km', value: 10 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setDistanceFilter(opt.value)}
                    className={`h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all active:scale-95 ${
                      distanceFilter === opt.value
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={handleSearch}
                className="w-full h-12 rounded-full btn-lime text-[15px]"
              >
                {t('nav.search')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex-shrink-0 px-4 pb-safe z-40 ${className}`}>
        <div className="neo-white-bottom h-[72px] rounded-full bg-white dark:bg-stone-900/90 mb-2 overflow-hidden">
          <div className="relative h-full flex items-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-shrink-0 h-14 w-14 ml-2 flex items-center justify-center rounded-full bg-lime text-ink hover:bg-lime-deep transition-all duration-300 active:scale-95"
              aria-label={t('nav.search')}
            >
              <Search size={22} strokeWidth={1.75} />
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
                      className={`flex-shrink-0 flex h-14 min-w-[84px] flex-col items-center justify-center gap-1 rounded-full transition-all duration-300 ease-in-out active:scale-95 ${
                        isActive
                          ? 'bg-parchment text-ink dark:bg-stone-800'
                          : 'text-stone-500 dark:text-stone-400'
                      }`}
                      style={{ transitionProperty: 'all' }}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className={`w-6 h-6 transition-all duration-300 ease-in-out ${
                          isActive ? 'opacity-100' : 'opacity-55'
                        }`}
                      />
                      <p className="text-[11px] font-medium leading-none tracking-[0.01em] transition-all duration-300 ease-in-out">
                        {item.label}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {indicator.canScroll && (
                <div className="pointer-events-none absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full bg-ink/[0.06]">
                  <div
                    className="absolute top-0 h-full rounded-full bg-ink/40"
                    style={{
                      width: `${indicator.thumbWidth}%`,
                      left: `${indicator.thumbLeft}%`,
                      transition: 'left 0.12s ease-out',
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
