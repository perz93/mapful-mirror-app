import LargeTitle from '@/components/LargeTitle';
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
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-parchment page-enter">

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
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
      <LargeTitle
        className="relative z-10 px-4 pb-5 text-[40px] leading-[0.95] tracking-tighter text-ink"
        backTo="/"
        right={
          <button
            onClick={handleCreateListing}
            aria-label={t('market.newListing')}
            className="inline-flex size-10 items-center justify-center rounded-full bg-lime text-ink active:scale-95 transition-transform"
          >
            <Plus size={20} strokeWidth={1.75} />
          </button>
        }
      >
        {t('market.title')}
      </LargeTitle>

      {/* Filtres de catégorie — sans animation d'entrée : Safari iOS pouvait
          laisser la rangée bloquée à opacity 0 (animation retardée + défilement). */}
      <div className="sticky-chips">
        <div className="flex gap-2 overflow-x-auto px-4 scroll-px-4 pb-1 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`snap-start flex-shrink-0 inline-flex items-center h-12 rounded-full px-4 text-[13px] font-medium border transition-colors duration-200 active:scale-95 ${
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
                className={`snap-start flex-shrink-0 inline-flex items-center gap-2 h-12 rounded-full pl-1.5 pr-4 text-[13px] font-medium border transition-colors duration-200 active:scale-95 ${
                  active
                    ? 'bg-ink text-parchment border-ink'
                    : 'bg-white text-ink border-stone-200 hover:border-ink'
                }`}
              >
                <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full ${active ? 'bg-lime text-ink' : 'bg-parchment text-ink'}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                {/* Nom sur deux lignes, comme les pages événements */}
                <span className="max-w-[92px] whitespace-normal text-left leading-[1.15]">
                  {lang === 'en' ? config.en : config.fr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings */}
      <div className="flex-1 px-4 pt-1 pb-24">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-shadow rounded-[26px] bg-white p-2">
                <div className="h-48 rounded-[20px] skeleton" />
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 space-y-2 px-2 py-1.5">
                    <div className="h-5 w-3/4 rounded-md skeleton skeleton-on-white" />
                    <div className="h-3 w-1/2 rounded-md skeleton skeleton-on-white" />
                  </div>
                  <div className="h-14 w-24 rounded-2xl skeleton skeleton-on-white" />
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
                  {/* K7 : carte blanche, prix en ticket vert détachable */}
                  <article className="card-shadow overflow-hidden rounded-[26px] bg-white p-2 transition-transform duration-300 active:scale-[0.99]">
                    <div className="relative h-48 overflow-hidden rounded-[20px] bg-[#ebe9dd]">
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
                      <span className="absolute left-2.5 top-2.5 inline-flex h-7 items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-medium text-ink backdrop-blur-sm">
                        <Icon size={13} strokeWidth={1.75} />
                        {lang === 'en' ? config.en : config.fr}
                      </span>
                    </div>

                    <div className="mt-2 flex items-stretch gap-2">
                      <div className="min-w-0 flex-1 px-2 py-1.5">
                        <h3 className="font-display text-[19px] leading-[1.05] tracking-[-0.03em] text-ink line-clamp-2">{listing.title}</h3>
                        {listing.location && (
                          <p className="mt-1 flex items-center gap-1 truncate text-[12.5px] text-stone-500">
                            <MapPin size={12} strokeWidth={2} className="flex-shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </p>
                        )}
                      </div>
                      {/* Ticket : bord pointillé + encoches comme un coupon détachable */}
                      <div className="relative flex flex-shrink-0 flex-col justify-center rounded-2xl border-l-2 border-dashed border-ink/25 bg-lime px-3.5 py-2 text-ink">
                        <span className="absolute -left-[7px] -top-[6px] size-3 rounded-full bg-white" />
                        <span className="absolute -bottom-[6px] -left-[7px] size-3 rounded-full bg-white" />
                        {listing.price !== null ? (
                          <>
                            <span className="font-display text-[17px] leading-none tracking-tight tabular">{listing.price.toLocaleString('fr-FR')}</span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                              FCFA
                              {listing.price_type === 'negotiable' && ' · Négo.'}
                              {listing.price_type === 'hourly' && ' / h'}
                              {listing.price_type === 'daily' && ' / jour'}
                            </span>
                          </>
                        ) : (
                          <span className="font-display text-[15px] leading-tight tracking-tight">{t('market.negotiable')}</span>
                        )}
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
