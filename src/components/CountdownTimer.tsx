import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import { isPast } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountdownTimerProps {
  eventDate: string;
  eventTime: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ eventDate, eventTime }: CountdownTimerProps) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const target = new Date(`${eventDate}T${eventTime}`);
      const now = new Date();

      if (isPast(target)) {
        setIsLive(true);
        setTimeLeft(null);
        return;
      }

      const diff = target.getTime() - now.getTime();
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  if (isLive) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </div>
        <span className="text-sm font-bold text-red-500 uppercase tracking-wider">{t('countdown.happening')}</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;
  const isSoon = timeLeft.days <= 1;

  const blocks = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.min') },
    { value: timeLeft.seconds, label: t('countdown.sec') },
  ];

  return (
    <div className={`rounded-2xl p-4 border ${isUrgent ? 'bg-red-500/5 border-red-500/20' : isSoon ? 'bg-amber-500/5 border-amber-500/20' : 'bg-stone-100/50 dark:bg-stone-800/30 border-stone-200/50 dark:border-stone-700/30'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isUrgent ? (
          <Zap size={16} className="text-red-500 animate-pulse" />
        ) : (
          <Clock size={16} className={isSoon ? 'text-amber-500' : 'text-stone-500'} />
        )}
        <span className={`text-xs font-bold uppercase tracking-[0.15em] ${isUrgent ? 'text-red-500' : isSoon ? 'text-amber-500' : 'text-stone-500'}`}>
          {isUrgent ? t('countdown.soon') : isSoon ? t('countdown.tomorrow') : t('countdown.title')}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {blocks.map((block) => (
          <div key={block.label} className="flex flex-col items-center">
            <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl font-bold ${isUrgent ? 'bg-red-500/10 text-red-500' : isSoon ? 'bg-amber-500/10 text-amber-600' : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white'} shadow-sm transition-all`}>
              {String(block.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] font-medium text-stone-400 mt-1 uppercase tracking-wider">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
