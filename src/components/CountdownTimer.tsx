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
      <div className="flex items-center gap-2.5 px-5 h-14 rounded-3xl bg-lime">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-50" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-ink" />
        </div>
        <span className="eyebrow text-ink">{t('countdown.happening')}</span>
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
    <div className={`rounded-3xl p-5 ${isUrgent ? 'bg-lime' : 'bg-white dark:bg-stone-900'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isUrgent ? (
          <Zap size={14} strokeWidth={2} className="text-ink" />
        ) : (
          <Clock size={14} strokeWidth={2} className={isSoon ? 'text-ink' : 'text-stone-500'} />
        )}
        <span className={`eyebrow ${isUrgent || isSoon ? 'text-ink' : 'text-stone-500'}`}>
          {isUrgent ? t('countdown.soon') : isSoon ? t('countdown.tomorrow') : t('countdown.title')}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {blocks.map((block) => (
          <div key={block.label} className="flex flex-col items-center">
            <div className={`w-full aspect-square rounded-2xl flex items-center justify-center text-[30px] font-medium tracking-tighter tabular ${isUrgent ? 'bg-white/70 text-ink' : 'bg-parchment dark:bg-stone-800 text-ink dark:text-white'} transition-all`}>
              {String(block.value).padStart(2, '0')}
            </div>
            <span className="eyebrow !text-[10px] text-stone-500 mt-1.5">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
