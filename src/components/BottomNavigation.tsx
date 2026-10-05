import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearch } from '@/contexts/SearchContext';
import { useLanguage } from '@/contexts/LanguageContext';

import { EVENT_CATEGORIES } from '@/lib/eventCategories';


interface BottomNavigationProps {
  className?: string;
}


const BottomNavigation = ({ className = "" }: BottomNavigationProps) => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory,
    distanceFilter, setDistanceFilter, activeFilterCount, clearFilters, searchOpen, setSearchOpen,
  } = useSearch();
  const { t } = useLanguage();
  const [canScroll, setCanScroll] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);

  // Indicateur qui suit le doigt en temps réel : mis à jour directement (sans
  // re-rendu React ni transition), à chaque image pendant le défilement.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const { scrollWidth, clientWidth, scrollLeft } = el;
      const maxScroll = scrollWidth - clientWidth;
      const scrollable = maxScroll > 1;
      setCanScroll(scrollable);
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (!scrollable || !track || !thumb) return;
      const trackW = track.clientWidth;
      const thumbW = Math.max(24, (clientWidth / scrollWidth) * trackW);
      // Bornes : l'effet rebond d'iOS donne un scrollLeft < 0 ou > max
      const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
      thumb.style.width = `${thumbW}px`;
      thumb.style.transform = `translate3d(${progress * (trackW - thumbW)}px,0,0)`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    el.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [canScroll]);

  const navItems = EVENT_CATEGORIES.map((c) => ({ icon: c.icon, label: t(c.tKey).replace(/-/g, '\u2011'), path: c.path }));

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
                  onFocus={(e) => e.currentTarget.select()}
                  enterKeyHint="search"
                  className="w-full h-12 pl-10 pr-12 rounded-full bg-parchment border border-transparent text-ink placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-300 text-[15px]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={t('nav.clearBtn')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-stone-200 text-ink active:scale-95 transition-transform"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
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
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all active:scale-95 ${
                    selectedCategories.length === 0
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-ink'
                  }`}
                >
                  {t('nav.allDistance')}
                </button>
                {EVENT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={`h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all active:scale-95 ${
                      selectedCategories.includes(category.value)
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
            <div className="flex gap-2 px-5 pb-5 pt-1">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="h-12 px-5 rounded-full bg-parchment text-ink text-[15px] font-medium hover:bg-stone-200 transition-colors active:scale-[0.98]"
                >
                  {t('nav.reset')}
                </button>
              )}
              <button
                onClick={handleSearch}
                className="flex-1 h-12 rounded-full btn-lime text-[15px]"
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
                      className={`flex-shrink-0 flex h-14 w-[92px] flex-col items-center justify-center gap-[3px] rounded-[22px] transition-all duration-300 ease-in-out active:scale-95 ${
                        isActive
                          ? 'bg-[#eaf7cf] text-ink dark:bg-stone-800'
                          : 'text-ink dark:text-stone-300'
                      }`}
                      style={{ transitionProperty: 'all' }}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className={`size-[22px] flex-shrink-0 transition-all duration-300 ease-in-out ${
                          isActive ? 'opacity-100' : 'opacity-55'
                        }`}
                      />
                      {/* Zone texte toujours haute de 2 lignes : les icônes restent alignées,
                          un nom court est centré dans la zone */}
                      <p className={`flex h-6 max-w-[84px] items-center text-center text-[10.5px] leading-[1.15] whitespace-normal transition-all duration-300 ease-in-out ${isActive ? 'font-bold' : 'font-semibold'}`}>
                        {item.label}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {canScroll && (
                <div ref={trackRef} className="pointer-events-none absolute bottom-1.5 left-6 right-6 h-[2px] rounded-full bg-ink/[0.06]">
                  <div ref={thumbRef} className="absolute left-0 top-0 h-full rounded-full bg-ink/40 will-change-transform" />
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
