import { useState, useEffect, useCallback } from 'react';

interface GeoState {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface UseGeolocationReturn {
  position: GeoState | null;
  error: string | null;
  loading: boolean;
  request: () => void;
}

/**
 * Simple geolocation hook.
 * - Single getCurrentPosition on mount
 * - Exposes request() for manual retry (user gesture → triggers iOS permission prompt)
 * - Caches position in sessionStorage
 * - No watchPosition (causes issues on iOS PWA standalone)
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoState | null>(() => {
    try {
      const saved = sessionStorage.getItem('user_geo');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const state: GeoState = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
    setPosition(state);
    setError(null);
    setLoading(false);
    try { sessionStorage.setItem('user_geo', JSON.stringify(state)); } catch {}
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setLoading(false);
    if (err.code === 1) setError('denied');
    else if (err.code === 2) setError('unavailable');
    else setError('timeout');
  }, []);

  // Manual request — call from a button tap (preserves user gesture for iOS)
  const request = useCallback(() => {
    if (!navigator.geolocation) { setError('unsupported'); return; }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  // One-time request on mount
  useEffect(() => {
    if (!navigator.geolocation) { setError('unsupported'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, [handleSuccess, handleError]);

  return { position, error, loading, request };
}
