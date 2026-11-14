import LargeTitle from '@/components/LargeTitle';
import { ArrowLeft } from 'lucide-react';
import EmptyState from './EmptyState';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEventsByCategory } from '@/hooks/useEventsByCategory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { eventStatus, isMultiDay, lastDay, timeRangeLabel } from '@/lib/eventStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryPageSkeleton } from './PageSkeleton';
import ShimmerImage from './ShimmerImage';
import { getEventCategory } from '@/lib/eventCategories';
import EventCategoryChips from './EventCategoryChips';
import { softCase } from '@/lib/softCase';
import { usePageMeta } from '@/hooks/usePageMeta';
import { eventPriceText } from '@/lib/ticketTypes';
import { focusPosition } from '@/lib/imageFocus';
import { CATEGORY_SEO, categoryDescription, categorySeoByCategory } from '@/lib/categorySeo';
import { isStandalone } from './InstallGuide';
interface CategoryPageProps {
  category: string;
  /** Facultatifs : déduits de la liste des catégories */
  title?: string;
  iconSrc?: string;
}
const CategoryPage = ({
  category,
  title,
  iconSrc
}: CategoryPageProps) => {
  const { t, lang } = useLanguage();
  // Changement via les puces : pas d'animation d'ouverture (seule la liste change)
  const fromChip = (useLocation().state as { chip?: boolean } | null)?.chip;
  const enter = fromChip ? '' : 'page-enter';
  const meta = getEventCategory(category);
  title = meta ? t(meta.tKey) : category === 'all' ? t('category.allTitle') : title ?? category;
  iconSrc = meta?.icon ?? iconSrc ?? '';
  const {
    data: events,
    isLoading,
    error
  } = useEventsByCategory(category);
  const count = events?.length ?? 0;
  const seo = categorySeoByCategory(category);
  // Textes pour Google et les visiteurs du site ; l'app installée reste inchangée
  const web = !!seo && !isStandalone();
  usePageMeta(seo?.title ?? `${title} à Abidjan`, seo ? categoryDescription(seo) : null);
  const header = <>
      <div className="px-4 pb-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Retour" className="flex size-12 btn-float items-center justify-center rounded-full bg-parchment dark:bg-stone-900 text-ink dark:text-white active:scale-95 transition-transform">
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          {iconSrc && <div className="flex size-12 btn-float items-center justify-center rounded-full bg-lime">
            <img src={iconSrc} alt="" className="w-5 h-5" />
          </div>}
        </div>
        <p className="eyebrow text-stone-500 mt-6">
          {isLoading || error ? t('category.eyebrow') : `${count} ${t(count > 1 ? 'category.count' : 'category.countOne')}`}
        </p>
        <LargeTitle className="mt-1.5 text-[44px] leading-[0.95] font-medium tracking-tighter text-ink dark:text-white" backTo="/" compactTitle={title} right={iconSrc ? <span className="flex size-12 btn-float items-center justify-center rounded-full bg-lime"><img src={iconSrc} alt="" className="w-5 h-5" /></span> : undefined}>
          {title}
          {web && <span className="mt-1 block text-[24px] tracking-[-0.03em] text-stone-400">à Abidjan</span>}
        </LargeTitle>
        {web && <p className="mt-3 text-[14.5px] leading-snug text-stone-600">{seo.intro}</p>}
      </div>
      <EventCategoryChips active={category} />
    </>;
  if (isLoading) {
    return <div className={`min-h-screen bg-white dark:bg-stone-950 ${enter}`}>
        <div className="mx-auto max-w-md">
          {header}
          <CategoryPageSkeleton />
        </div>
      </div>;
  }
  if (error) {
    return <div className={`min-h-screen bg-white dark:bg-stone-950 ${enter}`}>
        <div className="mx-auto max-w-md">
          {header}
          <div className="p-4 flex items-center justify-center min-h-[50vh]">
            <p className="text-stone-600 dark:text-stone-400">{t('form.loadError')}</p>
          </div>
        </div>
      </div>;
  }
  return <div className={`min-h-screen bg-white dark:bg-stone-950 ${enter}`}>
      <div className="mx-auto max-w-md">
        {header}

        <div className="p-4 pt-5 space-y-4 pb-10">
          {!events || events.length === 0 ? <EmptyState icon={CalendarDays} title={t('event.noEvents')} /> : events.map((event, i) => <Link key={event.id} to={`/event/${event.id}`} className="block group no-press">
                {/* Carte sombre : photo, statut + prix dessus, date « OCT 30 » à côté du titre */}
                {(() => {
                  const d = new Date(`${event.date}T00:00:00`);
                  const status = eventStatus(event);
                  const showStatus = status && (status.live || ['status.soon', 'status.inHours', 'status.tomorrow'].includes(status.key));
                  return (
                    <article
                      className="card-shadow overflow-hidden rounded-[26px] bg-parchment p-2 text-ink"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="relative h-44 overflow-hidden rounded-[20px]">
                        <ShimmerImage
                          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75&fm=webp'}
                position={focusPosition(event.image_focus)}
                          alt={event.title}
                          className="h-full w-full"
                        />
                        {showStatus && (
                          <span className={`absolute left-2.5 top-2.5 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${status!.live ? 'bg-white text-ink' : 'bg-parchment text-ink'}`}>
                            {status!.live && <span className="size-1.5 rounded-full bg-ink" />}
                            {t(status!.key).replace('{n}', String(status!.n ?? ''))}
                          </span>
                        )}
                        <span className="absolute right-2.5 top-2.5 inline-flex h-7 items-center rounded-full bg-lime px-3 text-xs font-medium text-ink tabular">
                          {eventPriceText(event, lang)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 px-2 pb-1.5 pt-3">
                        <div className="flex-shrink-0 border-r border-stone-200 pr-3.5 text-center leading-none">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                            {format(d, 'MMM', { locale: fr }).replace('.', '')}
                          </p>
                          <p className={`font-display mt-0.5 tracking-tight text-ink tabular ${isMultiDay(event) ? 'text-[20px]' : 'text-[28px]'}`}>
                            {format(d, 'dd')}
                            {isMultiDay(event) && `–${format(new Date(`${lastDay(event)}T00:00:00`), 'dd')}`}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-[20px] leading-[1.05] tracking-tight text-ink line-clamp-2">{softCase(event.title)}</h3>
                          {/* Q2 : quartier et heure en pastilles crème, plus lisibles */}
                          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                            <span className="inline-flex h-[26px] min-w-0 max-w-full items-center gap-1 rounded-full bg-white px-2.5 text-[12px] font-semibold text-ink">
                              <MapPin size={13} strokeWidth={2.2} className="flex-shrink-0" />
                              <span className="truncate">{softCase(event.venue)}</span>
                            </span>
                            {event.time && (
                              <span className="inline-flex h-[26px] flex-shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-[12px] font-semibold text-ink tabular">
                                <Clock size={13} strokeWidth={2.2} />
                                {timeRangeLabel(event)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })()}
              </Link>)}
        </div>
        {web && <CategoryWebFooter category={category} />}
      </div>
    </div>;
};

const TIPS = [
  { q: 'Où acheter les billets ?', a: "Auprès de l'organisateur : ses contacts sont sur la page de chaque événement." },
  { q: 'Comment y aller ?', a: "Ouvre l'événement et touche « Itinéraire » : la carte te guide depuis ta position." },
  { q: 'Être prévenu ?', a: "Ajoute l'événement en favori : tu reçois un rappel avant le début." },
];

/** Bas de page du site (pas de l'app installée) : liens entre catégories, aide, publication */
const CategoryWebFooter = ({ category }: { category: string }) => (
  <section className="px-4 pb-28 pt-2 text-ink">
    <h2 className="font-display text-[22px] leading-tight tracking-[-0.03em]">Autres sorties à Abidjan</h2>
    <div className="mt-3 flex flex-wrap gap-2">
      {CATEGORY_SEO.filter((c) => c.category !== category).map((c) => (
        <Link key={c.path} to={c.path} state={{ chip: true }} className="rounded-full bg-parchment px-4 py-2 text-[13.5px] font-semibold">
          {c.label}
        </Link>
      ))}
    </div>
    <h2 className="mt-8 font-display text-[22px] leading-tight tracking-[-0.03em]">Bon à savoir</h2>
    <div className="mt-3 space-y-2">
      {TIPS.map((tip) => (
        <div key={tip.q} className="rounded-[20px] bg-parchment px-4 py-3.5">
          <h3 className="text-[15px] font-semibold">{tip.q}</h3>
          <p className="mt-1 text-[14px] leading-snug text-stone-600">{tip.a}</p>
        </div>
      ))}
    </div>
    <div className="mt-6 rounded-[24px] bg-ink p-5 text-white">
      <p className="font-display text-[19px] leading-tight tracking-[-0.02em]">Tu organises un événement ?</p>
      <p className="mt-1.5 text-[14px] leading-snug text-stone-300">Publie-le gratuitement : il apparaît sur la carte et sur cette page.</p>
      <Link to="/create-event" className="mt-4 inline-flex h-11 items-center rounded-full bg-lime px-5 text-[14px] font-semibold text-ink">
        Publier un événement
      </Link>
    </div>
  </section>
);
export default CategoryPage;
