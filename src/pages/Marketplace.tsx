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
              <div key={i} className="relative h-[300px] overflow-hidden rounded-[26px] skeleton">
                <div className="absolute inset-x-4 bottom-4 space-y-2">
                  <div className="h-3 w-24 rounded-full bg-white/50" />
                  <div className="h-6 w-3/4 rounded-md bg-white/60" />
                  <div className="h-7 w-28 rounded-full bg-white/60" />
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
                  {/* K4 : affiche plein cadre, infos posées sur la photo */}
                  <article className="card-shadow relative h-[300px] overflow-hidden rounded-[26px] bg-[#ebe9dd] [isolation:isolate] transition-transform duration-300 active:scale-[0.99]">
                    {listing.image_url ? (
                      <ShimmerImage
                        src={listing.image_url}
                        alt={listing.title}
                        className="absolute inset-0 h-full w-full [&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-start justify-center bg-parchment pt-16">
                        <span className="flex size-16 items-center justify-center rounded-3xl bg-white">
                          <Icon size={28} strokeWidth={1.5} className="text-ink" />
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,15,0)_38%,rgba(20,20,15,0.85)_100%)]" />
                    <span className="absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-medium text-ink backdrop-blur-sm">
                      <Icon size={13} strokeWidth={1.75} />
                      {lang === 'en' ? config.en : config.fr}
                    </span>

                    <div className="absolute inset-x-4 bottom-4 text-parchment">
                      {listing.location && (
                        <p className="eyebrow flex items-center gap-1 truncate text-parchment/75">
                          <MapPin size={11} strokeWidth={2} className="flex-shrink-0" />
                          <span className="truncate">{listing.location}</span>
                        </p>
                      )}
                      <h3 className="mt-1.5 font-display text-[24px] leading-[1.02] tracking-[-0.035em] text-white line-clamp-2">{listing.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex h-7 items-center rounded-full bg-lime px-3 text-[13px] font-semibold text-ink tabular whitespace-nowrap">
                          {listing.price !== null ? `${listing.price.toLocaleString('fr-FR')} FCFA` : t('market.negotiable')}
                        </span>
                        {listing.price_type && listing.price_type !== 'fixed' && listing.price !== null && (
                          <span className="inline-flex h-7 items-center rounded-full bg-white/20 px-3 text-[12px] font-medium text-white backdrop-blur-sm whitespace-nowrap">
                            {listing.price_type === 'hourly' && t('market.perHour')}
                            {listing.price_type === 'daily' && t('market.perDay')}
                            {listing.price_type === 'negotiable' && t('market.negotiable')}
                          </span>
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
