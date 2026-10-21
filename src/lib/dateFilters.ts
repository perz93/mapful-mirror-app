import { eventEnd, type EventSchedule } from '@/lib/eventStatus';

/** Filtres « Quand » de la recherche */
export type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend' | 'week' | 'next_week' | 'month';

export const DATE_FILTERS: { id: DateFilter; tKey: string }[] = [
  { id: 'all', tKey: 'when.all' },
  { id: 'week', tKey: 'when.week' },
  { id: 'weekend', tKey: 'when.weekend' },
  { id: 'next_week', tKey: 'when.nextWeek' },
  { id: 'month', tKey: 'when.month' },
];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const plus = (d: Date, n: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

/**
 * Période couverte par un filtre (jours inclus, heure locale).
 * Semaine du lundi au dimanche ; « ce week-end » = vendredi → dimanche
 * (on sort dès le vendredi soir), ou d'aujourd'hui à dimanche si on y est déjà.
 */
export function dateFilterRange(filter: DateFilter, now = new Date()): [string, string] | null {
  const day = now.getDay(); // 0 = dimanche … 6 = samedi
  const toSunday = (7 - day) % 7;
  switch (filter) {
    case 'today':
      return [iso(now), iso(now)];
    case 'tomorrow':
      return [iso(plus(now, 1)), iso(plus(now, 1))];
    case 'weekend':
      return day === 5 || day === 6 || day === 0 ? [iso(now), iso(plus(now, toSunday))] : [iso(plus(now, 5 - day)), iso(plus(now, toSunday))];
    case 'week':
      return [iso(now), iso(plus(now, toSunday))];
    case 'next_week': {
      const monday = plus(now, toSunday + 1);
      return [iso(monday), iso(plus(monday, 6))];
    }
    case 'month':
      return [iso(now), iso(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
    default:
      return null;
  }
}

/**
 * L'événement a lieu pendant la période. Une soirée qui finit avant 6 h du matin
 * compte pour la veille (une soirée de samedi 22 h – 4 h n'est pas « dimanche »).
 */
export const matchesDateFilter = (e: EventSchedule, filter: DateFilter, now = new Date()) => {
  const range = dateFilterRange(filter, now);
  if (!range) return true;
  const end = iso(new Date(eventEnd(e).getTime() - 6 * 3600 * 1000));
  const lastDay = end > e.date ? end : e.date;
  return e.date <= range[1] && lastDay >= range[0];
};
