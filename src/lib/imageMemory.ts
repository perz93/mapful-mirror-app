/**
 * Images déjà affichées pendant cette session : en revenant sur une page, elles
 * s'affichent directement, sans repasser par le reflet crème ni le fondu
 * (ce qui donnait un scintillement à chaque changement de page).
 */
const shown = new Set<string>();

export const wasShown = (src: string | undefined | null) => !!src && shown.has(src);
export const markShown = (src: string | undefined | null) => { if (src) shown.add(src); };
