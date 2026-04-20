import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Phone, Mail, Building2, UtensilsCrossed, Music, Palette, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const categoryConfig = {
  location_espaces: { label: 'Location espaces', icon: Building2, color: 'bg-blue-500' },
  traiteurs: { label: 'Traiteurs', icon: UtensilsCrossed, color: 'bg-orange-500' },
  animation_dj: { label: 'Animation/DJ', icon: Music, color: 'bg-purple-500' },
  decoration: { label: 'Décoration', icon: Palette, color: 'bg-pink-500' },
  autre: { label: 'Autre', icon: MoreHorizontal, color: 'bg-gray-500' },
};

type CategoryKey = keyof typeof categoryConfig;

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplace-listings', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleCreateListing = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/create-listing');
    }
  };

  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background animate-fade-in animate-zoom-smooth">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4 animate-fade-in">
        <Link
          to="/"
          className="flex size-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="text-white" size={20} />
        </Link>
        <h1 className="text-xl font-bold">Marketplace</h1>
        <Button
          onClick={handleCreateListing}
          size="icon"
          className="size-10 rounded-full bg-amber-500 hover:bg-amber-600 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="text-white" size={20} />
        </Button>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-4 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-white/70 dark:bg-stone-800/70 backdrop-blur-md'
            }`}
          >
            Tout
          </button>
          {(Object.keys(categoryConfig) as CategoryKey[]).map((key) => {
            const config = categoryConfig[key];
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  selectedCategory === key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-white/70 dark:bg-stone-800/70 backdrop-blur-md'
                }`}
              >
                <Icon size={16} />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid gap-4 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div key={selectedCategory} className="grid gap-4">
            {listings.map((listing, index) => {
              const config = categoryConfig[listing.category as CategoryKey];
              const Icon = config?.icon || MoreHorizontal;
              return (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  style={{ animationDelay: `${Math.min(index * 60, 360)}ms`, animationFillMode: 'backwards' }}
                  className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-stone-800/70 backdrop-blur-md shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {listing.image_url && (
                    <div className="h-32 overflow-hidden bg-muted">
                      <img
                        src={`${listing.image_url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=500&quality=72&resize=contain`}
                        alt={listing.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white ${config?.color || 'bg-gray-500'} mb-2`}>
                          <Icon size={12} />
                          {config?.label || 'Autre'}
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                        {listing.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                        )}
                      </div>
                      {listing.price && (
                        <div className="text-right">
                          <p className="font-bold text-primary">{listing.price.toLocaleString()} FCFA</p>
                          <p className="text-xs text-muted-foreground">
                            {listing.price_type === 'hourly' && '/heure'}
                            {listing.price_type === 'daily' && '/jour'}
                            {listing.price_type === 'negotiable' && 'Négociable'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {listing.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {listing.location}
                        </span>
                      )}
                      {listing.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {listing.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-white/50 dark:bg-stone-800/50 p-6">
              <Building2 className="text-muted-foreground" size={48} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Aucune annonce</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Soyez le premier à proposer vos services !
            </p>
            <Button onClick={handleCreateListing} className="bg-amber-500 hover:bg-amber-600">
              <Plus size={16} className="mr-2" />
              Créer une annonce
            </Button>
          </div>
        )}
      </div>

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20" />
    </div>
  );
};

export default Marketplace;
