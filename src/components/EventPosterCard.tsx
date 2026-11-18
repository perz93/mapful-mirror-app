import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MapPin, Clock } from 'lucide-react';
import ShimmerImage from './ShimmerImage';
import { softCase } from '@/lib/softCase';
import { isMultiDay, lastDay, timeRangeLabel } from '@/lib/eventStatus';
import { eventPriceText } from '@/lib/ticketTypes';
import { focusPosition } from '@/lib/imageFocus';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PosterEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  end_date?: string | null;
  end_time?: string | null;
  venue: string | null;
  image_url: string | null;
  image_focus?: string | null;
  price?: number | null;
  is_paid?: boolean | null;
  ticket_types?: unknown;
}

/** Carte d'événement « affiche » : photo, prix, date « DÉC 06 », titre, lieu et heure */
const EventPosterCard = ({ event, ended = false }: { event: PosterEvent; ended?: boolean }) => {
  const { t, lang } = useLanguage();
  const d = new Date(`${event.date}T00:00:00`);
  const multi = isMultiDay(event);
  return (
    <Link to={`/event/${event.id}`} className="block no-press">
      <article className="card-shadow overflow-hidden rounded-[26px] bg-parchment p-2 text-ink">
        <div className="relative h-44 overflow-hidden rounded-[20px]">
          <ShimmerImage
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=75&fm=webp'}
            position={focusPosition(event.image_focus)}
            alt={event.title}
            className={`h-full w-full ${ended ? 'grayscale-[.75]' : ''}`}
          />
          {ended && (
            <span className="absolute left-2.5 top-2.5 inline-flex h-7 items-center rounded-full bg-ink/85 px-3 text-xs font-medium text-white">
              {t('status.ended')}
            </span>
          )}
          <span className="absolute right-2.5 top-2.5 inline-flex h-7 items-center rounded-full bg-lime px-3 text-xs font-medium text-ink tabular">
            {eventPriceText(event, lang)}
          </span>
        </div>
        <div className={`flex items-center gap-3.5 px-2 pb-1.5 pt-3 ${ended ? 'opacity-60' : ''}`}>
          <div className="flex-shrink-0 border-r border-stone-200 pr-3.5 text-center leading-none">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
              {format(d, 'MMM', { locale: lang === 'en' ? enUS : fr }).replace('.', '')}
            </p>
            <p className={`font-display mt-0.5 tracking-tight text-ink tabular ${multi ? 'text-[20px]' : 'text-[28px]'}`}>
              {format(d, 'dd')}
              {multi && `–${format(new Date(`${lastDay(event)}T00:00:00`), 'dd')}`}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[20px] leading-[1.05] tracking-tight text-ink line-clamp-2">{softCase(event.title)}</h3>
            <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
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
        </div>
      </article>
    </Link>
  );
};

export default EventPosterCard;
