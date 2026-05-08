import { useState } from 'react';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

/**
 * Image with Facebook-style shimmer placeholder while loading.
 * Drop-in replacement for <img> — just swap the tag.
 */
const ShimmerImage = ({ src, alt, className = '', onClick, loading = 'lazy' }: ShimmerImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200/70 dark:bg-stone-800/50">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default ShimmerImage;
