import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventCardSkeleton from './EventCardSkeleton';
import HypeBadge from './HypeBadge';
const EventCard = () => {
  const {
    data: events,
    isLoading
  } = useFeaturedEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    if (!events || events.length === 0) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % events.length);
        setIsTransitioning(false);
      }, 300); // Half of the transition duration
    }, 5000);
    return () => clearInterval(interval);
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
          className={`flex items-stretch justify-between gap-4 rounded-3xl backdrop-blur-xl bg-white/65 dark:bg-stone-900/60 p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-white/70 dark:border-stone-700/30 transition-all duration-700 ease-in-out ${isTransitioning ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-base backdrop-blur-xl bg-stone-500/15 text-stone-600 dark:bg-white/10 dark:text-stone-300 border border-stone-300/30 dark:border-white/10 shadow-sm w-fit italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600 }}>
                {currentEvent.venue}
              </span>
              <p className="text-stone-900 dark:text-white text-[15px] font-bold leading-tight">
                {currentEvent.title}
              </p>
              {/* Date & Time badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ee9d2b]/10 border border-[#ee9d2b]/20 text-[10px] font-semibold text-[#ee9d2b]">
                  {format(new Date(currentEvent.date), 'EEE dd MMM', { locale: fr })}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                  {currentEvent.time}
                </span>
              </div>
              <div className="mt-0.5">
                <HypeBadge eventId={currentEvent.id} eventDate={currentEvent.date} eventTime={currentEvent.time} capacity={currentEvent.capacity} size="sm" />
              </div>
            </div>
            <Link to={`/event/${currentEvent.id}`} className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#ee9d2b] text-white text-xs font-semibold leading-normal hover:opacity-90 transition-all active:scale-95 shadow-md">
              <span>Voir détails</span>
            </Link>
          </div>
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl shadow-lg border border-white/30 transition-all duration-700 ease-in-out overflow-hidden">
            <img
              src={currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=75&fm=webp'}
              alt={currentEvent.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, index) => <div key={index} className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-primary' : 'w-1 bg-stone-300 dark:bg-stone-600'}`} />)}
        </div>
      </div>
    </div>;
};
export default EventCard;