import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** Use as CSS background-image instead of <img> tag */
  asBackground?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Adds srcset for Unsplash/Supabase images, lazy loading,
 * a cream placeholder until decoded, then the image appears at once (no fade).
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  asBackground = false,
  children,
  onClick,
  style,
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // IntersectionObserver for true lazy loading (works for bg images too)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Build responsive srcset for Unsplash URLs
  const getSrcSet = (url: string) => {
    if (!url.includes('unsplash.com')) return undefined;
    const base = url.split('?')[0];
    return `${base}?w=320&q=75&fm=webp 320w, ${base}?w=640&q=75&fm=webp 640w, ${base}?w=800&q=75&fm=webp 800w`;
  };

  const optimizedSrc = inView ? src : '';

  // Mode « fond » : on précharge et décode l'image, le bloc crème reste jusque-là.
  useEffect(() => {
    if (!asBackground || !inView || !src) return;
    let cancelled = false;
    const img = new Image();
    img.src = src;
    const done = () => { if (!cancelled) setLoaded(true); };
    img.decode().then(done, done);
    return () => { cancelled = true; };
  }, [asBackground, inView, src]);

  // Mode <img> : attendre le décodage (sur iOS `load` arrive avant la peinture).
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const done = () => setLoaded(true);
    e.currentTarget.decode().then(done, done);
  };

  if (asBackground) {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        style={{
          ...style,
          backgroundImage: loaded ? `url('${src}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={onClick}
      >
        {!loaded && <div aria-hidden className="absolute inset-0 skeleton pointer-events-none" />}
        {children}
      </div>
    );
  }

  const srcSet = getSrcSet(src);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style} onClick={onClick}>
      {/* Bloc crème SOUS l'image : jamais de blanc, et l'image le recouvre d'un coup, sans fondu */}
      {!loaded && <div aria-hidden className="absolute inset-0 skeleton pointer-events-none" />}
      {inView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 800px"
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleImgLoad}
          onError={() => setLoaded(true)}
          className="relative w-full h-full object-cover"
        />
      )}
      {children}
    </div>
  );
};

export default OptimizedImage;
