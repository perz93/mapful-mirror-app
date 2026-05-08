import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Event } from '@/hooks/useEvents';
import ShimmerImage from './ShimmerImage';

interface EventListCardProps {
  event: Event;
}

const EventListCard = ({ event }: EventListCardProps) => {
  if (!event) return null;
  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(date);
    const [hours] = time.split(':');
    return `${format(eventDate, 'EEE, d MMM', { locale: fr })} • ${hours}h00`;
  };

  return (
    <div className="w-full pointer-events-auto touch-auto">
      <div className="flex items-stretch justify-between gap-3 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 p-4 shadow-2xl border border-white/50 dark:border-stone-700/50">
        <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
          <div className="flex flex-col gap-0.5">
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              {event.venue}
            </p>
            <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
              {event.title}
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              {formatEventDate(event.date, event.time)}
            </p>
          </div>
          <Link 
            to={`/event/${event.id}`} 
            className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-7 px-3 bg-primary text-primary-foreground text-xs font-medium leading-normal hover:opacity-90 transition-all active:scale-95"
          >
            <span>Voir détails</span>
          </Link>
        </div>
        <ShimmerImage
          src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'}
          alt={event.title}
          className="w-20 h-20 flex-shrink-0 rounded"
        />
      </div>
    </div>
  );
};

export default EventListCard;
