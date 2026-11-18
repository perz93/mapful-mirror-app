import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Users, Calendar, Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, IMMUTABLE_CACHE } from '@/lib/compressImage';
import type { Event } from '@/hooks/useEvents';
import ManageEventCard from '@/components/ManageEventCard';
import ManageListingCard from '@/components/ManageListingCard';
import FavoriteEventCard from '@/components/FavoriteEventCard';
import { toast } from '@/components/PillToast';
import { Tables } from '@/integrations/supabase/types';
import ShimmerImage from '@/components/ShimmerImage';
import { AccountSkeleton } from '@/components/PageSkeleton';

type MarketplaceListing = Tables<'marketplace_listings'>;

/** Squelette crème des listes de Mon compte (même forme que les cartes) */
const ListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3 rounded-[24px] bg-parchment p-2">
        <div className="size-[84px] flex-shrink-0 rounded-[18px] skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded-full skeleton skeleton-on-white" />
          <div className="h-4 w-3/4 rounded-md skeleton skeleton-on-white" />
          <div className="h-5 w-1/3 rounded-full skeleton skeleton-on-white" />
        </div>
      </div>
    ))}
  </div>
);

const MyAccount = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  // ?tab=favorites (lien « Favoris » du menu) ouvre directement l'onglet
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'events');
  const [stats, setStats] = useState({
    eventsCreated: 0,
    favorites: 0,
    friends: 0
  });
  // Mes événements et mes favoris : chargés directement (pas toute la liste des événements de l'app)
  const { data: userEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['my-events', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }); // les plus récemment publiés en premier
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });
  const { data: favoriteEvents = [], isSuccess: favoritesLoaded } = useQuery({
    queryKey: ['my-favorites', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: favs, error } = await supabase
        .from('event_favorites')
        .select('event_id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const ids = (favs ?? []).map((f) => f.event_id);
      if (ids.length === 0) return [] as Event[];
      const { data: evs } = await supabase.from('events').select('*').in('id', ids);
      // Dans l'ordre des favoris : le dernier ajouté en premier
      const byId = new Map(((evs ?? []) as Event[]).map((e) => [e.id, e]));
      return ids.map((id) => byId.get(id)).filter((e): e is Event => !!e);
    },
  });
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [userListings, setUserListings] = useState<MarketplaceListing[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadUserListings();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: favoritesCount } = await supabase.from('event_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: friendsCount } = await supabase.from('user_friends').select('*', { count: 'exact', head: true }).or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq('status', 'accepted');
    setStats({
      eventsCreated: eventsCount || 0,
      favorites: favoritesCount || 0,
      friends: friendsCount || 0
    });
  };


  const loadUserListings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setUserListings(data || []);
    setListingsLoaded(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', listingId);
    if (error) {
      toast.error(t('account.deleteListingError'));
      return;
    }
    toast.success(t('account.listingDeleted'));
    queryClient.invalidateQueries();
    loadUserListings();
  };

  // Masquer / afficher une annonce : elle quitte (ou retrouve) la Marketplace sans être supprimée
  const handleToggleListing = async (listing: MarketplaceListing) => {
    const next = !listing.is_published;
    setUserListings((all) => all.map((l) => (l.id === listing.id ? { ...l, is_published: next } : l)));
    const { error } = await supabase.from('marketplace_listings').update({ is_published: next }).eq('id', listing.id);
    if (error) {
      toast.error(t('event.publishError'));
      loadUserListings();
      return;
    }
    toast.success(next ? t('listing.shown') : t('listing.hiddenToast'));
    queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
  };

  const handleRemoveFavorite = async (eventId: string) => {
    if (!user) return;
    queryClient.setQueryData<Event[]>(['my-favorites', user.id], (old) => old?.filter((e) => e.id !== eventId));
    const { error } = await supabase.from('event_favorites').delete().eq('event_id', eventId).eq('user_id', user.id);
    if (error) {
      toast.error(t('event.publishError'));
      queryClient.invalidateQueries({ queryKey: ['my-favorites', user.id] });
      return;
    }
    toast.success(t('favorite.removed'));
    setStats((st) => ({ ...st, favorites: Math.max(0, st.favorites - 1) }));
  };

  const refreshMyEvents = () => queryClient.invalidateQueries({ queryKey: ['my-events', user?.id] });

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('form.invalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('form.imageTooLarge'));
      return;
    }
    setUploading(true);
    try {
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
      }
      const image = await compressImage(file, 512);
      const filePath = `${user.id}/${Date.now()}.${image.ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, image.blob, { contentType: image.contentType, cacheControl: IMMUTABLE_CACHE });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success(t('account.avatarUpdated'));
    } catch (error: any) {
      toast.error(t('account.avatarError'));
    } finally {
      setUploading(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || t('user');
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'events', label: t('account.events'), count: stats.eventsCreated },
    { id: 'listings', label: t('account.listings'), count: userListings.length },
    { id: 'favorites', label: t('account.favorites'), count: stats.favorites },
  ];

  const isProfileLoading = !profile && !!user;

  return (
    <div className="min-h-screen relative overflow-hidden page-enter bg-canvas">

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link to="/" aria-label="Retour" className="inline-flex size-12 btn-float items-center justify-center rounded-full bg-parchment text-ink active:scale-95 transition-transform">
            <ArrowLeft size={20} strokeWidth={1.75} className="text-ink" />
          </Link>
          <h1 className="eyebrow text-stone-500">
            {t('account.title')}
          </h1>
          <div className="w-10 h-10" />
        </div>

        {/* Profile Section */}
        {isProfileLoading ? (
          <AccountSkeleton />
        ) : (
        <div className="flex flex-col items-center px-6 pt-4">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <div className="w-full h-full">
                {profile?.avatar_url ? (
                  <ShimmerImage src={profile.avatar_url} alt={displayName} loading="eager" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-lime flex items-center justify-center">
                    <span className="font-display text-ink text-[32px] tracking-tight">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label={t('account.changePhoto')}
              className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-ink flex items-center justify-center ring-4 ring-parchment active:scale-95 transition-transform disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-lime" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Name */}
          <h2 className="text-[32px] leading-none tracking-tighter text-ink mb-1.5 capitalize">
            {displayName}
          </h2>
          <p className="text-stone-500 text-sm mb-7">{user?.email}</p>

          {/* Onglets avec compteurs (remplacent les cartes de stats à icônes) */}
          <div role="tablist" className="flex w-full border-b border-stone-200 mb-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 pb-3 pt-1 text-sm font-medium transition-colors ${
                    isActive ? 'text-ink' : 'text-stone-500 hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`tabular inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                    isActive ? 'bg-lime text-ink' : 'bg-stone-200/80 text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                  <span className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full transition-colors ${isActive ? 'bg-ink' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="w-full pb-8">
            {activeTab === 'events' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] text-ink">
                    {t('account.myEvents')}
                  </h3>
                  <Link to="/manage-events" className="text-ink text-xs font-semibold hover:underline">
                    {t('account.manageAll')}
                  </Link>
                </div>
                {eventsLoading ? <ListSkeleton /> : userEvents.length === 0 ? (
                  <div className="rounded-3xl bg-parchment p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-canvas">
                      <Calendar size={18} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <p className="text-stone-500 text-sm mb-3">{t('account.noEvents')}</p>
                    <Link
                      to="/create-event"
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
                    >
                      {t('account.createFirst')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userEvents.map(event => (
                      <ManageEventCard key={event.id} event={event} onDeleted={refreshMyEvents} onUpdated={refreshMyEvents} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] text-ink">
                    {t('account.myListings')}
                  </h3>
                  <Link to="/create-listing" className="text-ink text-xs font-semibold hover:underline">
                    {t('account.createListing')}
                  </Link>
                </div>
                {!listingsLoaded ? <ListSkeleton /> : userListings.length === 0 ? (
                  <div className="rounded-3xl bg-parchment p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-canvas">
                      <ShoppingBag size={18} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <p className="text-stone-500 text-sm mb-3">{t('account.noListings')}</p>
                    <Link
                      to="/create-listing"
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95 disabled:opacity-50"
                    >
                      {t('account.publishListing')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userListings.map(listing => (
                      <ManageListingCard key={listing.id} listing={listing} onToggle={handleToggleListing} onDelete={handleDeleteListing} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-[20px] text-ink mb-4">
                  {t('account.myFavorites')}
                </h3>
                {!favoritesLoaded ? <ListSkeleton /> : favoriteEvents.length === 0 ? (
                  <div className="rounded-3xl bg-parchment p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-canvas">
                      <Heart size={18} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <p className="text-ink font-medium mb-1">{t('account.noFavorites')}</p>
                    <p className="text-stone-500 text-sm">{t('account.favoritesHint')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteEvents.map(event => (
                      <FavoriteEventCard key={event.id} event={event} onRemove={handleRemoveFavorite} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
