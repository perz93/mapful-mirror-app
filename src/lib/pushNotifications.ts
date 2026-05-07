import { supabase } from '@/integrations/supabase/client';

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

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    // Register push service worker
    const registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    // Save to Supabase
    const subJson = subscription.toJSON();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('push_subscriptions').upsert(
      {
        user_id: user?.id || null,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh!,
        auth: subJson.keys!.auth!,
      },
      { onConflict: 'endpoint' }
    );

    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // Remove from Supabase
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);

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
