import { useCallback, useEffect, useRef, useState } from 'react';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  /** object-position : partie de l'affiche à montrer quand elle est rognée */
  position?: string;
}

/**
 * Image avec le chargement crème du site (.skeleton).
 *
 * Le bloc crème est posé SOUS l'image : tant qu'elle n'est pas peinte on voit le
 * crème (jamais de blanc), et dès qu'elle l'est elle le recouvre d'un coup, sans
 * fondu. Le bloc est retiré après le décodage (sur iOS, `load` arrive avant la peinture).
 */
const ShimmerImage = ({ src, alt, className = '', onClick, loading = 'lazy', position }: ShimmerImageProps) => {
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
      {!ready && <div aria-hidden className="absolute inset-0 skeleton pointer-events-none" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={markReady}
        onError={() => setReady(true)}
        style={position ? { objectPosition: position } : undefined}
        className="relative w-full h-full object-cover"
      />
    </div>
  );
};

export default ShimmerImage;
