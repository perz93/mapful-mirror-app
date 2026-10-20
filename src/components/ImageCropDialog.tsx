import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Check, X } from 'lucide-react';

/** Formats proposés ; « original » garde les proportions de la photo */
const FORMATS = [
  { key: 'original', label: 'Original' },
  { key: '4:5', label: 'Affiche 4:5', aspect: 4 / 5 },
  { key: '1:1', label: 'Carré', aspect: 1 },
  { key: '16:9', label: 'Paysage 16:9', aspect: 16 / 9 },
] as const;

interface ImageCropDialogProps {
  /** URL (objectURL) de la photo choisie ; null = fermé */
  src: string | null;
  fileName?: string;
  onCancel: () => void;
  onDone: (file: File, previewUrl: string) => void;
}

/** Découpe la zone choisie dans un canvas (taille max 2400 px, la compression se fait ensuite) */
async function cropToFile(src: string, area: Area, fileName: string): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    // Affiche déjà en ligne (Supabase Storage) : nécessaire pour pouvoir la redécouper
    const remote = /^https?:/.test(src);
    if (remote) i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    // Paramètre en plus : évite de réutiliser une copie en cache chargée sans CORS
    i.src = remote ? `${src}${src.includes('?') ? '&' : '?'}crop=1` : src;
  });
  const scale = Math.min(1, 2400 / Math.max(area.width, area.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('crop'))), 'image/jpeg', 0.92),
  );
  return new File([blob], fileName.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

/** Recadrage plein écran de la photo avant publication (pincer / glisser pour ajuster) */
const ImageCropDialog = ({ src, fileName = 'photo.jpg', onCancel, onDone }: ImageCropDialogProps) => {
  const [format, setFormat] = useState<(typeof FORMATS)[number]['key']>('original');
  const [naturalAspect, setNaturalAspect] = useState(4 / 5);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Nouvelle photo : on repart de zéro
  useEffect(() => {
    if (!src) return;
    setFormat('original');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    const i = new Image();
    i.onload = () => setNaturalAspect(i.naturalWidth / i.naturalHeight || 1);
    i.src = src;
  }, [src]);

  // Barre d'état noire pendant le recadrage (comme les autres fenêtres)
  useEffect(() => {
    if (!src) return;
    document.documentElement.classList.add('modal-open');
    return () => document.documentElement.classList.remove('modal-open');
  }, [src]);

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), []);
  if (!src) return null;

  const aspect = FORMATS.find((f) => f.key === format && 'aspect' in f) as { aspect: number } | undefined;

  const done = async () => {
    if (!area || saving) return;
    setSaving(true);
    try {
      const file = await cropToFile(src, area, fileName);
      onDone(file, URL.createObjectURL(file));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Recadrer la photo">
      <div
        className="flex items-center justify-between px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <button type="button" onClick={onCancel} aria-label="Annuler" className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white active:scale-95">
          <X size={20} strokeWidth={1.75} />
        </button>
        <p className="text-[15px] font-medium text-white">Recadrer la photo</p>
        <button
          type="button"
          onClick={done}
          disabled={!area || saving}
          aria-label="Valider"
          className="flex size-11 items-center justify-center rounded-full bg-lime text-ink active:scale-95 disabled:opacity-50"
        >
          <Check size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect?.aspect ?? naturalAspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
          showGrid
          style={{ cropAreaStyle: { border: '2px solid #a6e22e', color: 'rgba(0,0,0,0.6)' } }}
        />
      </div>

      <div className="space-y-4 px-4 pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="w-full accent-[#a6e22e]"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFormat(f.key)}
              className={`h-9 flex-shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors ${
                format === f.key ? 'bg-lime text-ink' : 'bg-white/10 text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-white/50">Pince pour zoomer, glisse pour déplacer la photo</p>
      </div>
    </div>
  );
};

export default ImageCropDialog;
