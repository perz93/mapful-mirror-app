import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Phone, Mail, DoorOpen, ChefHat, Disc3, Flower2, Shapes } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ShimmerImage from '@/components/ShimmerImage';

const categoryConfig = {
  // Icônes choisies pour parler du métier, toutes au même trait (1.75)
  location_espaces: { label: 'Location espaces', icon: DoorOpen, color: 'bg-lime' },
  traiteurs: { label: 'Traiteurs', icon: ChefHat, color: 'bg-lime' },
  animation_dj: { label: 'Animation/DJ', icon: Disc3, color: 'bg-lime' },
  decoration: { label: 'Décoration', icon: Flower2, color: 'bg-lime' },
  autre: { label: 'Autre', icon: Shapes, color: 'bg-lime' },
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
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-parchment animate-fade-in animate-zoom-smooth">

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link
          to="/"
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
        </Link>
        <button
          onClick={handleCreateListing}
          aria-label={t('market.newListing')}
          className="inline-flex size-10 items-center justify-center rounded-full bg-lime text-ink hover:bg-lime-deep active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={1.75} />
        </button>
      </div>
      <h1 className="relative z-10 px-4 pb-5 text-[40px] leading-[0.95] tracking-tighter text-ink">{t('market.title')}</h1>

      {/* Filtres de catégorie — sans animation d'entrée : Safari iOS pouvait
          laisser la rangée bloquée à opacity 0 (animation retardée + défilement). */}
      <div className="pb-3">
        <div className="flex gap-2 overflow-x-auto px-4 scroll-px-4 pb-1 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`snap-start flex-shrink-0 inline-flex items-center h-10 rounded-full px-4 text-sm font-medium border transition-colors duration-200 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-ink text-parchment border-ink'
                : 'bg-white text-ink border-stone-200 hover:border-ink'
            }`}
          >
            {t('market.all')}
          </button>
          {(Object.keys(categoryConfig) as CategoryKey[]).map((key) => {
            const config = categoryConfig[key];
            const Icon = config.icon;
            const active = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`snap-start flex-shrink-0 inline-flex items-center gap-2 h-10 rounded-full pl-1.5 pr-4 text-sm font-medium border transition-colors duration-200 active:scale-95 ${
                  active
                    ? 'bg-ink text-parchment border-ink'
                    : 'bg-white text-ink border-stone-200 hover:border-ink'
                }`}
              >
                <span className={`flex size-7 items-center justify-center rounded-full ${active ? 'bg-lime text-ink' : 'bg-parchment text-ink'}`}>
                  <Icon size={14} strokeWidth={1.75} />
                </span>
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
                <div className="h-44 skeleton relative overflow-hidden">
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton rounded-md w-3/4 relative overflow-hidden">
                  </div>
                  <div className="h-3 skeleton rounded-md w-full relative overflow-hidden">
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 skeleton rounded-full w-24 relative overflow-hidden">
                    </div>
                    <div className="h-6 skeleton rounded-full w-16 relative overflow-hidden">
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
              const Icon = config?.icon || Shapes;
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
                          <span className="inline-flex items-center h-7 px-3 rounded-full bg-white text-ink text-xs font-medium whitespace-nowrap tabular">
                            {listing.price.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}
                      {/* Category + Title on image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-ink ${config?.color || 'bg-parchment'} mb-1.5`}>
                          <Icon size={12} strokeWidth={1.75} />
                          {config?.label || 'Autre'}
                        </div>
                        <h3 className="text-white text-base font-bold leading-tight line-clamp-1 drop-shadow-sm">{listing.title}</h3>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 pb-0">
                      <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-ink ${config?.color || 'bg-parchment'} mb-2`}>
                        <Icon size={12} strokeWidth={1.75} />
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
          <EmptyState
            icon={Shapes}
            title={t('market.noListings')}
            hint={t('market.beFirst')}
            action={
              <button onClick={handleCreateListing} className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95">
                <Plus size={16} strokeWidth={1.75} />
                {t('market.createListing')}
              </button>
            }
          />
        )}
      </div>

    </div>
  );
};

export default Marketplace;
