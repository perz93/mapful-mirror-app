import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | null | undefined;
  alt: string;
  width: number;
  height?: number;
  quality?: number;
  fallback?: string;
  /** When true, eagerly load (use for above-the-fold hero images). */
  priority?: boolean;
  containerClassName?: string;
}

/**
 * Image component with:
 *  - Supabase on-the-fly resizing (saves bandwidth)
 *  - Native lazy loading + async decoding
 *  - Skeleton + fade-in on load (perceived speed)
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  quality,
  fallback,
  priority = false,
  className,
  containerClassName,
  ...rest
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const finalSrc = errored || !src
    ? fallback || ""
    : getOptimizedImageUrl(src, { width, height, quality });

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
