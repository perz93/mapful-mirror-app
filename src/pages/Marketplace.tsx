import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Plus, MapPin, Phone, Mail, Shapes } from 'lucide-react';
import { MARKETPLACE_CATEGORIES, getMarketplaceCategory } from '@/lib/marketplaceCategories';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ShimmerImage from '@/components/ShimmerImage';

type CategoryKey = string;

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
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
        query = query.eq('category', selectedCategory as never);
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
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-parchment page-enter">

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
          {MARKETPLACE_CATEGORIES.map((config) => {
            const key = config.value;
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
                {lang === 'en' ? config.en : config.fr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-white dark:bg-stone-900 p-2">
                <div className="h-52 rounded-[20px] skeleton" />
                <div className="px-3 pt-4 pb-3 space-y-3">
                  <div className="h-3 w-24 rounded-full skeleton skeleton-on-white" />
                  <div className="h-6 w-3/4 rounded-md skeleton skeleton-on-white" />
                  <div className="h-3 w-full rounded-md skeleton skeleton-on-white" />
                  <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                    <div className="h-6 w-28 rounded-md skeleton skeleton-on-white" />
                    <div className="size-9 rounded-full skeleton skeleton-on-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div key={selectedCategory} className="grid gap-4">
            {listings.map((listing, index) => {
              const config = getMarketplaceCategory(listing.category);
              const Icon = config.icon;
              return (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  style={{ animationDelay: `${Math.min(index * 60, 360)}ms`, animationFillMode: 'backwards' }}
                  className="group block animate-fade-in"
                >
                  {/* Même construction que les cartes d'événement des catégories */}
                  <article className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 p-2 transition-transform duration-300 active:scale-[0.99]">
                    <div className="relative h-52 overflow-hidden rounded-[20px]">
                      {listing.image_url ? (
                        <ShimmerImage
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full [&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-parchment">
                          <span className="flex size-16 items-center justify-center rounded-3xl bg-white">
                            <Icon size={28} strokeWidth={1.5} className="text-ink" />
                          </span>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-lime px-3 text-xs font-medium text-ink">
                        <Icon size={13} strokeWidth={1.75} />
                        {lang === 'en' ? config.en : config.fr}
                      </span>
                    </div>

                    <div className="px-3 pt-4 pb-3">
                      {listing.location && (
                        <p className="eyebrow flex items-center gap-1 text-stone-500 truncate">
                          <MapPin size={11} strokeWidth={2} className="flex-shrink-0" />
                          <span className="truncate">{listing.location}</span>
                        </p>
                      )}
                      <h3 className="mt-1 text-[22px] leading-[1.1] tracking-tight text-ink dark:text-white line-clamp-2">{listing.title}</h3>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200 dark:border-stone-800 pt-3">
                        <div className="flex min-w-0 items-baseline gap-2">
                          {listing.price !== null ? (
                            <p className="font-display text-xl tracking-tight text-ink dark:text-white tabular whitespace-nowrap">
                              {listing.price.toLocaleString('fr-FR')} <span className="text-sm text-stone-500 font-normal">FCFA</span>
                            </p>
                          ) : (
                            <p className="text-sm text-stone-500">{t('market.negotiable')}</p>
                          )}
                          {listing.price_type && listing.price_type !== 'fixed' && listing.price !== null && (
                            <span className="inline-flex h-6 items-center rounded-full bg-parchment px-2.5 text-[11px] font-medium text-stone-600 whitespace-nowrap">
                              {listing.price_type === 'hourly' && t('market.perHour')}
                              {listing.price_type === 'daily' && t('market.perDay')}
                              {listing.price_type === 'negotiable' && t('market.negotiable')}
                            </span>
                          )}
                        </div>
                        <span className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-ink text-lime transition-transform group-hover:translate-x-0.5">
                          <ArrowUpRight size={16} strokeWidth={2} />
                        </span>
                      </div>
                    </div>
                  </article>
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
