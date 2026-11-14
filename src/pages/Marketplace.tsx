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
import { GridCardSkeleton } from '@/components/PageSkeleton';
import { softCase } from '@/lib/softCase';
import { usePageMeta } from '@/hooks/usePageMeta';

type CategoryKey = string;

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  usePageMeta('Prestataires et services à Abidjan', "DJ, traiteurs, photographes, matériel, location : trouve les prestataires pour tes événements à Abidjan sur Upvibe.");

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
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white page-enter">

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <Link
          to="/"
          className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-parchment text-ink active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
        </Link>
        <button
          onClick={handleCreateListing}
          aria-label={t('market.newListing')}
          className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-lime text-ink hover:bg-lime-deep active:scale-95 transition-transform"
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
            className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-lime text-ink active:scale-95 transition-transform"
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
        <div className="flex gap-2 overflow-x-auto px-4 scroll-px-4 pt-2 pb-7 -mt-2 -mb-6 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`snap-start flex-shrink-0 inline-flex items-center h-12 rounded-full px-4 text-[13px] font-medium btn-float transition-colors duration-200 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-ink text-parchment'
                : 'bg-parchment text-ink'
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
                className={`snap-start flex-shrink-0 inline-flex items-center gap-2 h-12 rounded-full pl-1.5 pr-4 text-[13px] font-medium btn-float transition-colors duration-200 active:scale-95 ${
                  active
                    ? 'bg-ink text-parchment'
                    : 'bg-parchment text-ink'
                }`}
              >
                <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full ${active ? 'bg-lime text-ink' : 'bg-white text-ink'}`}>
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
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <GridCardSkeleton key={i} />)}
          </div>
        ) : listings && listings.length > 0 ? (
          <div key={selectedCategory} className="grid grid-cols-2 gap-3">
            {listings.map((listing, index) => {
              const config = getMarketplaceCategory(listing.category);
              const Icon = config.icon;
              return (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  style={{ animationDelay: `${Math.min(index * 60, 360)}ms`, animationFillMode: 'backwards' }}
                  className="group block h-full no-press"
                >
                  {/* Carte compacte sur deux colonnes : photo carrée, prix, puis titre et lieu */}
                  <article className="card-shadow flex h-full flex-col overflow-hidden rounded-[22px] bg-parchment p-1.5">
                    <div className="relative aspect-square overflow-hidden rounded-[17px] bg-[#e8e8e8]">
                      {listing.image_url ? (
                        <ShimmerImage
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white">
                          <span className="flex size-14 items-center justify-center rounded-3xl bg-parchment">
                            <Icon size={24} strokeWidth={1.5} className="text-ink" />
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 inline-flex h-6 max-w-[calc(100%-16px)] items-center rounded-full bg-lime px-2.5 text-[11px] font-semibold text-ink tabular">
                        <span className="truncate">
                          {listing.price !== null
                            ? `${listing.price.toLocaleString('fr-FR')} F${listing.price_type === 'hourly' ? ' / h' : listing.price_type === 'daily' ? ' / jour' : ''}`
                            : t('market.negotiable')}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-2.5">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-stone-500">
                        <Icon size={11} strokeWidth={2} className="flex-shrink-0" />
                        <span className="truncate">{lang === 'en' ? config.en : config.fr}</span>
                      </span>
                      <h3 className="mt-1 font-display text-[16px] leading-[1.1] tracking-tight text-ink line-clamp-2">{softCase(listing.title)}</h3>
                      {listing.location && (
                        <span className="mt-auto flex min-w-0 items-center gap-1 pt-2 text-[11.5px] font-medium text-stone-600">
                          <MapPin size={12} strokeWidth={2.2} className="flex-shrink-0" />
                          <span className="truncate">{softCase(listing.location)}</span>
                        </span>
                      )}
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
