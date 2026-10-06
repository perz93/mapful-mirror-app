import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Tag, Share2 } from 'lucide-react';
import ContactFab from '@/components/ContactFab';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/PillToast';
import ImageLightbox from '@/components/ImageLightbox';
import ShimmerImage from '@/components/ShimmerImage';
import { marketplaceCategoryLabel } from '@/lib/marketplaceCategories';
import { splitLead } from '@/lib/eventStatus';
import { useDarkPageBackground } from '@/hooks/useDarkPageBackground';

const priceTypeLabels: Record<string, Record<string, string>> = {
  fixed: { fr: 'Prix fixe', en: 'Fixed price' },
  hourly: { fr: 'Par heure', en: 'Per hour' },
  daily: { fr: 'Par jour', en: 'Per day' },
  negotiable: { fr: 'Négociable', en: 'Negotiable' },
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  useDarkPageBackground(!!listing);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('event.share'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-parchment page-enter">
        <div className="relative z-10 mx-auto max-w-md">
          <div className="h-[52vh] min-h-[340px] max-h-[480px] rounded-b-[32px] skeleton" />
          <div className="px-4 pt-5 space-y-4">
            <div className="rounded-3xl bg-white p-5 space-y-3">
              <div className="h-6 skeleton rounded-lg w-3/4">
              </div>
              <div className="h-8 skeleton rounded-lg w-1/2">
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full skeleton flex-shrink-0">
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 skeleton rounded w-16">
                </div>
                <div className="h-4 skeleton rounded w-2/3">
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 space-y-3">
              <div className="h-5 skeleton rounded w-1/3">
              </div>
              <div className="h-4 skeleton rounded w-full">
              </div>
              <div className="h-4 skeleton rounded w-4/5">
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-parchment page-enter">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-4">
          <Tag size={48} className="text-stone-300" />
          <p className="text-stone-600">{lang === 'fr' ? 'Annonce introuvable' : 'Listing not found'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center h-12 px-6 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98]"
          >
            {lang === 'fr' ? 'Retour au marketplace' : 'Back to marketplace'}
          </button>
        </div>
      </div>
    );
  }

  const catLabel = marketplaceCategoryLabel(listing.category, lang);
  const priceLabel = listing.price_type ? (priceTypeLabels[listing.price_type]?.[lang] || listing.price_type) : '';

  const priceValue = listing.price !== null ? `${listing.price.toLocaleString('fr-FR')} FCFA` : priceLabel || (lang === 'fr' ? 'Sur devis' : 'On quote');
  const priceSub = listing.price !== null && listing.price_type && listing.price_type !== 'fixed' ? priceLabel : (lang === 'fr' ? 'Prix fixe' : 'Fixed price');
  const mapsUrl = listing.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.location}, Abidjan`)}`
    : null;
  const { lead, rest } = listing.description ? splitLead(listing.description) : { lead: null, rest: '' };
  const hasContacts = !!(listing.contact_phone || listing.contact_whatsapp || listing.contact_instagram || listing.contact_facebook || listing.contact_tiktok || listing.contact_twitter || listing.contact_email);
  const roundBtn = 'inline-flex size-12 btn-float items-center justify-center rounded-full active:scale-95 transition-transform';

  return (
    <div className="min-h-screen bg-parchment page-enter">
      <div className="relative mx-auto max-w-md pb-32">
        {/* Affiche : photo plein écran, titre posé dessus (comme les événements) */}
        <div
          onClick={() => listing.image_url && setLightboxOpen(true)}
          className={`relative h-[52vh] min-h-[340px] max-h-[480px] overflow-hidden rounded-b-[32px] bg-white ${listing.image_url ? 'cursor-zoom-in' : ''}`}
        >
          {listing.image_url ? (
            <ShimmerImage src={listing.image_url} alt={listing.title} className="absolute inset-0 w-full h-full" loading="eager" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Tag size={44} className="text-stone-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,15,0.4)_0%,transparent_28%,transparent_45%,rgba(20,20,15,0.88)_100%)]" />

          <div
            className="fixed inset-x-0 z-30 mx-auto flex max-w-md items-center justify-between px-4"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => navigate(-1)} aria-label="Retour" className={`${roundBtn} bg-white text-ink`}>
              <ArrowLeft size={20} strokeWidth={1.75} />
            </button>
            <button onClick={handleShare} aria-label={t('event.share')} className={`${roundBtn} bg-white text-ink`}>
              <Share2 size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="absolute inset-x-5 bottom-6 text-parchment">
            <span className="inline-flex h-7 items-center rounded-full bg-lime px-3 text-xs font-medium text-ink">{catLabel}</span>
            <h1 className="mt-3 text-[38px] leading-[0.98] tracking-tighter text-parchment">{listing.title}</h1>
          </div>
        </div>

        <div className="space-y-6 px-4 pt-5">
          {/* Prix · Lieu */}
          <div className="grid grid-cols-2 gap-2">
            <div className="card-shadow rounded-[20px] bg-white p-3.5">
              <p className="eyebrow text-stone-500">{lang === 'fr' ? 'Prix' : 'Price'}</p>
              <p className="font-display mt-1.5 text-[22px] leading-none tracking-tight text-ink tabular">{priceValue}</p>
              <p className="mt-1 truncate text-xs text-stone-500">{priceSub}</p>
            </div>
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="card-shadow rounded-[20px] bg-white p-3.5 active:scale-[0.99] transition-transform">
                <p className="eyebrow text-stone-500">{lang === 'fr' ? 'Lieu' : 'Location'}</p>
                <p className="font-display mt-1.5 text-[19px] leading-[1.05] tracking-tight text-ink line-clamp-2">{listing.location}</p>
                <p className="mt-1 text-xs font-semibold text-lime-deep">{lang === 'fr' ? 'Voir sur la carte →' : 'View on map →'}</p>
              </a>
            ) : (
              <div className="card-shadow rounded-[20px] bg-white p-3.5">
                <p className="eyebrow text-stone-500">{lang === 'fr' ? 'Catégorie' : 'Category'}</p>
                <p className="font-display mt-1.5 text-[19px] leading-[1.05] tracking-tight text-ink">{catLabel}</p>
              </div>
            )}
          </div>

          {/* À propos : la 1re phrase en accroche */}
          {listing.description && (
            <section>
              <h2 className="eyebrow text-stone-500 mb-3">{lang === 'fr' ? 'À propos' : 'About'}</h2>
              {lead && <p className="font-display text-[26px] leading-[1.08] tracking-[-0.03em] text-ink">{lead}</p>}
              {rest && <p className={`${lead ? 'mt-3' : ''} text-base leading-[1.6] text-ink/75 whitespace-pre-line`}>{rest}</p>}
            </section>
          )}
        </div>
      </div>

      {/* Barre d'action fixe : prix + contact */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="flex h-16 items-center justify-between gap-2 rounded-full bg-ink pl-6 pr-2 shadow-2xl">
          <div className="min-w-0">
            <p className="font-display truncate text-[20px] leading-none tracking-tight text-parchment tabular">{priceValue}</p>
            <p className="mt-1 truncate text-[11px] text-stone-400">{priceSub}</p>
          </div>
          {hasContacts ? (
            <ContactFab
              variant="pill"
              label={t('event.contact')}
              closeLabel={t('close')}
              contactPhone={listing.contact_phone}
              contactWhatsapp={listing.contact_whatsapp}
              contactInstagram={listing.contact_instagram}
              contactFacebook={listing.contact_facebook}
              contactTiktok={listing.contact_tiktok}
              contactTwitter={listing.contact_twitter}
              contactEmail={listing.contact_email}
              emailSubject={listing.title}
            />
          ) : (
            <span className="px-4 text-xs text-stone-400">{lang === 'fr' ? 'Aucun contact' : 'No contact'}</span>
          )}
        </div>
      </div>

      {listing.image_url && (
        <ImageLightbox
          src={listing.image_url}
          alt={listing.title}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ListingDetails;
