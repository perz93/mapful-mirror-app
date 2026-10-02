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
        <div className="absolute inset-0 skeleton" />
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
