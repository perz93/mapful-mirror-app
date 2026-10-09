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
import { useEvents } from '@/hooks/useEvents';
import { CITIES, eventCity, findCity, normalizeName } from '@/lib/cities';


interface BottomNavigationProps {
  className?: string;
}


const BottomNavigation = ({ className = "" }: BottomNavigationProps) => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, toggleCategory,
    distanceFilter, setDistanceFilter, cityFilter, setCityFilter, activeFilterCount, clearFilters, searchOpen, setSearchOpen,
  } = useSearch();
  const { t } = useLanguage();
  const { data: events } = useEvents();

  // Villes où il y a des publications, les plus actives d'abord
  const cityCounts = new Map<string, number>();
  const cityPoints = new Map<string, { lat: number; lng: number; n: number }>();
  for (const ev of events ?? []) {
    const city = eventCity(ev);
    if (!city) continue;
    cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
    const p = cityPoints.get(city) ?? { lat: 0, lng: 0, n: 0 };
    cityPoints.set(city, { lat: p.lat + Number(ev.latitude), lng: p.lng + Number(ev.longitude), n: p.n + 1 });
  }
  const cities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'));

  // Les villes les plus actives en pastilles ; les autres via « Autre ville »
  const TOP_CITIES = 4;
  const [cityQuery, setCityQuery] = useState('');
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const topCities = cities.slice(0, TOP_CITIES);
  if (cityFilter && !topCities.some(([name]) => name === cityFilter)) {
    topCities.push([cityFilter, cityCounts.get(cityFilter) ?? 0]);
  }
  // Villes connues + localités où il y a des événements (villages, communes…)
  const allCityNames = [...new Set([...CITIES.map((c) => c.name), ...cityCounts.keys()])];
  const cityMatches = cityQuery.trim()
    ? allCityNames
        .filter((name) => normalizeName(name).includes(normalizeName(cityQuery)))
        .map((name) => [name, cityCounts.get(name) ?? 0] as const)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
        .slice(0, 6)
    : cities.slice(TOP_CITIES).map(([name, count]) => [name, count] as const);

  const chooseCity = (name: string | null) => {
    setCitySearchOpen(false);
    setCityQuery('');
    const next = name === cityFilter ? null : name;
    setCityFilter(next);
    const city = findCity(next);
    const pts = next ? cityPoints.get(next) : undefined;
    // Ville connue : son centre ; sinon le centre de ses événements
    const target = city
      ? { lat: city.lat, lng: city.lng, zoom: city.radiusKm >= 10 ? 12 : 13 }
      : pts ? { lat: pts.lat / pts.n, lng: pts.lng / pts.n, zoom: 14 } : null;
    if (target) window.dispatchEvent(new CustomEvent('map:flyto', { detail: target }));
  };

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
                aria-label={t('nav.clearBtn')}
                className="h-11 w-11 rounded-full bg-parchment flex items-center justify-center hover:bg-stone-200 transition-all active:scale-95"
              >
                <X size={20} strokeWidth={2} className="text-ink" />
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

            {/* Ville */}
            <div className="px-5 py-4 space-y-3">
              <p className="eyebrow text-stone-500">{t('nav.city')}</p>
              <div className="flex flex-wrap gap-1.5">
                {[{ name: null as string | null, label: t('nav.allDistance'), count: 0 },
                  ...topCities.map(([name, count]) => ({ name: name as string | null, label: name, count }))].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => chooseCity(opt.name)}
                    className={`h-8 px-3.5 rounded-full border text-[13px] font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                      cityFilter === opt.name
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-ink'
                    }`}
                  >
                    {opt.label}
                    {opt.count > 0 && (
                      <span className={cityFilter === opt.name ? 'text-parchment/60' : 'text-stone-400'}>{opt.count}</span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setCitySearchOpen((o) => !o)}
                  className={`h-8 px-3.5 rounded-full border border-dashed text-[13px] font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                    citySearchOpen ? 'border-ink text-ink' : 'border-stone-300 text-stone-600'
                  }`}
                >
                  <Search size={13} strokeWidth={2} />
                  {t('nav.otherCity')}
                </button>
              </div>

              {citySearchOpen && (
                <div className="rounded-2xl border border-stone-200 overflow-hidden animate-fade-in">
                  <div className="relative border-b border-stone-100">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                    <input
                      type="text"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder={t('nav.cityPlaceholder')}
                      autoFocus
                      className="w-full h-11 pl-10 pr-3 bg-white text-ink placeholder:text-stone-400 text-[15px] focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {cityMatches.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-stone-500">{cityQuery.trim() ? t('nav.cityNone') : t('nav.cityHint')}</p>
                    ) : cityMatches.map(([name, count]) => (
                      <button
                        key={name}
                        onClick={() => chooseCity(name)}
                        className="w-full flex items-center justify-between px-4 h-11 text-left text-[15px] text-ink border-b border-stone-100 last:border-b-0 active:bg-parchment"
                      >
                        <span>{name}</span>
                        <span className="text-xs text-stone-400">
                          {count > 0 ? t('nav.cityCount').replace('{n}', String(count)) : t('nav.cityEmpty')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
