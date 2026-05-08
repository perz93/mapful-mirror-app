import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Phone, Mail, Tag, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import ImageLightbox from '@/components/ImageLightbox';

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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center animate-fade-in animate-zoom-smooth">
        <div className="w-8 h-8 border-3 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 gap-4 animate-fade-in animate-zoom-smooth">
        <Tag size={48} className="text-stone-300" />
        <p className="text-stone-500">{lang === 'fr' ? 'Annonce introuvable' : 'Listing not found'}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-6 py-3 rounded-full bg-[#ee9d2b] text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95"
        >
          {lang === 'fr' ? 'Retour au marketplace' : 'Back to marketplace'}
        </button>
      </div>
    );
  }

  const catLabel = categoryLabels[listing.category]?.[lang] || listing.category;
  const priceLabel = listing.price_type ? (priceTypeLabels[listing.price_type]?.[lang] || listing.price_type) : '';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 animate-fade-in animate-zoom-smooth">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">

        {/* Hero image */}
        <div className="relative" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {listing.image_url ? (
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative h-80 cursor-zoom-in transition-transform active:scale-[0.99]"
            >
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

              {/* Title on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold mb-2">
                  {catLabel}
                </span>
                <h1 className="text-2xl font-bold text-white leading-tight">{listing.title}</h1>
              </div>
            </div>
          ) : (
            <div className="h-52 bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center gap-3">
              <Tag size={40} className="text-stone-300 dark:text-stone-600" />
              <span className="px-3 py-1 rounded-full bg-[#ee9d2b]/10 text-[#ee9d2b] text-xs font-semibold">
                {catLabel}
              </span>
            </div>
          )}

          {/* Top buttons */}
          <div className="absolute left-4 right-4 flex items-center justify-between" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-5 pb-8 space-y-5 flex-1">

          {/* Price */}
          {(listing.price !== null || listing.price_type === 'negotiable') && (
            <div className="flex items-baseline gap-2">
              {listing.price !== null ? (
                <>
                  <p className="text-3xl font-bold text-stone-900 dark:text-white">
                    {listing.price.toLocaleString()} FCFA
                  </p>
                  {listing.price_type && listing.price_type !== 'fixed' && (
                    <span className="text-sm text-stone-500">({priceLabel})</span>
                  )}
                </>
              ) : (
                <p className="text-xl font-semibold text-[#ee9d2b]">{priceLabel}</p>
              )}
            </div>
          )}

          {/* Title (if no image, show here) */}
          {!listing.image_url && (
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{listing.title}</h1>
          )}

          {/* Location */}
          {listing.location && (
            <div className="flex items-center gap-3 py-3 border-b border-stone-200/60 dark:border-stone-800/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee9d2b]/10 flex-shrink-0">
                <MapPin size={16} className="text-[#ee9d2b]" />
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-sm font-medium">{listing.location}</p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                {t('form.description')}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line text-[15px]">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="pt-2 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {lang === 'fr' ? 'Contact' : 'Contact'}
            </h2>

            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-[#ee9d2b] text-white font-semibold text-sm shadow-lg shadow-[#ee9d2b]/20 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <Phone size={18} />
                {lang === 'fr' ? 'Appeler' : 'Call'} — {listing.contact_phone}
              </a>
            )}

            {listing.contact_email && (
              <a
                href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(listing.title)}`}
                className="flex items-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-[0.98]"
              >
                <Mail size={18} className="text-[#ee9d2b]" />
                {lang === 'fr' ? 'Envoyer un email' : 'Send email'}
              </a>
            )}

            {!listing.contact_phone && !listing.contact_email && (
              <p className="text-stone-400 text-center text-sm py-4">
                {lang === 'fr' ? 'Aucune information de contact' : 'No contact information'}
              </p>
            )}
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
