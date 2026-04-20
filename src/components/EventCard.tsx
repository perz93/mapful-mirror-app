import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
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
  if (isLoading || !events || events.length === 0) {
    return null;
  }
  const currentEvent = events[currentIndex];
  return <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="pointer-events-auto touch-auto">
        <div className={`flex items-stretch justify-between gap-3 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 p-4 shadow-2xl border border-white/50 dark:border-stone-700/50 transition-all duration-700 ease-in-out ${isTransitioning ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
          <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs leading-normal font-semibold text-zinc-500">
                {currentEvent.venue}
              </p>
              <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
                {currentEvent.title}
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
                {format(new Date(currentEvent.date), 'EEE, dd MMM', {
                locale: fr
              })} • {currentEvent.time}
              </p>
            </div>
            <Link to={`/event/${currentEvent.id}`} className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-7 px-3 bg-primary text-primary-foreground text-xs font-medium leading-normal hover:opacity-90 transition-all active:scale-95">
              <span>Voir détails</span>
            </Link>
          </div>
          <img
            src={currentEvent.image_url ? getOptimizedImageUrl(currentEvent.image_url, { width: 200, quality: 70 }) : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop&q=70'}
            alt={currentEvent.title}
            loading="lazy"
            decoding="async"
            className="w-20 h-20 flex-shrink-0 object-contain bg-muted rounded transition-all duration-700 ease-in-out"
          />
        </div>
        
        {/* Progress indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, index) => <div key={index} className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-primary' : 'w-1 bg-stone-300 dark:bg-stone-600'}`} />)}
        </div>
      </div>
    </div>;
};
export default EventCard;