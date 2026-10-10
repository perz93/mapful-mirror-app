import { toast as sonner } from 'sonner';
import { Check, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export type PillKind = 'success' | 'error' | 'info';

interface PillProps {
  kind: PillKind;
  message: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void; loading?: boolean };
  onClose?: () => void;
}

const ICON_STYLES: Record<PillKind, string> = {
  success: 'bg-lime text-ink',
  error: 'bg-[#ff6b4a] text-white',
  info: 'bg-parchment text-ink',
};

const DEFAULT_ICONS: Record<PillKind, ReactNode> = {
  success: <Check size={15} strokeWidth={3} />,
  error: <span className="text-[15px] font-bold leading-none">!</span>,
  info: <Info size={15} strokeWidth={2.4} />,
};

/** Notification « pilule » noire (style Dynamic Island) utilisée dans toute l'app. */
export const Pill = ({ kind, message, description, icon, action, onClose }: PillProps) => (
  <div
    role={kind === 'error' ? 'alert' : 'status'}
    className={`pointer-events-auto mx-auto flex w-fit max-w-[calc(100vw-24px)] items-center gap-2.5 bg-black py-1.5 pl-1.5 text-parchment shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${
      description ? 'rounded-[22px]' : 'rounded-full'
    } ${action || onClose ? 'pr-1.5' : 'pr-4'}`}
  >
    <span className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full ${ICON_STYLES[kind]}`}>
      {icon ?? DEFAULT_ICONS[kind]}
    </span>
    <span className="min-w-0 py-0.5">
      <span className="block text-[13.5px] font-medium leading-snug">{message}</span>
      {description && <span className="block text-[12px] leading-snug text-parchment/60">{description}</span>}
    </span>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        disabled={action.loading}
        className="ml-1 inline-flex h-8 flex-shrink-0 items-center rounded-full bg-lime px-3.5 text-[13px] font-semibold text-ink active:scale-95 transition-transform disabled:opacity-60"
      >
        {action.label}
      </button>
    )}
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="flex size-8 flex-shrink-0 items-center justify-center rounded-full text-parchment/50 hover:text-parchment"
      >
        ✕
      </button>
    )}
  </div>
);

interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const show = (kind: PillKind) => (message: ReactNode, opts: ToastOptions = {}) =>
  sonner.custom(
    (id) => (
      <Pill
        kind={kind}
        message={message}
        description={opts.description}
        action={opts.action && { label: opts.action.label, onClick: () => { opts.action!.onClick(); sonner.dismiss(id); } }}
      />
    ),
    { duration: opts.duration ?? (kind === 'error' ? 4500 : 3000) },
  );

/** Même API que sonner (toast.success / error / info), rendu en pilule. */
export const toast = Object.assign(show('info'), {
  success: show('success'),
  error: show('error'),
  info: show('info'),
  message: show('info'),
  dismiss: sonner.dismiss,
});
