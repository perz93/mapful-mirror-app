import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Heart, MapPin, Clock } from 'lucide-react';
import ShimmerImage from './ShimmerImage';
import type { Event } from '@/hooks/useEvents';
import { softCase } from '@/lib/softCase';
import { eventStatus, isMultiDay, lastDay, timeRangeLabel } from '@/lib/eventStatus';
import { focusPosition } from '@/lib/imageFocus';
import { useLanguage } from '@/contexts/LanguageContext';

interface FavoriteEventCardProps {
  event: Event;
  onRemove: (eventId: string) => void;
}

/** Favori : la date à gauche comme un agenda, la photo à droite avec le cœur */
const FavoriteEventCard = ({ event, onRemove }: FavoriteEventCardProps) => {
  const { t, lang } = useLanguage();
  const d = new Date(`${event.date}T00:00:00`);
  const ended = eventStatus(event)?.key === 'status.ended';
  const multi = isMultiDay(event);

  return (
    <div className="relative">
      <Link
        to={`/event/${event.id}`}
        className="card-shadow flex items-center gap-3.5 rounded-[24px] bg-parchment p-2 pl-4 no-press dark:bg-stone-900/80"
      >
        <div className={`flex-shrink-0 border-r border-stone-200 pr-3.5 text-center leading-none ${ended ? 'opacity-55' : ''}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
            {format(d, 'MMM', { locale: lang === 'en' ? enUS : fr }).replace('.', '')}
          </p>
          <p className={`mt-0.5 font-display tracking-tight text-ink tabular ${multi ? 'text-[18px]' : 'text-[26px]'}`}>
            {format(d, 'dd')}
            {multi && `–${format(new Date(`${lastDay(event)}T00:00:00`), 'dd')}`}
          </p>
        </div>
        <div className={`min-w-0 flex-1 ${ended ? 'opacity-55' : ''}`}>
          <p className="truncate font-display text-[16px] leading-tight tracking-tight text-ink dark:text-white">{softCase(event.title)}</p>
          <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5">
            <span className="inline-flex h-6 min-w-0 max-w-full items-center gap-1 rounded-full bg-ink/[0.05] px-2.5 text-[11.5px] font-medium text-stone-700">
              <MapPin size={11} strokeWidth={2.4} className="flex-shrink-0" />
              <span className="truncate">{softCase(event.venue)}</span>
            </span>
            {event.time && (
              <span className="inline-flex h-6 flex-shrink-0 items-center gap-1 rounded-full bg-ink/[0.05] px-2.5 text-[11.5px] font-medium text-stone-700 tabular">
                <Clock size={11} strokeWidth={2.4} />
                {timeRangeLabel(event)}
              </span>
            )}
          </div>
        </div>
        <div className="relative size-[76px] flex-shrink-0">
          <ShimmerImage
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'}
            position={focusPosition(event.image_focus)}
            alt=""
            className={`size-full rounded-[18px] ${ended ? 'grayscale-[.75]' : ''}`}
          />
          {ended && (
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-semibold text-white">
              {t('status.ended')}
            </span>
          )}
        </div>
      </Link>
      {/* Retirer des favoris (en dehors du lien pour ne pas ouvrir l'événement) */}
      <button
        onClick={() => onRemove(event.id)}
        aria-label={t('favorite.removed')}
        className="absolute right-3.5 top-3.5 flex size-7 items-center justify-center rounded-full bg-white text-ink shadow-sm active:scale-90 transition-transform"
      >
        <Heart size={13} strokeWidth={2} className="fill-ink" />
      </button>
    </div>
  );
};

export default FavoriteEventCard;
