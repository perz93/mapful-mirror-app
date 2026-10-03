import LargeTitle from '@/components/LargeTitle';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import EmptyState from './EmptyState';
import { CalendarDays } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEventsByCategory } from '@/hooks/useEventsByCategory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import HypeBadge from './HypeBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryPageSkeleton } from './PageSkeleton';
import ShimmerImage from './ShimmerImage';
import { getEventCategory } from '@/lib/eventCategories';
import EventCategoryChips from './EventCategoryChips';
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
          <Link to="/" aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-stone-900 text-ink dark:text-white active:scale-95 transition-transform">
            <ArrowLeft size={18} strokeWidth={1.75} />
          </Link>
          {iconSrc && <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime">
            <img src={iconSrc} alt="" className="w-5 h-5" />
          </div>}
        </div>
        <p className="eyebrow text-stone-500 mt-6">
          {isLoading || error ? t('category.eyebrow') : `${count} ${t(count > 1 ? 'category.count' : 'category.countOne')}`}
        </p>
        <LargeTitle className="mt-1.5 text-[44px] leading-[0.95] font-medium tracking-tighter text-ink dark:text-white" backTo="/" right={iconSrc ? <span className="flex size-10 items-center justify-center rounded-full bg-lime"><img src={iconSrc} alt="" className="w-5 h-5" /></span> : undefined}>{title}</LargeTitle>
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
          {!events || events.length === 0 ? <EmptyState icon={CalendarDays} title={t('event.noEvents')} /> : events.map((event, i) => <Link key={event.id} to={`/event/${event.id}`} className="block group">
                <article
                  className="card-shadow overflow-hidden rounded-3xl bg-white dark:bg-stone-900 p-2 transition-transform duration-300 active:scale-[0.99] animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Image */}
                  <div className="h-52 relative overflow-hidden rounded-[20px]">
                    <ShimmerImage
                      src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75&fm=webp'}
                      alt={event.title}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 left-3">
                      <HypeBadge eventId={event.id} eventDate={event.date} eventTime={event.time} capacity={event.capacity} size="sm" />
                    </div>
                    {event.price && <span className="absolute bottom-3 right-3 inline-flex items-center h-7 px-3 rounded-full bg-white text-ink text-xs font-medium whitespace-nowrap tabular">
                        {event.price} FCFA
                      </span>}
                  </div>

                  {/* Texte */}
                  <div className="px-3 pt-4 pb-3 space-y-3">
                    <div>
                      <p className="eyebrow text-stone-500 truncate">{event.venue}</p>
                      <h3 className="mt-1 text-[22px] leading-[1.1] font-medium tracking-tight text-ink dark:text-white">{event.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-lime">
                        <Calendar size={12} strokeWidth={2} className="text-ink" />
                        <span className="text-xs font-medium text-ink capitalize">
                          {format(new Date(event.date), 'EEE dd MMM', { locale: fr })}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-parchment dark:bg-stone-800">
                        <Clock size={12} strokeWidth={2} className="text-stone-500 dark:text-stone-400" />
                        <span className="text-xs font-medium text-stone-600 dark:text-stone-300 tabular">{event.time?.slice(0, 5)}</span>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>)}
        </div>
      </div>
    </div>;
};
export default CategoryPage;
