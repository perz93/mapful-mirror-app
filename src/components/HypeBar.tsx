import { Flame, Users, Zap } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';

interface HypeBarProps {
  eventId: string;
  maxCapacity?: number;
}

const HypeBar = ({ eventId, maxCapacity = 50 }: HypeBarProps) => {
  const { count } = useAttendees(eventId);
  const percentage = Math.min((count / maxCapacity) * 100, 100);

  const getBarColor = () => {
    if (percentage >= 90) return 'from-red-500 to-rose-600';
    if (percentage >= 60) return 'from-orange-500 to-red-500';
    if (percentage >= 35) return 'from-amber-500 to-orange-500';
    if (percentage >= 15) return 'from-yellow-400 to-amber-500';
    return 'from-lime-400 to-yellow-400';
  };

  const getLabel = () => {
    if (percentage >= 90) return 'Complet !';
    if (percentage >= 60) return 'Places limitées';
    if (percentage >= 35) return 'Ca monte !';
    if (percentage >= 15) return 'Tendance';
    return '';
  };

  const getLabelColor = () => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-amber-500';
  };

  const getIcon = () => {
    if (percentage >= 90) return <Zap size={14} className="text-red-500 animate-pulse" />;
    if (percentage >= 60) return <Flame size={14} className="text-orange-500 animate-pulse" />;
    if (percentage >= 35) return <Flame size={14} className="text-amber-500" />;
    return <Users size={14} className="text-stone-400" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {count}/{maxCapacity} y vont
          </span>
        </div>
        {getLabel() && (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${getLabelColor()}`}>
            {getLabel()}
          </span>
        )}
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-stone-200/60 dark:bg-stone-700/40 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {percentage >= 35 && (
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getBarColor()} opacity-40 animate-pulse`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {percentage > 0 && (
        <div className="flex justify-end">
          <span className="text-[10px] text-stone-400 dark:text-stone-500">
            {Math.round(percentage)}% rempli
          </span>
        </div>
      )}
    </div>
  );
};

export default HypeBar;
