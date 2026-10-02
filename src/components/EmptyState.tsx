import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

/**
 * État vide commun à tout le site : carte blanche, icône en pastille parchemin,
 * texte aligné à gauche, action lime optionnelle.
 */
const EmptyState = ({ icon: Icon, title, hint, action }: EmptyStateProps) => (
  <div className="rounded-3xl bg-white dark:bg-stone-900 p-6">
    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-parchment dark:bg-stone-800">
      <Icon size={18} strokeWidth={1.75} className="text-ink dark:text-white" />
    </span>
    <p className="font-medium text-ink dark:text-white">{title}</p>
    {hint && <p className="mt-1 text-sm text-stone-500">{hint}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
