import LargeTitle from '@/components/LargeTitle';
import { ArrowLeft } from 'lucide-react';
import EmptyState from './EmptyState';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEventsByCategory } from '@/hooks/useEventsByCategory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { eventStatus } from '@/lib/eventStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryPageSkeleton } from './PageSkeleton';
import ShimmerImage from './ShimmerImage';
import { getEventCategory } from '@/lib/eventCategories';
import EventCategoryChips from './EventCategoryChips';
import { softCase } from '@/lib/softCase';
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
  const { t } = useLanguage();
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
  const header = <>
      <div className="px-4 pb-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Retour" className="flex size-12 btn-float items-center justify-center rounded-full bg-white dark:bg-stone-900 text-ink dark:text-white active:scale-95 transition-transform">
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          {iconSrc && <div className="flex size-12 btn-float items-center justify-center rounded-full bg-lime">
            <img src={iconSrc} alt="" className="w-5 h-5" />
          </div>}
        </div>
        <p className="eyebrow text-stone-500 mt-6">
          {isLoading || error ? t('category.eyebrow') : `${count} ${t(count > 1 ? 'category.count' : 'category.countOne')}`}
        </p>
        <LargeTitle className="mt-1.5 text-[44px] leading-[0.95] font-medium tracking-tighter text-ink dark:text-white" backTo="/" right={iconSrc ? <span className="flex size-12 btn-float items-center justify-center rounded-full bg-lime"><img src={iconSrc} alt="" className="w-5 h-5" /></span> : undefined}>{title}</LargeTitle>
      </div>
      <EventCategoryChips active={category} />
    </>;
  if (isLoading) {
    return <div className={`min-h-screen bg-parchment dark:bg-stone-950 ${enter}`}>
        <div className="mx-auto max-w-md">
          {header}
          <CategoryPageSkeleton />
        </div>
      </div>;
  }
  if (error) {
    return <div className={`min-h-screen bg-parchment dark:bg-stone-950 ${enter}`}>
        <div className="mx-auto max-w-md">
          {header}
          <div className="p-4 flex items-center justify-center min-h-[50vh]">
            <p className="text-stone-600 dark:text-stone-400">{t('form.loadError')}</p>
          </div>
        </div>
      </div>;
  }
  return <div className={`min-h-screen bg-parchment dark:bg-stone-950 ${enter}`}>
      <div className="mx-auto max-w-md">
        {header}

        <div className="p-4 pt-5 space-y-4 pb-10">
          {!events || events.length === 0 ? <EmptyState icon={CalendarDays} title={t('event.noEvents')} /> : events.map((event, i) => <Link key={event.id} to={`/event/${event.id}`} className="block group no-press">
                {/* Carte sombre : photo, statut + prix dessus, date « OCT 30 » à côté du titre */}
                {(() => {
                  const d = new Date(`${event.date}T00:00:00`);
                  const status = eventStatus(event.date, event.time);
                  const showStatus = status && (status.live || ['status.soon', 'status.inHours', 'status.tomorrow'].includes(status.key));
                  return (
                    <article
                      className="card-shadow overflow-hidden rounded-[26px] bg-white p-2 text-ink animate-fade-in"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="relative h-44 overflow-hidden rounded-[20px]">
                        <ShimmerImage
                          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75&fm=webp'}
                          alt={event.title}
                          className="h-full w-full"
                        />
                        {showStatus && (
                          <span className={`absolute left-2.5 top-2.5 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${status!.live ? 'bg-parchment text-ink' : 'bg-white text-ink'}`}>
                            {status!.live && <span className="size-1.5 rounded-full bg-ink" />}
                            {t(status!.key).replace('{n}', String(status!.n ?? ''))}
                          </span>
                        )}
                        <span className="absolute right-2.5 top-2.5 inline-flex h-7 items-center rounded-full bg-lime px-3 text-xs font-medium text-ink tabular">
                          {event.is_paid && event.price ? `${Number(event.price).toLocaleString('fr-FR')} FCFA` : t('event.free')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 px-2 pb-1.5 pt-3">
                        <div className="flex-shrink-0 border-r border-stone-200 pr-3.5 text-center leading-none">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                            {format(d, 'MMM', { locale: fr }).replace('.', '')}
                          </p>
                          <p className="font-display mt-0.5 text-[28px] tracking-tight text-ink tabular">{format(d, 'dd')}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-[20px] leading-[1.05] tracking-tight text-ink line-clamp-2">{softCase(event.title)}</h3>
                          {/* Q2 : quartier et heure en pastilles crème, plus lisibles */}
                          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                            <span className="inline-flex h-[26px] min-w-0 max-w-full items-center gap-1 rounded-full bg-parchment px-2.5 text-[12px] font-semibold text-ink">
                              <MapPin size={13} strokeWidth={2.2} className="flex-shrink-0" />
                              <span className="truncate">{softCase(event.venue)}</span>
                            </span>
                            {event.time && (
                              <span className="inline-flex h-[26px] flex-shrink-0 items-center gap-1 rounded-full bg-parchment px-2.5 text-[12px] font-semibold text-ink tabular">
                                <Clock size={13} strokeWidth={2.2} />
                                {event.time.slice(0, 5)}
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
      </div>
    </div>;
};
export default CategoryPage;
