import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  icon: LucideIcon;
  children: React.ReactNode;
}

/**
 * Titre de section des formulaires : icône dans une pastille parchemin,
 * même traitement que les infos de la page détail d'événement.
 */
const SectionTitle = ({ icon: Icon, children }: SectionTitleProps) => (
  <h2 className="mb-4 flex items-center gap-3 text-[19px] text-ink">
    <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-2xl bg-parchment">
      <Icon size={18} strokeWidth={1.75} className="text-ink" />
    </span>
    {children}
  </h2>
);

export default SectionTitle;
