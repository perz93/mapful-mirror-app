import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Flame, MapPin, Clock } from 'lucide-react';
import { useTonightEvents } from '@/hooks/useTonightEvents';
import { useAttendees } from '@/hooks/useAttendees';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import HypeBadge from './HypeBadge';

const AttendeesBadge = ({ eventId }: { eventId: string }) => {
  const { count } = useAttendees(eventId);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ee9d2b]/15 text-[#ee9d2b] border border-[#ee9d2b]/20">
      <Flame size={10} />
      {count} y vont
    </span>
  );
};

const TonightSection = () => {
  const { data: events, isLoading } = useTonightEvents();
  const [dismissed, setDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSection, setShowSection] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    const t = setTimeout(() => setShowSection(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (dismissed || isLoading || !events || events.length === 0) return null;

  return (
    <div
      className={`fixed bottom-[240px] left-0 right-0 max-w-md mx-auto px-3 z-10 pointer-events-none transition-all duration-500 ${
        showSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="pointer-events-auto rounded-2xl backdrop-blur-2xl bg-white/50 dark:bg-stone-900/50 border border-white/60 dark:border-stone-700/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ee9d2b]/15">
              <Flame size={14} className="text-[#ee9d2b]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-600 dark:text-stone-300">
              Ce soir
            </p>
            <span className="h-4 w-px bg-stone-300/50 dark:bg-stone-600/50" />
            <p className="text-[11px] text-stone-400 dark:text-stone-500 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {format(new Date(), 'EEEE d MMM', { locale: fr })}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="h-7 w-7 rounded-full bg-stone-200/50 dark:bg-stone-700/30 flex items-center justify-center hover:bg-stone-300/60 dark:hover:bg-stone-600/40 transition-all active:scale-90"
          >
            <X size={12} strokeWidth={2.5} className="text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-hide px-3.5 pb-3 pt-1"
        >
          {events.slice(0, 8).map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="flex-shrink-0 w-[140px] rounded-xl bg-white/70 dark:bg-stone-800/50 border border-stone-100/60 dark:border-stone-700/30 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
            >
              <div
                className="h-[80px] bg-cover bg-center"
                style={{
                  backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop'}')`,
                }}
              />
              <div className="p-2 space-y-1">
                <p className="text-[11px] font-bold text-stone-900 dark:text-white leading-tight line-clamp-2">
                  {event.title}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-stone-400">
                  <Clock size={9} />
                  <span>{event.time.substring(0, 5)}</span>
                </div>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {event.venue}
                </p>
                <HypeBadge eventId={event.id} eventDate={event.date} eventTime={event.time} size="sm" />
              </div>
            </Link>
          ))}
          {events.length > 3 && (
            <div className="flex-shrink-0 w-[60px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-stone-400 dark:text-stone-500">
                <ChevronRight size={16} />
                <span className="text-[9px] font-medium">Scroll</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TonightSection;
