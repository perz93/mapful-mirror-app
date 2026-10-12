/**
 * Mise à jour de la PWA sans perte de données.
 * Avant : l'app se rechargeait d'elle-même dès qu'une version sortait, même
 * au milieu d'un formulaire. Maintenant on signale la mise à jour et
 * l'utilisateur choisit le moment (bandeau UpdateBanner).
 */
type Listener = (available: boolean) => void;

let available = false;
let apply: (() => Promise<void>) | null = null;
const listeners = new Set<Listener>();

export const pwaUpdate = {
  setAvailable(fn: () => Promise<void>) {
    apply = fn;
    available = true;
    listeners.forEach((l) => l(true));
  },
  isAvailable: () => available,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async apply() {
    if (apply) await apply();
    else window.location.reload();
  },
};
