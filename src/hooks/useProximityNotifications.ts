import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDistanceKm } from '@/hooks/useNearbyEvents';
import { sendLocalNotification } from '@/lib/pushNotifications';

const PROXIMITY_RADIUS_KM = 5; // 5 km radius
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // Check every 15 minutes
const NOTIFIED_KEY = 'proximity_notified_events';

function getNotifiedEvents(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markNotified(eventId: string) {
  const notified = getNotifiedEvents();
  notified[eventId] = Date.now();
  // Clean entries older than 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const key of Object.keys(notified)) {
    if (notified[key] < cutoff) delete notified[key];
  }
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
}

function wasNotified(eventId: string): boolean {
  const notified = getNotifiedEvents();
  return !!notified[eventId];
}

async function getUserPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export function useProximityNotifications() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (Notification.permission !== 'granted') return;

    const checkProximity = async () => {
      try {
        const position = await getUserPosition();
        if (!position) return;

        // Get today's and future published events
        const today = new Date().toISOString().split('T')[0];
        const { data: events } = await supabase
          .from('events')
          .select('id, title, venue, date, time, latitude, longitude, image_url')
          .eq('is_published', true)
          .gte('date', today);

        if (!events || events.length === 0) return;

        // Filter events within radius that haven't been notified yet
        for (const event of events) {
          if (wasNotified(event.id)) continue;

          const distance = getDistanceKm(
            position.lat, position.lng,
            event.latitude, event.longitude
          );

          if (distance <= PROXIMITY_RADIUS_KM) {
            const distText = distance < 1
              ? `${Math.round(distance * 1000)}m`
              : `${distance.toFixed(1)}km`;

            const notifTitle = lang === 'fr'
              ? `${event.title} est près de toi !`
              : `${event.title} is near you!`;
            const notifBody = lang === 'fr'
              ? `À ${distText} — ${event.venue}`
              : `${distText} away — ${event.venue}`;

            await sendLocalNotification(notifTitle, notifBody, `/event/${event.id}`);

            markNotified(event.id);

            // Also log server-side if possible
            await supabase.from('notification_log').upsert(
              {
                user_id: user.id,
                event_id: event.id,
                notification_type: 'proximity',
              },
              { onConflict: 'user_id,event_id,notification_type' }
            );
          }
        }
      } catch (err) {
        console.error('Proximity check failed:', err);
      }
    };

    // Initial check after 30s
    const timeout = setTimeout(checkProximity, 30000);

    // Then every 15 minutes
    intervalRef.current = setInterval(checkProximity, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);
}
