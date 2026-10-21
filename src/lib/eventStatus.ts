import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';

/** Champs de date d'un événement (fin facultative : plusieurs jours, heure de fin). */
export interface EventSchedule {
  date: string;
  time: string | null;
  end_date?: string | null;
  end_time?: string | null;
}

const HOUR = 3600 * 1000;

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Aujourd'hui au format AAAA-MM-JJ (heure locale). */
export const todayIso = () => isoDay(new Date());

export const eventStart = (e: EventSchedule) => new Date(`${e.date}T${e.time || '00:00'}`);

/** Dernier jour de l'événement (= date s'il tient sur un jour). */
export const lastDay = (e: EventSchedule) => (e.end_date && e.end_date > e.date ? e.end_date : e.date);

export const isMultiDay = (e: EventSchedule) => lastDay(e) !== e.date;

/**
 * Fin de l'événement. Sans heure de fin : 6 h après le début (ou fin de soirée
 * du dernier jour pour un événement sur plusieurs jours). Une heure de fin plus
 * tôt que le début, le même jour, veut dire le lendemain (soirée 22:00 – 04:00).
 */
export function eventEnd(e: EventSchedule): Date {
  const start = eventStart(e);
  const last = lastDay(e);
  if (e.end_time) {
    const end = new Date(`${last}T${e.end_time}`);
    if (end <= start) end.setDate(end.getDate() + 1);
    return end;
  }
  if (last !== e.date) return new Date(`${last}T23:59`);
  return new Date(start.getTime() + 6 * HOUR);
}

/** L'événement a lieu (au moins en partie) entre ces deux jours inclus (AAAA-MM-JJ). */
export const happensBetween = (e: EventSchedule, from: string, to: string) =>
  e.date <= to && isoDay(eventEnd(e)) >= from;

/** Pas encore terminé. */
export const isUpcomingOrLive = (e: EventSchedule) => eventEnd(e).getTime() > Date.now();

/** « 21:00 » ou « 21:00 – 03:00 » */
export const timeRangeLabel = (e: EventSchedule) => {
  const start = e.time?.slice(0, 5) ?? '';
  const end = e.end_time?.slice(0, 5);
  return end && end !== start ? `${start} – ${end}` : start;
};

/**
 * « sam. 8 mai », « 8 – 10 mai », « 30 mai – 2 juin ».
 * withWeekday : jour de la semaine sur une date simple.
 */
export function dateRangeLabel(e: EventSchedule, lang: 'fr' | 'en' = 'fr', withWeekday = true): string {
  const locale = lang === 'fr' ? frLocale : enUS;
  const start = new Date(`${e.date}T00:00:00`);
  const clean = (s: string) => s.replace(/\./g, '');
  if (!isMultiDay(e)) {
    return clean(format(start, withWeekday ? (lang === 'fr' ? 'EEE d MMM' : 'EEE, MMM d') : (lang === 'fr' ? 'd MMM' : 'MMM d'), { locale }));
  }
  const end = new Date(`${lastDay(e)}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (lang === 'fr') {
    return clean(sameMonth
      ? `${format(start, 'd')} – ${format(end, 'd MMM', { locale })}`
      : `${format(start, 'd MMM', { locale })} – ${format(end, 'd MMM', { locale })}`);
  }
  return clean(sameMonth
    ? `${format(start, 'MMM d', { locale })} – ${format(end, 'd')}`
    : `${format(start, 'MMM d', { locale })} – ${format(end, 'MMM d', { locale })}`);
}

/** Statut court d'un événement : en cours, terminé, ou compte à rebours. */
export function eventStatus(e: EventSchedule): { key: string; n?: number; live?: boolean } | null {
  const start = eventStart(e);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  if (diffMs <= 0) {
    return now < eventEnd(e) ? { key: 'status.live', live: true } : { key: 'status.ended' };
  }
  const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const days = Math.round((startDay.getTime() - today.getTime()) / 86400000);
  if (days === 0) {
    const hours = Math.floor(diffMs / HOUR);
    return hours >= 1 ? { key: 'status.inHours', n: hours } : { key: 'status.soon' };
  }
  if (days === 1) return { key: 'status.tomorrow' };
  return { key: 'status.inDays', n: days };
}

/**
 * Sépare la 1re phrase (accroche affichée en grand) du reste de la description.
 * Pas d'accroche si la phrase est trop longue pour un titre.
 */
export function splitLead(text: string): { lead: string | null; rest: string } {
  // « inédit , rater . » → « inédit, rater. » (pas d'espace avant , et . en français)
  const clean = text.trim().replace(/\s+([,.])/g, '$1');
  const m = clean.match(/^(.+?[.!?…])(\s+|$)([\s\S]*)$/);
  const lead = m ? m[1].trim() : clean;
  if (lead.length > 140) return { lead: null, rest: clean };
  return { lead, rest: m ? m[3].trim() : '' };
}
