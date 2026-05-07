import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDistanceKm } from '@/hooks/useNearbyEvents';

const BADGE_INTERVAL_MS = 10 * 60 * 1000; // Update every 10 minutes
const NEARBY_RADIUS_KM = 10;

async function getUserPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
}

async function updateBadge() {
  // Check if Badge API is supported
  if (!('setAppBadge' in navigator)) return;

  try {
    const position = await getUserPosition();
    const today = new Date().toISOString().split('T')[0];

    const { data: events } = await supabase
      .from('events')
      .select('id, latitude, longitude, date')
      .eq('is_published', true)
      .gte('date', today);

    if (!events || events.length === 0) {
      await (navigator as any).clearAppBadge();
      return;
    }

    let nearbyCount: number;

    if (position) {
      // Count events within radius
      nearbyCount = events.filter((e) =>
        getDistanceKm(position.lat, position.lng, e.latitude, e.longitude) <= NEARBY_RADIUS_KM
      ).length;
    } else {
      // No position: show total upcoming events count
      nearbyCount = events.length;
    }

    if (nearbyCount > 0) {
      await (navigator as any).setAppBadge(nearbyCount);
    } else {
      await (navigator as any).clearAppBadge();
    }
  } catch (err) {
    console.error('Badge update failed:', err);
  }
}

export function useBadgeCount() {
  useEffect(() => {
    // Initial update after 5s
    const timeout = setTimeout(updateBadge, 5000);

    // Then every 10 minutes
    const interval = setInterval(updateBadge, BADGE_INTERVAL_MS);

    // Also update when app becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateBadge();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}
