import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

const ImageLightbox = ({ src, alt, open, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white text-ink hover:bg-stone-100 active:scale-95 transition-colors"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <X size={22} strokeWidth={2.5} />
      </button>
      <img
        src={src}
        alt={alt || ''}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl animate-scale-in"
      />
    </div>
  );
};

export default ImageLightbox;
