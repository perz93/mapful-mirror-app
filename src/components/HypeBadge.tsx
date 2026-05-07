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
    if (count >= 40) return { level: 'SOLD OUT', color: 'bg-red-500', glow: 'shadow-red-500/40' };
    if (count >= 25) return { level: 'HOT', color: 'bg-orange-500', glow: 'shadow-orange-500/40' };
    if (count >= 15) return { level: 'HYPE', color: 'bg-amber-500', glow: 'shadow-amber-500/40' };
    if (count >= 8) return { level: 'TREND', color: 'bg-yellow-500', glow: 'shadow-yellow-500/30' };
    return { level: '', color: '', glow: '' };
  }

  const pct = (count / capacity) * 100;
  if (pct >= 90) return { level: 'SOLD OUT', color: 'bg-red-500', glow: 'shadow-red-500/40' };
  if (pct >= 60) return { level: 'HOT', color: 'bg-orange-500', glow: 'shadow-orange-500/40' };
  if (pct >= 35) return { level: 'HYPE', color: 'bg-amber-500', glow: 'shadow-amber-500/40' };
  if (pct >= 15) return { level: 'TREND', color: 'bg-yellow-500', glow: 'shadow-yellow-500/30' };
  return { level: '', color: '', glow: '' };
};

const HypeBadge = ({ eventId, eventDate, eventTime, capacity, size = 'sm' }: HypeBadgeProps) => {
  const { count } = useAttendees(eventId);
  const countdownText = getCountdownText(eventDate, eventTime);
  const hype = getHypeLevel(count, capacity);

  if (!countdownText && !hype.level) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Countdown badge */}
      {countdownText && (
        <span className={`inline-flex items-center rounded-full font-bold backdrop-blur-md bg-black/60 text-white border border-white/20 ${sizeClasses[size]}`}>
          <Clock size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          {countdownText}
        </span>
      )}

      {/* Hype level badge */}
      {hype.level && (
        <span className={`inline-flex items-center rounded-full font-bold text-white shadow-lg animate-pulse ${hype.color} ${hype.glow} ${sizeClasses[size]}`}>
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
