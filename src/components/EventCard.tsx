import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventCardSkeleton from './EventCardSkeleton';
import HypeBadge from './HypeBadge';
import { useLanguage } from '@/contexts/LanguageContext';
const EventCard = () => {
  const { t } = useLanguage();
  const {
    data: events,
    isLoading
  } = useFeaturedEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Preload all featured event images so switching is instant
  useEffect(() => {
    if (!events || events.length === 0) return;
    events.forEach((event) => {
      if (event.image_url) {
        const img = new Image();
        img.src = event.image_url;
      }
    });
  }, [events]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    let swapTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      // Fondu sortant (300 ms), changement de contenu, puis fondu entrant.
      setIsTransitioning(true);
      swapTimer = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % events.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(swapTimer);
    };
  }, [events]);
  if (isLoading) {
    return <EventCardSkeleton />;
  }
  if (!events || events.length === 0) {
    return null;
  }
  const currentEvent = events[currentIndex];
  return <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="pointer-events-auto touch-auto">
        <div
          className="neo-white-bottom rounded-3xl bg-white dark:bg-stone-900 p-3 pl-4"
        >
          {/* Seul le contenu s'anime (opacité + léger glissement, accéléré GPU) ;
              le cadre et son ombre restent fixes pour éviter les saccades. */}
          <div
            className={`flex items-stretch justify-between gap-4 transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
          >
          <div className="flex flex-col justify-between gap-2 flex-[2_2_0px] min-w-0 py-1">
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="eyebrow text-stone-500 dark:text-stone-400 truncate">
                {currentEvent.venue}
              </span>
              <p className="text-ink dark:text-white text-[17px] font-medium leading-[1.15] tracking-tight line-clamp-2 min-h-[2.3em]">
                {currentEvent.title}
              </p>
              {/* Date & heure */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-lime text-[11px] font-medium text-ink capitalize">
                  {format(new Date(currentEvent.date), 'EEE dd MMM', { locale: fr })}
                </span>
                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-parchment dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300 tabular">
                  {currentEvent.time?.slice(0, 5)}
                </span>
                <HypeBadge eventId={currentEvent.id} eventDate={currentEvent.date} eventTime={currentEvent.time} capacity={currentEvent.capacity} size="sm" />
              </div>
            </div>
            <Link to={`/event/${currentEvent.id}`} className="group inline-flex w-fit cursor-pointer items-center gap-1.5 text-[13px] font-medium text-ink dark:text-white link-underline hover:text-stone-600 transition-colors">
              <span>{t('seeDetails')}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div style={{
          backgroundImage: `url('${currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop'}')`
        }} className="w-[104px] h-[104px] flex-shrink-0 bg-center bg-no-repeat bg-cover rounded-2xl bg-parchment" />
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, index) => <div key={index} className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20 dark:bg-stone-600'}`} />)}
        </div>
      </div>
    </div>;
};
export default EventCard;
