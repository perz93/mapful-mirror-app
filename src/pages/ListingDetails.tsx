import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Phone, Mail, Tag, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ImageLightbox from '@/components/ImageLightbox';

const categoryLabels: Record<string, string> = {
  location_espaces: 'Location espaces',
  traiteurs: 'Traiteurs',
  animation_dj: 'Animation / DJ',
  decoration: 'Décoration',
  autre: 'Autre',
};

const priceTypeLabels: Record<string, string> = {
  fixed: 'Prix fixe',
  hourly: 'Par heure',
  daily: 'Par jour',
  negotiable: 'Négociable',
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleContact = (type: 'phone' | 'email') => {
    if (type === 'phone' && listing?.contact_phone) {
      window.location.href = `tel:${listing.contact_phone}`;
    } else if (type === 'email' && listing?.contact_email) {
      window.location.href = `mailto:${listing.contact_email}?subject=Demande concernant: ${listing.title}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <Skeleton className="h-64 w-full" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Annonce introuvable</p>
        <Button onClick={() => navigate('/marketplace')}>Retour au marketplace</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in animate-zoom-smooth">
      <div className="max-w-md mx-auto">
        {/* Header with image */}
        <div className="relative">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              onClick={() => setLightboxOpen(true)}
              className="w-full h-64 object-cover cursor-zoom-in transition-transform active:scale-[0.99]"
            />
          ) : (
            <div className="w-full h-64 bg-muted flex items-center justify-center">
              <Tag className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Category badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {categoryLabels[listing.category] || listing.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Title and price */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
            {listing.price !== null && (
              <p className="text-xl font-semibold text-primary mt-2">
                {listing.price.toLocaleString()} FCFA
                {listing.price_type && listing.price_type !== 'fixed' && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({priceTypeLabels[listing.price_type] || listing.price_type})
                  </span>
                )}
              </p>
            )}
            {listing.price === null && listing.price_type === 'negotiable' && (
              <p className="text-lg text-muted-foreground mt-2">Prix négociable</p>
            )}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-foreground">{listing.location}</p>
                <Button
                  onClick={() => {
                    const dest = encodeURIComponent(listing.location!);
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const url = isIOS
                      ? `https://maps.apple.com/?daddr=${dest}&dirflg=d`
                      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
                    window.open(url, '_blank');
                  }}
                  className="mt-2 h-9 px-4 text-sm rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Navigation size={16} />
                  Itinéraire
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact buttons */}
          <div className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-foreground">Contacter le vendeur</h2>
            
            {listing.contact_phone && (
              <Button
                onClick={() => handleContact('phone')}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Appeler
              </Button>
            )}
            
            {listing.contact_email && (
              <Button
                onClick={() => handleContact('email')}
                variant="outline"
                className="w-full h-12 rounded-full font-semibold"
              >
                <Mail className="w-5 h-5 mr-2" />
                Envoyer un email
              </Button>
            )}

            {!listing.contact_phone && !listing.contact_email && (
              <p className="text-muted-foreground text-center py-4">
                Aucune information de contact disponible
              </p>
            )}
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
      </div>
    </div>
  );
};

export default ListingDetails;
