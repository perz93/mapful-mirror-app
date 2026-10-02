import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from '@/integrations/supabase/client';

// Tables / fonctions push absentes des types générés
const supabase = typedSupabase as unknown as SupabaseClient;

const VAPID_PUBLIC_KEY = 'BJ4tt17HAf2lfvIdXqHoBH0kjDqQh-g10W2p4PMb2IxEsxrjhf-zvIItAWioxH-Bewqa_b87Mw50JPd2LHuQLf4';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function isPushSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPermissionState(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Enregistre (ou rattache au compte connecté) l'abonnement de cet appareil.
async function saveSubscription(subscription: PushSubscription) {
  const subJson = subscription.toJSON();
  const endpoint = subJson.endpoint!;
  const p256dh = subJson.keys!.p256dh!;
  const auth = subJson.keys!.auth!;

  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
  });
  if (!error) return;

  // Repli si la migration de sécurité n'est pas encore appliquée
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from('push_subscriptions').upsert(
    { user_id: session?.user?.id || null, endpoint, p256dh, auth },
    { onConflict: 'endpoint' }
  );
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    // La permission doit être demandée tout de suite après le tap :
    // sur iOS, attendre le service worker avant fait perdre le « geste
    // utilisateur » et la demande est ignorée.
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Use the existing PWA service worker (push handlers are merged into it)
    const registration = await navigator.serviceWorker.ready;

    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      }));

    await saveSubscription(subscription);
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

// À la connexion / déconnexion : rattache l'abonnement existant au bon compte
// pour que les rappels personnels arrivent sur cet appareil.
export async function syncPushSubscription(): Promise<void> {
  try {
    if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await saveSubscription(subscription);
  } catch {
    // silencieux : nouvel essai à la prochaine ouverture
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // Remove from Supabase
    const { error } = await supabase.rpc('remove_push_subscription', {
      p_endpoint: subscription.endpoint,
    });
    if (error) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
    }

    // Unsubscribe
    await subscription.unsubscribe();
    return true;
  } catch (err) {
    console.error('Push unsubscribe failed:', err);
    return false;
  }
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

// Send a local notification (for in-app testing / fallback)
export async function sendLocalNotification(title: string, body: string, url?: string) {
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.getRegistration('/');
  if (!registration) return;

  registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'local-' + Date.now(),
    data: { url: url || '/' },
  } as NotificationOptions);
}
