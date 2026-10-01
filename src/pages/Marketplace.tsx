import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Phone, Mail, Building2, UtensilsCrossed, Music, Palette, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import ShimmerImage from '@/components/ShimmerImage';

const categoryConfig = {
  location_espaces: { label: 'Location espaces', icon: Building2, color: 'bg-lime' },
  traiteurs: { label: 'Traiteurs', icon: UtensilsCrossed, color: 'bg-lime' },
  animation_dj: { label: 'Animation/DJ', icon: Music, color: 'bg-lime' },
  decoration: { label: 'Décoration', icon: Palette, color: 'bg-lime' },
  autre: { label: 'Autre', icon: MoreHorizontal, color: 'bg-lime' },
};

type CategoryKey = keyof typeof categoryConfig;

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
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
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-stone-200 animate-fade-in animate-zoom-smooth">
      {/* Map Background — light natural */}
      <div className="fixed inset-0 pointer-events-none">
      </div>
      <div className="fixed inset-0 bg-parchment pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-4 animate-fade-in" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link
          to="/"
          className="flex size-10 items-center justify-center rounded-full bg-white transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="text-ink" size={18} strokeWidth={1.75} />
        </Link>
        <h1 className="text-[22px] leading-tight font-medium tracking-tight  text-stone-800">{t('market.title')}</h1>
        <Button
          onClick={handleCreateListing}
          size="icon"
          className="size-10 rounded-full bg-lime hover:bg-lime-deep transition-all duration-200 active:scale-95"
        >
          <Plus className="text-ink" size={20} strokeWidth={1.75} />
        </Button>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-4 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 rounded-full px-4 h-9 text-sm font-medium transition-all duration-200 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-ink text-parchment'
                : 'bg-white text-stone-600'
            }`}
          >
            {t('market.all')}
          </button>
          {(Object.keys(categoryConfig) as CategoryKey[]).map((key) => {
            const config = categoryConfig[key];
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 h-9 text-sm font-medium transition-all duration-200 active:scale-95 ${
                  selectedCategory === key
                    ? 'bg-ink text-parchment'
                    : 'bg-white text-stone-600'
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
              <div key={i} className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-sm">
                <div className="h-44 bg-stone-200/70 dark:bg-stone-800/50 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-200/70 dark:bg-stone-800/50 rounded-md w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
                  </div>
                  <div className="h-3 bg-stone-200/70 dark:bg-stone-800/50 rounded-md w-full relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-stone-200/70 dark:bg-stone-800/50 rounded-full w-24 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
                    </div>
                    <div className="h-6 bg-stone-200/70 dark:bg-stone-800/50 rounded-full w-16 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
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
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900  animate-fade-in transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {listing.image_url ? (
                    <div className="h-44 overflow-hidden relative">
                      <ShimmerImage
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-full w-full [&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {/* Price on image */}
                      {listing.price !== null && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-bold whitespace-nowrap shadow-sm">
                            {listing.price.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}
                      {/* Category + Title on image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-ink ${config?.color || 'bg-parchment'} mb-1.5`}>
                          <Icon size={10} />
                          {config?.label || 'Autre'}
                        </div>
                        <h3 className="text-white text-base font-bold leading-tight line-clamp-1 drop-shadow-sm">{listing.title}</h3>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pb-0">
                      <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-ink ${config?.color || 'bg-parchment'} mb-2`}>
                        <Icon size={10} />
                        {config?.label || 'Autre'}
                      </div>
                      <h3 className="font-bold text-stone-900 dark:text-white text-base line-clamp-1">{listing.title}</h3>
                      {listing.price !== null && (
                        <p className="text-ink font-bold text-sm mt-1">{listing.price.toLocaleString()} FCFA</p>
                      )}
                    </div>
                  )}
                  <div className="p-4 pt-3 space-y-2.5">
                    {listing.description && (
                      <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">{listing.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-2">
                      {listing.location && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60">
                          <MapPin size={11} className="text-ink" />
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 truncate max-w-[160px] ">{listing.location}</span>
                        </span>
                      )}
                      {listing.price_type && listing.price_type !== 'fixed' && !listing.image_url && listing.price !== null && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-lime/30 border border-ink/10 text-[10px] font-semibold text-ink">
                          {listing.price.toLocaleString()} FCFA
                        </span>
                      )}
                      {listing.price_type && listing.price_type !== 'fixed' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-lime/30 border border-ink/10 text-[10px] font-semibold text-ink">
                          {listing.price_type === 'hourly' && t('market.perHour')}
                          {listing.price_type === 'daily' && t('market.perDay')}
                          {listing.price_type === 'negotiable' && t('market.negotiable')}
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
            <div className="mb-4 rounded-3xl bg-white p-6">
              <Building2 className="text-stone-400" size={48} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-stone-800 ">{t('market.noListings')}</h3>
            <p className="mb-4 text-sm text-stone-500">
              {t('market.beFirst')}
            </p>
            <Button onClick={handleCreateListing} className="rounded-full px-6">
              <Plus size={16} className="mr-2" />
              {t('market.createListing')}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Marketplace;
