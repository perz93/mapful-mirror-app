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
 * fade-in on load, and a lightweight blur placeholder.
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

  if (asBackground) {
    return (
      <div
        ref={ref}
        className={`${className} transition-opacity duration-500 ${inView ? 'opacity-100' : 'opacity-0'}`}
        style={{
          ...style,
          backgroundImage: inView ? `url('${src}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  const srcSet = getSrcSet(src);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style} onClick={onClick}>
      {inView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 800px"
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse" />
      )}
      {children}
    </div>
  );
};

export default OptimizedImage;
