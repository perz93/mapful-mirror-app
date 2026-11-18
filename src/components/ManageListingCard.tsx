import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import ShimmerImage from './ShimmerImage';
import { Tables } from '@/integrations/supabase/types';
import { getMarketplaceCategory } from '@/lib/marketplaceCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Listing = Tables<'marketplace_listings'>;

interface ManageListingCardProps {
  listing: Listing;
  onToggle: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

/** Annonce de « Mon compte » : petite photo, catégorie, prix en pastille verte, boutons ronds */
const ManageListingCard = ({ listing, onToggle, onDelete }: ManageListingCardProps) => {
  const { t, lang } = useLanguage();
  const config = getMarketplaceCategory(listing.category);
  const Icon = config.icon;
  const hidden = !listing.is_published;
  const price = listing.price !== null
    ? `${listing.price.toLocaleString('fr-FR')} F${listing.price_type === 'hourly' ? ' / h' : listing.price_type === 'daily' ? ' / jour' : ''}`
    : t('market.negotiable');
  const iconBtn = 'inline-flex size-8 items-center justify-center rounded-full transition-transform active:scale-90';

  return (
    <div className="card-shadow flex items-center gap-3 rounded-[24px] bg-parchment p-2 dark:bg-stone-900/80">
      <Link to={`/listing/${listing.id}`} className="flex min-w-0 flex-1 items-center gap-3 no-press">
        {listing.image_url ? (
          <ShimmerImage src={listing.image_url} alt="" className={`size-[84px] flex-shrink-0 rounded-[18px] ${hidden ? 'grayscale-[.75]' : ''}`} />
        ) : (
          <span className="flex size-[84px] flex-shrink-0 items-center justify-center rounded-[18px] bg-canvas">
            <Icon size={24} strokeWidth={1.5} className="text-ink" />
          </span>
        )}
        <div className={`min-w-0 flex-1 ${hidden ? 'opacity-60' : ''}`}>
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink">
            {lang === 'en' ? config.en : config.fr}
          </p>
          <p className="mt-0.5 truncate font-display text-[16px] leading-tight tracking-tight text-ink dark:text-white">{listing.title}</p>
          <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5">
            <span className="inline-flex h-6 max-w-full items-center rounded-full bg-lime px-2.5 text-[11.5px] font-semibold text-ink tabular">
              <span className="truncate">{price}</span>
            </span>
            {hidden && (
              <span className="inline-flex h-6 items-center rounded-full bg-stone-200 px-2.5 text-[11.5px] font-semibold text-stone-600">
                {t('listing.hidden')}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-shrink-0 flex-col gap-1.5 pr-0.5">
        <Link to={`/edit-listing/${listing.id}`} aria-label={t('event.editBtn')} className={`${iconBtn} bg-lime text-ink`}>
          <Pencil size={14} strokeWidth={2} />
        </Link>
        <button
          onClick={() => onToggle(listing)}
          aria-label={hidden ? t('event.publishBtn') : t('event.unpublishBtn')}
          className={`${iconBtn} bg-canvas text-ink`}
        >
          {hidden ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button aria-label={t('delete')} className={`${iconBtn} bg-canvas text-ink`}>
              <Trash2 size={14} strokeWidth={2} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('account.deleteListingConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{listing.title}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(listing.id)}>{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ManageListingCard;
