import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Phone, Mail, Tag, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import ImageLightbox from '@/components/ImageLightbox';
import mapBackground from '@/assets/map-background.jpg';

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
      <div className="min-h-screen relative overflow-hidden bg-stone-200 animate-fade-in animate-zoom-smooth">
        <div className="fixed inset-0 pointer-events-none">
          <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-3 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-stone-200 animate-fade-in animate-zoom-smooth">
        <div className="fixed inset-0 pointer-events-none">
          <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-4">
          <Tag size={48} className="text-stone-300" />
          <p className="text-stone-600">{lang === 'fr' ? 'Annonce introuvable' : 'Listing not found'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-3 rounded-full bg-[#ee9d2b] text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95"
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
    <div className="min-h-screen relative overflow-hidden bg-stone-200 animate-fade-in animate-zoom-smooth">
      {/* Map Background */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-md min-h-screen flex flex-col">
        {/* Hero image */}
        <div className="relative" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {listing.image_url ? (
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative h-72 mx-4 mt-2 rounded-3xl overflow-hidden cursor-zoom-in transition-transform active:scale-[0.99]"
            >
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

              {/* Category badge */}
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold shadow-lg">
                  {catLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-48 mx-4 mt-2 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/60 flex flex-col items-center justify-center gap-2">
              <Tag size={40} className="text-stone-300" />
              <span className="px-3 py-1 rounded-full bg-[#ee9d2b]/10 text-[#ee9d2b] text-xs font-semibold">
                {catLabel}
              </span>
            </div>
          )}

          {/* Top buttons */}
          <div className="absolute left-4 right-4 flex items-center justify-between" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all active:scale-95"
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

        {/* Info */}
        <div className="px-4 pt-5 pb-8 space-y-4 flex-1">
          {/* Title + Price card */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <h1 className="text-2xl font-bold text-stone-800 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {listing.title}
            </h1>

            {listing.price !== null && (
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-2xl font-bold text-[#ee9d2b]">
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
              <p className="text-lg text-[#ee9d2b] font-semibold mt-3">{priceLabel}</p>
            )}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ee9d2b]/10 flex-shrink-0">
                <MapPin size={20} className="text-[#ee9d2b]" />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold mb-0.5">
                  {lang === 'fr' ? 'Localisation' : 'Location'}
                </p>
                <p className="text-stone-800 font-medium italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {listing.location}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
              <h2 className="text-lg font-bold text-stone-800 italic mb-3" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {t('form.description')}
              </h2>
              <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-5">
            <h2 className="text-lg font-bold text-stone-800 italic mb-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {lang === 'fr' ? 'Contacter le vendeur' : 'Contact seller'}
            </h2>

            <div className="space-y-3">
              {listing.contact_phone && (
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-[#ee9d2b] text-white font-semibold text-sm shadow-lg shadow-[#ee9d2b]/20 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <Phone size={18} />
                  {lang === 'fr' ? 'Appeler' : 'Call'} — {listing.contact_phone}
                </a>
              )}

              {listing.contact_email && (
                <a
                  href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(listing.title)}`}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-white/70 border border-stone-200/50 text-stone-700 font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.98]"
                >
                  <Mail size={18} className="text-[#ee9d2b]" />
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
