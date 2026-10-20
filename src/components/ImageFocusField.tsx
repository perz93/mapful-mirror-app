import { useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Check, Crosshair, Loader2, X } from 'lucide-react';
import { CARD_ASPECT, detectFocus, focusPosition, toPosition } from '@/lib/imageFocus';

interface ImageFocusFieldProps {
  /** Aperçu de l'affiche (objectURL ou URL en ligne) */
  src: string;
  focus: string | null;
  onFocusChange: (focus: string) => void;
  /** Détecter automatiquement si aucun cadrage n'est encore choisi */
  autoDetect?: boolean;
}

/**
 * « Aperçu sur la carte » : l'affiche entière est gardée, on choisit seulement la partie visible
 * dans le bandeau du cadre. Le cadrage est trouvé automatiquement, et ajustable en glissant.
 */
const ImageFocusField = ({ src, focus, onFocusChange, autoDetect = true }: ImageFocusFieldProps) => {
  const [detecting, setDetecting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoDetect || focus) return;
    let cancelled = false;
    setDetecting(true);
    detectFocus(src)
      .then((pos) => !cancelled && onFocusChange(pos))
      .catch(() => {})
      .finally(() => !cancelled && setDetecting(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-600">Aperçu sur la carte</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[12.5px] font-medium text-parchment active:scale-95"
        >
          <Crosshair size={14} strokeWidth={1.75} /> Ajuster
        </button>
      </div>
      <div className="relative h-[96px] overflow-hidden rounded-[18px] bg-[#ebe9dd]">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focusPosition(focus) }} />
        {detecting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-white/60 text-[12.5px] font-medium text-ink">
            <Loader2 size={14} className="animate-spin" /> Cadrage automatique…
          </span>
        )}
      </div>
      <p className="text-xs text-stone-500">
        L'affiche entière reste visible dans les détails. Ici, on choisit la partie montrée sur la carte : elle est trouvée automatiquement, touche « Ajuster » pour la changer.
      </p>
      {open && <FocusDialog src={src} focus={focus} onCancel={() => setOpen(false)} onDone={(f) => { onFocusChange(f); setOpen(false); }} />}
    </div>
  );
};

/** Plein écran : on fait glisser l'affiche sous le bandeau vert */
const FocusDialog = ({ src, focus, onCancel, onDone }: { src: string; focus: string | null; onCancel: () => void; onDone: (f: string) => void }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [area, setArea] = useState<Area | null>(null);
  const [x0, y0] = focusPosition(focus).split(' ').map((v) => parseFloat(v));

  useEffect(() => {
    document.documentElement.classList.add('modal-open');
    return () => document.documentElement.classList.remove('modal-open');
  }, []);

  const position = area
    ? toPosition(area.width < 100 ? (area.x / (100 - area.width)) * 100 : 50, area.height < 100 ? (area.y / (100 - area.height)) * 100 : 50)
    : focusPosition(focus);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Ajuster l'aperçu">
      <div className="flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button type="button" onClick={onCancel} aria-label="Annuler" className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:scale-95">
          <X size={20} strokeWidth={1.75} />
        </button>
        <p className="text-[15px] font-medium text-white">Partie visible sur la carte</p>
        <button type="button" onClick={() => onDone(position)} aria-label="Valider" className="flex size-11 items-center justify-center rounded-full bg-lime text-ink active:scale-95">
          <Check size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={1}
          minZoom={1}
          maxZoom={1}
          zoomWithScroll={false}
          aspect={CARD_ASPECT}
          objectFit="contain"
          onCropChange={setCrop}
          onCropComplete={(pct) => setArea(pct)}
          onMediaLoaded={(m) => {
            // Place le bandeau sur le cadrage actuel (ou automatique)
            const ratio = m.naturalWidth / m.naturalHeight;
            const hPct = Math.min(100, (ratio / CARD_ASPECT) * 100);
            const wPct = Math.min(100, (CARD_ASPECT / ratio) * 100);
            setCrop({
              x: ((50 - x0) / 100) * (100 - wPct) * (m.width / 100),
              y: ((50 - y0) / 100) * (100 - hPct) * (m.height / 100),
            });
          }}
          showGrid={false}
          style={{ cropAreaStyle: { border: '2px solid #a6e22e', color: 'rgba(0,0,0,0.65)' } }}
        />
      </div>
      <div className="space-y-2 px-4 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <div className="relative h-[96px] overflow-hidden rounded-[18px] bg-[#ebe9dd]">
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
        </div>
        <p className="text-center text-xs text-white/50">Fais glisser l'affiche : la partie dans le cadre vert s'affiche sur la carte</p>
      </div>
    </div>
  );
};

export default ImageFocusField;
