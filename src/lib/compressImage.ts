/**
 * Compresse une image avant l'envoi : redimensionnée (côté le plus long ≤ maxSize)
 * et réencodée en WebP (JPEG si le navigateur ne sait pas encoder le WebP).
 * Une photo d'iPhone de 4–8 Mo passe à ~200–400 Ko : envoi et affichage
 * beaucoup plus rapides, stockage réduit. En cas d'échec, le fichier d'origine.
 */
export interface CompressedImage {
  blob: Blob;
  ext: string;
  contentType: string;
}

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    } catch { /* repli ci-dessous */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<CompressedImage> {
  const original: CompressedImage = {
    blob: file,
    ext: (file.name.split('.').pop() || 'jpg').toLowerCase(),
    contentType: file.type || 'image/jpeg',
  };
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return original;

  try {
    const source = await loadBitmap(file);
    const w = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const h = 'naturalHeight' in source ? source.naturalHeight : source.height;
    const scale = Math.min(1, maxSize / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    if ('close' in source) source.close();

    let blob = await toBlob(canvas, 'image/webp', quality);
    let type = 'image/webp';
    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob(canvas, 'image/jpeg', quality);
      type = 'image/jpeg';
    }
    // Garder l'original s'il était déjà plus léger (petite image déjà optimisée)
    if (!blob || blob.size >= file.size) return original;
    return { blob, ext: type === 'image/webp' ? 'webp' : 'jpg', contentType: type };
  } catch {
    return original;
  }
}

/** Fichiers au nom unique : le navigateur et le CDN peuvent les garder un an. */
export const IMMUTABLE_CACHE = '31536000';
