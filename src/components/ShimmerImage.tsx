import { useCallback, useEffect, useRef, useState } from 'react';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

/**
 * Image avec le chargement crème du site (.skeleton) tant qu'elle n'est pas prête.
 *
 * Le bloc crème reste affiché jusqu'au DÉCODAGE de l'image, pas seulement jusqu'à
 * l'événement `load` : sur iOS, `load` arrive avant que l'image soit peinte, ce qui
 * laissait apparaître le fond blanc de la carte. Il disparaît ensuite en fondu.
 */
const ShimmerImage = ({ src, alt, className = '', onClick, loading = 'lazy' }: ShimmerImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  const markReady = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const done = () => setReady(true);
    if (typeof img.decode === 'function') img.decode().then(done, done);
    else done();
  }, []);

  // Image déjà en cache : `load` a pu se produire avant le montage de React.
  useEffect(() => {
    setReady(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) markReady();
  }, [src, markReady]);

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={markReady}
        onError={() => setReady(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 skeleton pointer-events-none transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default ShimmerImage;
