import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEventsByCategory } from '@/hooks/useEventsByCategory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
            <div className="flex items-center gap-4 px-4 py-4">
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
            <p className="text-stone-600 dark:text-stone-400">Chargement...</p>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in animate-zoom-smooth">
        <div className="mx-auto max-w-md">
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
            <div className="flex items-center gap-4 px-4 py-4">
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
            <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des événements</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900 animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 text-stone-900 dark:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50">
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <div className="flex items-center gap-3">
              <HeaderIcon />
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{title}</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-3">
          {!events || events.length === 0 ? <div className="flex items-center justify-center min-h-[50vh]">
              <p className="text-stone-600 dark:text-stone-400">Aucun événement dans cette catégorie pour le moment</p>
            </div> : events.map(event => <Link key={event.id} to={`/event/${event.id}`} className="block group">
                <div className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-stone-200/50 dark:border-stone-800/50">
                  <div className="h-44 relative overflow-hidden bg-muted">
                    <img
                      src={event.image_url ? `${event.image_url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=600&quality=72&resize=cover` : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop&q=70'}
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="flex-1">
                        <p className="text-white/90 text-xs font-medium mb-1">{event.venue}</p>
                        <h3 className="text-white text-lg font-bold leading-tight pr-2">{event.title}</h3>
                      </div>
                      {event.price && <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-semibold whitespace-nowrap">
                          {event.price} FCFA
                        </span>}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} strokeWidth={2} />
                        <span className="text-xs font-medium">
                          {format(new Date(event.date), 'EEE, dd MMM', {
                      locale: fr
                    })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} strokeWidth={2} />
                        <span className="text-xs font-medium">{event.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>)}
        </div>
      </div>
    </div>;
};
export default CategoryPage;