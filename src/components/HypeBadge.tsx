import { Flame, Clock, Zap } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';
import { differenceInDays, differenceInHours, differenceInMinutes, isToday, isTomorrow, isPast } from 'date-fns';

interface HypeBadgeProps {
  eventId: string;
  eventDate: string;
  eventTime: string;
  capacity?: number;
  size?: 'sm' | 'md' | 'lg';
}

const getCountdownText = (date: string, time: string) => {
  const eventDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  if (isPast(eventDateTime)) return null;

  const days = differenceInDays(eventDateTime, now);
  const hours = differenceInHours(eventDateTime, now);
  const minutes = differenceInMinutes(eventDateTime, now);

  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `J-${days}`;
};

const getHypeLevel = (count: number, capacity?: number): { level: string; color: string; glow: string } => {
  if (!capacity || capacity <= 0) {
    // Fallback seuils fixes si pas de capacity
    if (count >= 40) return { level: 'SOLD OUT', color: 'bg-ink text-parchment', glow: '' };
    if (count >= 25) return { level: 'HOT', color: 'bg-lime text-ink', glow: '' };
    if (count >= 15) return { level: 'HYPE', color: 'bg-lime/50 text-ink', glow: '' };
    if (count >= 8) return { level: 'TREND', color: 'bg-parchment text-ink border border-ink/10', glow: '' };
    return { level: '', color: '', glow: '' };
  }

  const pct = (count / capacity) * 100;
  if (pct >= 90) return { level: 'SOLD OUT', color: 'bg-ink text-parchment', glow: '' };
  if (pct >= 60) return { level: 'HOT', color: 'bg-lime text-ink', glow: '' };
  if (pct >= 35) return { level: 'HYPE', color: 'bg-lime/50 text-ink', glow: '' };
  if (pct >= 15) return { level: 'TREND', color: 'bg-parchment text-ink border border-ink/10', glow: '' };
  return { level: '', color: '', glow: '' };
};

const HypeBadge = ({ eventId, eventDate, eventTime, capacity, size = 'sm' }: HypeBadgeProps) => {
  const { count } = useAttendees(eventId);
  const countdownText = getCountdownText(eventDate, eventTime);
  const hype = getHypeLevel(count, capacity);

  if (!countdownText && !hype.level) return null;

  const sizeClasses = {
    sm: 'text-[10px] h-6 px-2 gap-1',
    md: 'text-[11px] h-7 px-2.5 gap-1.5',
    lg: 'text-xs h-8 px-3 gap-2',
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Countdown badge */}
      {countdownText && (
        <span className={`inline-flex items-center rounded-full font-medium tracking-[0.06em] uppercase bg-ink text-parchment tabular ${sizeClasses[size]}`}>
          <Clock size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          {countdownText}
        </span>
      )}

      {/* Hype level badge */}
      {hype.level && (
        <span className={`inline-flex items-center rounded-full font-medium tracking-[0.06em] tabular ${hype.color} ${sizeClasses[size]}`}>
          {hype.level === 'SOLD OUT' ? (
            <Zap size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          ) : (
            <Flame size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          )}
          {hype.level}
        </span>
      )}
    </div>
  );
};

export default HypeBadge;
export { getCountdownText, getHypeLevel };
