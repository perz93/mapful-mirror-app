/** Types de places d'un événement (Standard, VIP, Table…), stockés dans events.ticket_types. */
export type TicketType = { name: string; price: number };
/** Saisie dans le formulaire (prix en texte tant qu'on tape) */
export type TicketDraft = { name: string; price: string };

const toNumber = (v: string) => {
  const n = Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** Lit la colonne jsonb de façon sûre (null, ancien format, saisie invalide → []) */
export function ticketTypesOf(e: { ticket_types?: unknown }): TicketType[] {
  if (!Array.isArray(e.ticket_types)) return [];
  return e.ticket_types
    .filter((t): t is TicketType => !!t && typeof t === 'object' && typeof (t as TicketType).name === 'string')
    .map((t) => ({ name: t.name.trim(), price: Math.max(0, Number(t.price) || 0) }))
    .filter((t) => t.name);
}

export const draftsFrom = (types: TicketType[]): TicketDraft[] =>
  types.map((t) => ({ name: t.name, price: t.price ? String(t.price) : '' }));

/**
 * Champs à enregistrer : un seul prix, ou plusieurs places.
 * Avec plusieurs places, `price` garde le moins cher (filtres, listes) et `is_paid` dit si une place est payante.
 */
export function ticketPayload(singlePrice: string, drafts: TicketDraft[] | null) {
  const types = (drafts ?? [])
    .map((d) => ({ name: d.name.trim(), price: toNumber(d.price) }))
    .filter((d) => d.name);
  if (drafts && types.length > 0) {
    const prices = types.map((t) => t.price);
    return { ticket_types: types, price: Math.min(...prices), is_paid: Math.max(...prices) > 0 };
  }
  const price = singlePrice.trim() ? toNumber(singlePrice) : null;
  return { ticket_types: null, price, is_paid: !!price && price > 0 };
}

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

/** Texte de prix court : « 5 000 FCFA », « Dès 5 000 FCFA », « Gratuit » */
export function eventPriceText(
  e: { price?: number | null; is_paid?: boolean | null; ticket_types?: unknown },
  lang: string,
): string {
  const fr = lang === 'fr';
  const types = ticketTypesOf(e);
  if (types.length > 1) {
    const paid = types.map((t) => t.price).filter((p) => p > 0);
    if (paid.length === 0) return fr ? 'Gratuit' : 'Free';
    const min = Math.min(...types.map((t) => t.price));
    return min === 0 ? (fr ? `Gratuit à ${fcfa(Math.max(...paid))}` : `Free to ${fcfa(Math.max(...paid))}`) : `${fr ? 'Dès' : 'From'} ${fcfa(min)}`;
  }
  if (types.length === 1) return types[0].price > 0 ? fcfa(types[0].price) : fr ? 'Gratuit' : 'Free';
  return e.is_paid && e.price ? fcfa(Number(e.price)) : fr ? 'Gratuit' : 'Free';
}
