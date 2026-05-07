import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;

updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Force update immediately — no prompt, just reload
    void updateServiceWorker?.(true);
  },
  onOfflineReady() {
    console.log('[PWA] Offline ready');
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    // Check for updates every 30 seconds (was 60)
    window.setInterval(() => {
      void registration.update();
    }, 30_000);
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

// Force reload on visibilitychange if update was waiting
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    navigator.serviceWorker?.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
});

createRoot(document.getElementById("root")!).render(<App />);
