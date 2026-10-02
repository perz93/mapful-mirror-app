import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Phone, Mail, Tag, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import ImageLightbox from '@/components/ImageLightbox';
import ShimmerImage from '@/components/ShimmerImage';

const categoryLabels: Record<string, Record<string, string>> = {
  location_espaces: { fr: 'Location espaces', en: 'Venue rental' },
  traiteurs: { fr: 'Traiteurs', en: 'Catering' },
  animation_dj: { fr: 'Animation / DJ', en: 'Entertainment / DJ' },
  decoration: { fr: 'Décoration', en: 'Decoration' },
  autre: { fr: 'Autre', en: 'Other' },
};

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
          <div className="mx-4 mt-2">
            <div className="h-72 rounded-3xl skeleton">
            </div>
          </div>
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

  const catLabel = categoryLabels[listing.category]?.[lang] || listing.category;
  const priceLabel = listing.price_type ? (priceTypeLabels[listing.price_type]?.[lang] || listing.price_type) : '';

  return (
    <div className="min-h-screen relative overflow-hidden bg-parchment page-enter">

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-md min-h-screen flex flex-col">
        {/* Hero image */}
        <div className="relative" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {listing.image_url ? (
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative h-72 mx-4 mt-2 rounded-3xl overflow-hidden cursor-zoom-in transition-transform active:scale-[0.99]"
            >
              <ShimmerImage
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

              {/* Category badge */}
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center h-7 px-3 rounded-full bg-lime text-ink text-xs font-medium">
                  {catLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-48 mx-4 mt-2 rounded-3xl bg-white flex flex-col items-center justify-center gap-2">
              <Tag size={40} className="text-stone-300" />
              <span className="px-3 py-1 rounded-full bg-lime/30 text-ink text-xs font-semibold">
                {catLabel}
              </span>
            </div>
          )}

          {/* Top buttons */}
          {/* Décalés à l'intérieur de l'image (16 px des bords), comme sur les événements */}
          <div className="absolute left-8 right-8 flex items-center justify-between" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform"
            >
              <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
            </button>
            <button
              onClick={handleShare}
              className="flex size-10 items-center justify-center rounded-full bg-white text-ink hover:bg-parchment active:scale-95 transition-colors"
            >
              <Share2 size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-5 pb-8 space-y-4 flex-1">
          {/* Title + Price card */}
          <div className="rounded-3xl bg-white p-5">
            <h1 className="text-[28px] leading-none font-medium tracking-tighter text-stone-800 ">
              {listing.title}
            </h1>

            {listing.price !== null && (
              <div className="flex items-baseline gap-2 mt-3">
                <p className="font-display text-[28px] !leading-none tracking-tighter text-ink">
                  {listing.price.toLocaleString()} FCFA
                </p>
                {listing.price_type && listing.price_type !== 'fixed' && (
                  <span className="text-sm text-stone-500">
                    ({priceLabel})
                  </span>
                )}
              </div>
            )}
            {listing.price === null && listing.price_type === 'negotiable' && (
              <p className="text-lg text-ink font-semibold mt-3">{priceLabel}</p>
            )}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="rounded-3xl bg-white p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/30 flex-shrink-0">
                <MapPin size={20} className="text-ink" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-0.5">
                  {lang === 'fr' ? 'Localisation' : 'Location'}
                </p>
                <p className="text-stone-800 font-medium ">
                  {listing.location}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="rounded-3xl bg-white p-5">
              <h2 className="text-lg font-medium tracking-tight text-stone-800  mb-3">
                {t('form.description')}
              </h2>
              <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="rounded-3xl bg-white p-5">
            <h2 className="text-lg font-medium tracking-tight text-stone-800  mb-4">
              {lang === 'fr' ? 'Contacter le vendeur' : 'Contact seller'}
            </h2>

            <div className="space-y-3">
              {listing.contact_phone && (
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="flex items-center justify-center gap-2 w-full h-12 px-5 rounded-full bg-lime text-ink text-[15px] font-medium hover:bg-lime-deep transition-colors active:scale-[0.98]"
                >
                  <Phone size={18} />
                  {lang === 'fr' ? 'Appeler' : 'Call'} — {listing.contact_phone}
                </a>
              )}

              {listing.contact_email && (
                <a
                  href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(listing.title)}`}
                  className="flex items-center justify-center gap-2 w-full h-12 px-5 rounded-full bg-white border border-stone-300 text-ink font-medium text-[15px] hover:border-ink transition-colors hover:bg-white/90 transition-all active:scale-[0.98]"
                >
                  <Mail size={18} className="text-ink" />
                  {lang === 'fr' ? 'Envoyer un email' : 'Send email'}
                </a>
              )}

              {!listing.contact_phone && !listing.contact_email && (
                <p className="text-stone-400 text-center text-sm py-2">
                  {lang === 'fr' ? 'Aucune information de contact' : 'No contact information'}
                </p>
              )}
            </div>
          </div>
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
