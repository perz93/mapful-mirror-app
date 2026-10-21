import { useEffect, useState } from 'react';
import smartcrop from 'smartcrop';

/** Proportions du bandeau photo du cadre sur la carte (≈ 344 × 96) */
export const CARD_ASPECT = 3.6;
const DEFAULT_POSITION = '50% 30%';
const CACHE_PREFIX = 'vibe-focus:';

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
export const toPosition = (x: number, y: number) => `${clamp(x)}% ${clamp(y)}%`;

/** Valeur CSS object-position d'une affiche (cadrage enregistré, sinon un peu au-dessus du centre) */
export const focusPosition = (focus?: string | null) => (focus && /^\d+% \d+%$/.test(focus) ? focus : DEFAULT_POSITION);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Affiches en ligne (Supabase Storage) : lecture des pixels autorisée par CORS
    if (/^https?:/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Trouve automatiquement la partie la plus parlante de l'affiche (titres, visages, contrastes)
 * pour le bandeau du cadre, et la renvoie en object-position (« 50% 12% »).
 */
export async function detectFocus(src: string): Promise<string> {
  const img = await loadImage(src);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const { topCrop: c } = await smartcrop.crop(img, { width: 360, height: 100, minScale: 1 });
  const x = W > c.width ? (c.x / (W - c.width)) * 100 : 50;
  const y = H > c.height ? (c.y / (H - c.height)) * 100 : 50;
  return toPosition(x, y);
}

/**
 * Cadrage à utiliser pour une affiche : celui enregistré par l'organisateur, sinon une détection
 * automatique faite une seule fois sur cet appareil (gardée en cache).
 */
export function useImageFocus(url: string | null | undefined, stored?: string | null): string {
  const cached = () => {
    if (!url) return null;
    try {
      return localStorage.getItem(CACHE_PREFIX + url);
    } catch {
      return null;
    }
  };
  const [auto, setAuto] = useState<string | null>(cached);

  useEffect(() => {
    if (stored || !url) return;
    const hit = cached();
    if (hit) {
      setAuto(hit);
      return;
    }
    setAuto(null);
    let cancelled = false;
    detectFocus(url)
      .then((pos) => {
        if (cancelled) return;
        setAuto(pos);
        try {
          localStorage.setItem(CACHE_PREFIX + url, pos);
        } catch {
          /* stockage indisponible : on recalculera */
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, stored]);

  return focusPosition(stored || auto);
}
