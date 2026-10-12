import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ScheduleValue {
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  multiDay: boolean;
}

interface Props {
  value: ScheduleValue;
  onChange: (next: ScheduleValue) => void;
  inputClass: string;
  labelClass: string;
}

/**
 * Dates et heures d'un événement : début obligatoire, fin facultative
 * (plusieurs jours, heure de fin). Partagé entre création et modification.
 */
const EventScheduleFields = ({ value, onChange, inputClass, labelClass }: Props) => {
  const { t } = useLanguage();
  const set = (patch: Partial<ScheduleValue>) => onChange({ ...value, ...patch });
  const endsNextDay = !value.multiDay && value.time && value.endTime && value.endTime <= value.time;

  const clearBtn = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-stone-300/40 flex items-center justify-center"
      aria-label={t('nav.clearBtn')}
    >
      <X className="w-2.5 h-2.5 text-stone-500" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Un jour / plusieurs jours */}
      <div className="flex gap-1.5 p-1 rounded-full bg-parchment w-fit">
        {[false, true].map((multi) => (
          <button
            key={String(multi)}
            type="button"
            onClick={() => set({ multiDay: multi, endDate: multi ? value.endDate : '' })}
            className={`h-8 px-4 rounded-full text-[13px] font-medium transition-colors ${
              value.multiDay === multi ? 'bg-ink text-parchment' : 'text-stone-600'
            }`}
          >
            {multi ? t('form.severalDays') : t('form.oneDay')}
          </button>
        ))}
      </div>

      <div className={value.multiDay ? 'grid grid-cols-2 gap-3' : ''}>
        <div className="space-y-2 min-w-0">
          <label htmlFor="date" className={`block ${labelClass}`}>{value.multiDay ? t('form.startDate') : t('form.date')}</label>
          <div className="relative overflow-hidden">
            <input
              id="date"
              type="date"
              value={value.date}
              onChange={(e) => {
                const date = e.target.value;
                set({ date, endDate: value.endDate && value.endDate < date ? '' : value.endDate });
              }}
              required
              className={`${inputClass} w-full max-w-full`}
            />
            {value.date && clearBtn(() => set({ date: '' }))}
          </div>
        </div>
        {value.multiDay && (
          <div className="space-y-2 min-w-0">
            <label htmlFor="end_date" className={`block ${labelClass}`}>{t('form.endDate')}</label>
            <div className="relative overflow-hidden">
              <input
                id="end_date"
                type="date"
                value={value.endDate}
                min={value.date || undefined}
                onChange={(e) => set({ endDate: e.target.value })}
                required
                className={`${inputClass} w-full max-w-full`}
              />
              {value.endDate && clearBtn(() => set({ endDate: '' }))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 min-w-0">
          <label htmlFor="time" className={`block ${labelClass}`}>{t('form.startTime')}</label>
          <div className="relative overflow-hidden">
            <input
              id="time"
              type="time"
              value={value.time}
              onChange={(e) => set({ time: e.target.value })}
              required
              className={`${inputClass} w-full max-w-full`}
            />
            {value.time && clearBtn(() => set({ time: '' }))}
          </div>
        </div>
        <div className="space-y-2 min-w-0">
          <label htmlFor="end_time" className={`block ${labelClass}`}>{t('form.endTime')}</label>
          <div className="relative overflow-hidden">
            <input
              id="end_time"
              type="time"
              value={value.endTime}
              onChange={(e) => set({ endTime: e.target.value })}
              className={`${inputClass} w-full max-w-full`}
            />
            {value.endTime && clearBtn(() => set({ endTime: '' }))}
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-400">
        {endsNextDay ? t('form.endsNextDay') : value.multiDay ? t('form.scheduleHintMulti') : t('form.scheduleHint')}
      </p>
    </div>
  );
};

export default EventScheduleFields;
