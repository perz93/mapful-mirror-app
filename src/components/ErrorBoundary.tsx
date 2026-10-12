import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

const CHUNK_RELOAD_KEY = 'vibe:chunk-reload';

/**
 * Filet de sécurité : une erreur dans une page affichait un écran blanc.
 * On montre un écran de secours avec « Recharger ». Cas particulier : après
 * un déploiement, un ancien onglet peut réclamer un fichier JS qui n'existe
 * plus → on recharge automatiquement une seule fois.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[VIBE] Erreur non gérée', error, info.componentStack);
    const isChunkError = /Loading chunk|dynamically imported module|Importing a module script failed/i.test(error?.message ?? '');
    if (isChunkError) {
      try {
        if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
          window.location.reload();
        }
      } catch {
        /* stockage indisponible : on laisse l'écran de secours */
      }
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-parchment px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6">
          <p className="eyebrow mb-3 text-stone-500">VIBE</p>
          <h1 className="text-[36px] leading-[0.95] tracking-tighter text-ink">Oups, un souci est survenu</h1>
          <p className="mt-3 text-[15px] text-stone-500">
            Rechargez la page. Si le problème continue, revenez à l'accueil.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="h-12 flex-1 rounded-full bg-lime text-[15px] font-medium text-ink hover:bg-lime-deep transition-colors"
            >
              Recharger
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="h-12 flex-1 rounded-full border border-stone-300 bg-white text-[15px] font-medium text-ink hover:border-ink transition-colors"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
