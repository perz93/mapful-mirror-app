import { useState, useEffect, useCallback, useRef } from 'react';

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
 * - Calls getCurrentPosition on mount
 * - Exposes a `request()` for manual retry (user gesture)
 * - Stores last known position in sessionStorage for fast restore
 */
export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoState | null>(() => {
    // Restore last known position from sessionStorage for instant display
    try {
      const saved = sessionStorage.getItem('user_geo');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    const state: GeoState = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
    setPosition(state);
    setError(null);
    setLoading(false);
    try {
      sessionStorage.setItem('user_geo', JSON.stringify(state));
    } catch {}
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setLoading(false);
    if (err.code === 1) {
      setError('denied');
    } else if (err.code === 2) {
      setError('unavailable');
    } else {
      setError('timeout');
    }
  }, []);

  // Manual request — call this from a button tap (user gesture)
  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('unsupported');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  }, [onSuccess, onError]);

  // Auto-request on mount + watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('unsupported');
      return;
    }

    // Initial request
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });

    // Watch for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      () => {}, // watchPosition errors are non-critical
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onSuccess, onError]);

  return { position, error, loading, request };
}
