/**
 * Image optimization helpers for Supabase Storage.
 *
 * Supabase Storage supports on-the-fly image transformations via the
 * `/render/image/public/` endpoint with `width`, `height`, `quality`, and
 * `resize` query params. We rewrite the public object URL to that endpoint
 * so we serve right-sized, compressed images instead of the originals.
 *
 * For non-Supabase URLs (e.g. Unsplash), we leave them untouched (Unsplash
 * already supports its own `?w=&q=` params and most callers already include them).
 */

type Resize = "cover" | "contain" | "fill";

interface OptimizeOptions {
  width: number;
  height?: number;
  quality?: number;
  resize?: Resize;
}

/**
 * Returns an optimized URL for a Supabase Storage public image.
 * Falls back to the original URL if it isn't a Supabase Storage URL or is empty.
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  { width, height, quality = 70, resize = "cover" }: OptimizeOptions
): string => {
  if (!url) return "";

  // Supabase public object URLs look like:
  //   https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // The transformation endpoint is:
  //   https://<ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=...
  if (url.includes("/storage/v1/object/public/")) {
    const transformed = url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    );
    const params = new URLSearchParams();
    params.set("width", String(width));
    if (height) params.set("height", String(height));
    params.set("quality", String(quality));
    params.set("resize", resize);
    return `${transformed}?${params.toString()}`;
  }

  return url;
};

/** Common preset sizes used across the app. */
export const imagePresets = {
  thumbnail: { width: 160, quality: 65 },
  listCard: { width: 400, quality: 70 },
  popup: { width: 480, quality: 72 },
  detailHero: { width: 800, quality: 78 },
  fullscreen: { width: 1600, quality: 82 },
} as const;
