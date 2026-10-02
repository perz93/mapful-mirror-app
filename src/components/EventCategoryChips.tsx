import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_CATEGORIES } from '@/lib/eventCategories';
import { useLanguage } from '@/contexts/LanguageContext';

/** Filtres des pages catégorie : « Tout » + chaque catégorie (même style que le Marketplace). */
const EventCategoryChips = ({ active }: { active: string }) => {
  const { t } = useLanguage();
  const rowRef = useRef<HTMLDivElement>(null);

  // Amène la puce active dans le champ de vision
  useEffect(() => {
    const el = rowRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [active]);

  const chip = (on: boolean) =>
    `snap-start flex-shrink-0 inline-flex items-center gap-2 h-10 rounded-full text-sm font-medium border transition-colors duration-200 active:scale-95 ${
      on ? 'bg-ink text-parchment border-ink' : 'bg-white text-ink border-stone-200 hover:border-ink'
    }`;

  return (
    <div className="sticky-chips">
      <div ref={rowRef} className="flex gap-2 overflow-x-auto px-4 scroll-px-4 pb-1 scrollbar-hide snap-x">
        <Link to="/evenements" replace state={{ chip: true }} data-active={active === 'all'} className={`${chip(active === 'all')} px-4`}>
          {t('market.all')}
        </Link>
        {EVENT_CATEGORIES.map((c) => {
          const on = active === c.value;
          return (
            <Link key={c.value} to={c.path} replace state={{ chip: true }} data-active={on} className={`${chip(on)} pl-1.5 pr-4`}>
              <span className={`flex size-7 items-center justify-center rounded-full ${on ? 'bg-lime' : 'bg-parchment'}`}>
                <img src={c.icon} alt="" className="size-4" />
              </span>
              {t(`catShort.${c.value}`)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EventCategoryChips;
