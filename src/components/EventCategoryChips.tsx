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
    `snap-start flex-shrink-0 inline-flex items-center gap-2 h-12 rounded-full text-[13px] font-medium btn-float transition-colors duration-200 active:scale-95 ${
      on ? 'bg-ink text-parchment' : 'bg-white text-ink'
    }`;

  return (
    <div className="sticky-chips">
      <div ref={rowRef} className="flex gap-2 overflow-x-auto px-4 scroll-px-4 pt-2 pb-7 -mt-2 -mb-6 scrollbar-hide snap-x">
        <Link to="/evenements" replace state={{ chip: true }} data-active={active === 'all'} className={`${chip(active === 'all')} px-4`}>
          {t('market.all')}
        </Link>
        {EVENT_CATEGORIES.map((c) => {
          const on = active === c.value;
          return (
            <Link key={c.value} to={c.path} replace state={{ chip: true }} data-active={on} className={`${chip(on)} pl-1.5 pr-4`}>
              <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full ${on ? 'bg-lime' : 'bg-parchment'}`}>
                <img src={c.icon} alt="" className="size-5" />
              </span>
              {/* Nom sur deux lignes (comme la barre du bas) ; « bien-être » ne se coupe pas */}
              <span className="max-w-[92px] whitespace-normal text-left leading-[1.15]">
                {t(c.tKey).replace(/-/g, '\u2011')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EventCategoryChips;
