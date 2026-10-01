import { Flame, Users, Zap } from 'lucide-react';
import { useAttendees } from '@/hooks/useAttendees';
import { useLanguage } from '@/contexts/LanguageContext';

interface HypeBarProps {
  eventId: string;
  maxCapacity?: number;
}

const HypeBar = ({ eventId, maxCapacity = 50 }: HypeBarProps) => {
  const { t } = useLanguage();
  const { count } = useAttendees(eventId);
  const percentage = Math.min((count / maxCapacity) * 100, 100);

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-ink';
    return 'bg-lime';
  };

  const getLabel = () => {
    if (percentage >= 90) return t('hype.full');
    if (percentage >= 60) return t('hype.limited');
    if (percentage >= 35) return t('hype.rising');
    if (percentage >= 15) return t('hype.trending');
    return '';
  };

  const getLabelColor = () => {
    return 'text-ink';
  };

  const getIcon = () => {
    if (percentage >= 90) return <Zap size={14} className="text-ink" />;
    if (percentage >= 35) return <Flame size={14} className="text-ink" />;
    return <Users size={14} className="text-stone-400" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {count}/{maxCapacity} {t('event.attendees')}
          </span>
        </div>
        {getLabel() && (
          <span className={`eyebrow ${getLabelColor()}`}>
            {getLabel()}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700/40 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${getBarColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage > 0 && (
        <div className="flex justify-end">
          <span className="text-[11px] text-stone-500 dark:text-stone-500 tabular">
            {Math.round(percentage)}{t('hype.filled')}
          </span>
        </div>
      )}
    </div>
  );
};

export default HypeBar;
