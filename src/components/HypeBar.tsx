import { Flame } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';

interface HypeBarProps {
  eventId: string;
  maxCapacity?: number;
}

const HypeBar = ({ eventId, maxCapacity = 50 }: HypeBarProps) => {
  const { count } = useAttendees(eventId);
  const percentage = Math.min((count / maxCapacity) * 100, 100);

  const getBarColor = () => {
    if (percentage >= 80) return 'from-red-500 to-orange-500';
    if (percentage >= 50) return 'from-orange-500 to-amber-500';
    if (percentage >= 25) return 'from-amber-500 to-yellow-500';
    return 'from-yellow-500 to-lime-500';
  };

  const getLabel = () => {
    if (percentage >= 80) return 'Presque complet !';
    if (percentage >= 50) return 'Places limitées';
    if (percentage >= 25) return 'Ca monte !';
    return '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame size={14} className={percentage >= 50 ? 'text-orange-500 animate-pulse' : 'text-amber-500'} />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {count} y vont
          </span>
        </div>
        {getLabel() && (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${percentage >= 80 ? 'text-red-500' : 'text-amber-500'}`}>
            {getLabel()}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full rounded-full bg-stone-200/60 dark:bg-stone-700/40 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {percentage >= 50 && (
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getBarColor()} opacity-50 animate-pulse`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default HypeBar;
