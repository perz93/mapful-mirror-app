import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEventsByCategory } from '@/hooks/useEventsByCategory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import HypeBadge from './HypeBadge';
import HypeBar from './HypeBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { CategoryPageSkeleton } from './PageSkeleton';
import ShimmerImage from './ShimmerImage';
interface CategoryPageProps {
  category: string;
  title: string;
  iconSrc: string;
}
const CategoryPage = ({
  category,
  title,
  iconSrc
}: CategoryPageProps) => {
  const { t } = useLanguage();
  const {
    data: events,
    isLoading,
    error
  } = useEventsByCategory(category);
  const HeaderIcon = () => <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-200">
      <img src={iconSrc} alt={title} className="w-6 h-6" />
    </div>;
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in animate-zoom-smooth">
        <div className="mx-auto max-w-md">
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
            <div className="flex items-center gap-4 px-4 py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
              <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 text-stone-900 dark:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50">
                <ArrowLeft size={20} strokeWidth={2} />
              </Link>
              <div className="flex items-center gap-3">
                <HeaderIcon />
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h1>
              </div>
            </div>
          </header>
          <CategoryPageSkeleton />
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in animate-zoom-smooth">
        <div className="mx-auto max-w-md">
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
            <div className="flex items-center gap-4 px-4 py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
              <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 text-stone-900 dark:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50">
                <ArrowLeft size={20} strokeWidth={2} />
              </Link>
              <div className="flex items-center gap-3">
                <HeaderIcon />
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h1>
              </div>
            </div>
          </header>
          <div className="p-4 flex items-center justify-center min-h-[50vh]">
            <p className="text-red-600 dark:text-red-400">{t('form.loadError')}</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-4 px-4 py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 text-stone-900 dark:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50">
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <div className="flex items-center gap-3">
              <HeaderIcon />
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-5">
          {!events || events.length === 0 ? <div className="flex items-center justify-center min-h-[50vh]">
              <p className="text-stone-600 dark:text-stone-400">{t('event.noEvents')}</p>
            </div> : events.map((event, i) => <Link key={event.id} to={`/event/${event.id}`} className="block group">
                <div
                  className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] transition-all duration-500 hover:scale-[1.02] border border-white/80 dark:border-stone-700/40 animate-fade-in"
                  style={{
                    animation: `float 6s ease-in-out infinite, fade-in 0.5s ease-out`,
                    animationDelay: `${i * 0.8}s, ${i * 0.1}s`,
                  }}
                >
                  {/* Image section */}
                  <div className="h-48 relative overflow-hidden">
                    <ShimmerImage
                      src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75&fm=webp'}
                      alt={event.title}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    {/* Hype + Countdown badges top-right */}
                    <div className="absolute top-3 right-3">
                      <HypeBadge eventId={event.id} eventDate={event.date} eventTime={event.time} capacity={event.capacity} size="sm" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="flex-1">
                        <p className="text-white/90 text-xs font-semibold mb-1 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{event.venue}</p>
                        <h3 className="text-white text-lg font-bold leading-tight pr-2 drop-shadow-sm">{event.title}</h3>
                      </div>
                      {event.price && <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-bold whitespace-nowrap shadow-sm">
                          {event.price} FCFA
                        </span>}
                    </div>
                  </div>

                  {/* Info section */}
                  <div className="p-4 space-y-3">
                    {/* Date & Time badges */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ee9d2b]/10 border border-[#ee9d2b]/20">
                        <Calendar size={13} strokeWidth={2.5} className="text-[#ee9d2b]" />
                        <span className="text-xs font-semibold text-[#ee9d2b]">
                          {format(new Date(event.date), 'EEE dd MMM', { locale: fr })}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                        <Clock size={13} strokeWidth={2.5} className="text-stone-500 dark:text-stone-400" />
                        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">{event.time}</span>
                      </div>
                    </div>
                    <HypeBar eventId={event.id} maxCapacity={event.capacity || 50} />
                  </div>
                </div>
              </Link>)}
        </div>
      </div>
    </div>;
};
export default CategoryPage;