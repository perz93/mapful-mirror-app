import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Users, Calendar, Heart, ShoppingBag, Trash2, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents, Event } from '@/hooks/useEvents';
import EventListCard from '@/components/EventListCard';
import { toast } from '@/components/PillToast';
import { Tables } from '@/integrations/supabase/types';
import ShimmerImage from '@/components/ShimmerImage';
import { AccountSkeleton } from '@/components/PageSkeleton';

type MarketplaceListing = Tables<'marketplace_listings'>;

/** Squelette crème des listes de Mon compte (même forme que les cartes) */
const ListSkeleton = ({ tall = false }: { tall?: boolean }) => (
  <div className="space-y-3">
    {[1, 2].map((i) => (
      <div key={i} className="rounded-3xl bg-white p-3">
        {tall ? (
          <>
            <div className="h-28 w-full rounded-2xl skeleton" />
            <div className="mt-3 space-y-2 px-1">
              <div className="h-4 w-2/3 rounded-md skeleton skeleton-on-white" />
              <div className="h-3 w-1/3 rounded-md skeleton skeleton-on-white" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2 pl-1">
              <div className="h-3 w-24 rounded-full skeleton skeleton-on-white" />
              <div className="h-4 w-3/4 rounded-md skeleton skeleton-on-white" />
              <div className="h-3 w-1/2 rounded-md skeleton skeleton-on-white" />
            </div>
            <div className="size-20 flex-shrink-0 rounded-2xl skeleton" />
          </div>
        )}
      </div>
    ))}
  </div>
);

const MyAccount = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  // ?tab=favorites (lien « Favoris » du menu) ouvre directement l'onglet
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'events');
  const [stats, setStats] = useState({
    eventsCreated: 0,
    favorites: 0,
    friends: 0
  });
  const { data: allEvents, isLoading: eventsLoading } = useEvents();
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [userListings, setUserListings] = useState<MarketplaceListing[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadUserListings();
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (user && allEvents) {
      const filtered = allEvents.filter(event => event.user_id === user.id);
      setUserEvents(filtered);
    }
  }, [user, allEvents]);

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

  const loadFavorites = async () => {
    if (!user) return;
    const { data: favs } = await supabase
      .from('event_favorites')
      .select('event_id')
      .eq('user_id', user.id);

    if (favs && favs.length > 0 && allEvents) {
      const favIds = favs.map(f => f.event_id);
      setFavoriteEvents(allEvents.filter(e => favIds.includes(e.id)));
    } else {
      setFavoriteEvents([]);
    }
    if (allEvents) setFavoritesLoaded(true);
  };

  useEffect(() => {
    if (allEvents && user) loadFavorites();
  }, [allEvents, user]);

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
    if (!confirm(t('account.deleteListingConfirm'))) return;
    const { error } = await supabase.from('marketplace_listings').delete().eq('id', listingId);
    if (error) {
      toast.error(t('account.deleteListingError'));
      return;
    }
    toast.success(t('account.listingDeleted'));
    loadUserListings();
  };

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
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
    <div className="min-h-screen relative overflow-hidden page-enter bg-parchment">

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link to="/" aria-label="Retour" className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform">
            <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
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
                  <div className="rounded-3xl bg-white p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-parchment">
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
                      <div key={event.id} className="relative">
                        <EventListCard event={event} />
                      </div>
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
                {!listingsLoaded ? <ListSkeleton tall /> : userListings.length === 0 ? (
                  <div className="rounded-3xl bg-white p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-parchment">
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
                      <div
                        key={listing.id}
                        className="rounded-2xl bg-white dark:bg-stone-900/80 overflow-hidden shadow-lg"
                      >
                        {listing.image_url && (
                          <ShimmerImage src={listing.image_url} alt={listing.title} className="w-full h-28" />
                        )}
                        <div className="p-3.5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">{listing.title}</h4>
                              <p className="text-xs text-stone-500 capitalize ">{listing.category}</p>
                              {listing.price && (
                                <p className="text-ink font-bold text-sm mt-1">{listing.price.toLocaleString()} FCFA</p>
                              )}
                            </div>
                            <div className="flex gap-1.5 ml-2">
                              <button
                                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                                className="p-2 rounded-full bg-lime/30 hover:bg-lime/60 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5 text-ink" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
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
                  <div className="rounded-3xl bg-white p-6">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-parchment">
                      <Heart size={18} strokeWidth={1.75} className="text-ink" />
                    </span>
                    <p className="text-ink font-medium mb-1">{t('account.noFavorites')}</p>
                    <p className="text-stone-500 text-sm">{t('account.favoritesHint')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteEvents.map(event => (
                      <div key={event.id} className="relative">
                        <EventListCard event={event} />
                      </div>
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
