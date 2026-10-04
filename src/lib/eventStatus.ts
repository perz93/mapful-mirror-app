/** Statut court d'un événement : en cours (6 h après le début), terminé, ou compte à rebours. */
export function eventStatus(date: string, time: string): { key: string; n?: number; live?: boolean } | null {
  const start = new Date(`${date}T${time}`);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  if (diffMs <= 0) {
    return -diffMs < 6 * 3600 * 1000 ? { key: 'status.live', live: true } : { key: 'status.ended' };
  }
  const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const days = Math.round((startDay.getTime() - today.getTime()) / 86400000);
  if (days === 0) {
    const hours = Math.floor(diffMs / 3600000);
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
