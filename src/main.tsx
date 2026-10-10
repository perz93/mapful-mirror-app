import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { pwaUpdate } from "./lib/pwaUpdate";
import "./index.css";

const updateServiceWorker: (reloadPage?: boolean) => Promise<void> = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Nouvelle version prête : on la propose (bandeau) au lieu de recharger
    // de force, ce qui faisait perdre les formulaires en cours.
    pwaUpdate.setAvailable(() => updateServiceWorker?.(true) ?? Promise.resolve());
  },
  onOfflineReady() {
    console.log('[PWA] Offline ready');
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    // Vérifie les mises à jour toutes les 15 min et au retour sur l'app
    window.setInterval(() => {
      void registration.update();
    }, 15 * 60_000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void registration.update();
    });
  },
});

// Clear old caches on startup — purge stale API data and old SW caches
if ('caches' in window) {
  caches.keys().then((names) => {
    for (const name of names) {
      // Clean up old workbox precache temps
      if (name.startsWith('workbox-precache') && name.includes('-temp')) {
        caches.delete(name);
      }
      // Purge old supabase cache (ensures fresh data from new DB)
      if (name === 'supabase-api') {
        caches.delete(name);
      }
    }
  });
}

// Unregister any rogue push-sw.js that was previously registered separately
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      if (reg.active?.scriptURL?.includes('push-sw.js')) {
        reg.unregister();
      }
    }
  });
}


// Portrait verrouillé quand le navigateur le permet (Android, app installée).
// iOS ne le permet pas aux web apps : le message « Tourne ton téléphone » prend le relais.
try {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  orientation?.lock?.('portrait').catch(() => {});
} catch { /* non pris en charge */ }

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
