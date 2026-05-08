import { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Users, Calendar, Heart, Flame, ShoppingBag, Trash2, Edit, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents, Event } from '@/hooks/useEvents';
import EventListCard from '@/components/EventListCard';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { useAttendees } from '@/hooks/useAttendees';
import mapBackground from '@/assets/map-background.jpg';
import ShimmerImage from '@/components/ShimmerImage';

type MarketplaceListing = Tables<'marketplace_listings'>;

const GoingBadge = ({ eventId }: { eventId: string }) => {
  const { count } = useAttendees(eventId);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ee9d2b]/10 text-[#ee9d2b]">
      <Flame size={9} />{count}
    </span>
  );
};

const MyAccount = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState({
    eventsCreated: 0,
    favorites: 0,
    friends: 0
  });
  const { data: allEvents } = useEvents();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [userListings, setUserListings] = useState<MarketplaceListing[]>([]);
  const [uploading, setUploading] = useState(false);
  const [goingEvents, setGoingEvents] = useState<Event[]>([]);

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
    }
  };

  useEffect(() => {
    if (allEvents && user) loadFavorites();
  }, [allEvents, user]);

  // Load events where user clicked "J'y vais" from Supabase
  useEffect(() => {
    if (!allEvents || !user) return;
    const loadGoingEvents = async () => {
      const { data } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id);
      if (data && data.length > 0) {
        const goingIds = data.map(d => d.event_id);
        setGoingEvents(allEvents.filter(e => goingIds.includes(e.id)));
      } else {
        setGoingEvents([]);
      }
    };
    loadGoingEvents();
  }, [allEvents, user]);

  const loadUserListings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setUserListings(data || []);
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
    { id: 'events', label: t('account.events'), icon: Calendar },
    { id: 'listings', label: t('account.listings'), icon: ShoppingBag },
    { id: 'favorites', label: t('account.favorites'), icon: Heart },
    { id: 'activity', label: t('account.activity'), icon: Zap },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in animate-zoom-smooth bg-stone-200">
      {/* Map Background — light natural */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link to="/" className="w-11 h-11 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 hover:scale-105 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <h1 className="text-lg font-bold italic text-stone-800" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {t('account.title')}
          </h1>
          <div className="w-11 h-11" />
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center px-6 pt-4">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#ee9d2b]/30 to-[#ee9d2b]/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-xl">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ee9d2b] to-[#e08820] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-white/80 disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Pencil className="w-3.5 h-3.5 text-[#ee9d2b]" />
              )}
            </button>
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-stone-800 mb-1 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            {displayName}
          </h2>
          <p className="text-stone-500 text-xs mb-5">{user?.email}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            <div className="flex flex-col items-center gap-1 rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-3">
              <Calendar size={16} className="text-[#ee9d2b]" />
              <p className="text-xl font-bold text-stone-800">{stats.eventsCreated}</p>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">Events</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-3">
              <Heart size={16} className="text-[#ee9d2b]" />
              <p className="text-xl font-bold text-stone-800">{stats.favorites}</p>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">{t('account.favorites')}</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-3">
              <Zap size={16} className="text-[#ee9d2b]" />
              <p className="text-xl font-bold text-stone-800">{goingEvents.length}</p>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">{t('account.goingTitle')}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex w-full rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#ee9d2b] text-white shadow-lg'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="w-full pb-8">
            {activeTab === 'events' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-stone-800 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {t('account.myEvents')}
                  </h3>
                  <Link to="/manage-events" className="text-[#ee9d2b] text-xs font-semibold hover:underline">
                    {t('account.manageAll')}
                  </Link>
                </div>
                {userEvents.length === 0 ? (
                  <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-8 text-center">
                    <Calendar size={32} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm mb-3">{t('account.noEvents')}</p>
                    <Link
                      to="/create-event"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      {t('account.createFirst')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userEvents.map(event => (
                      <div key={event.id} className="relative">
                        <EventListCard event={event} />
                        <div className="absolute top-3 right-3">
                          <GoingBadge eventId={event.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-stone-800 italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                    {t('account.myListings')}
                  </h3>
                  <Link to="/create-listing" className="text-[#ee9d2b] text-xs font-semibold hover:underline">
                    {t('account.createListing')}
                  </Link>
                </div>
                {userListings.length === 0 ? (
                  <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-8 text-center">
                    <ShoppingBag size={32} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm mb-3">{t('account.noListings')}</p>
                    <Link
                      to="/create-listing"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      {t('account.publishListing')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userListings.map(listing => (
                      <div
                        key={listing.id}
                        className="rounded-2xl backdrop-blur-2xl bg-white/90 dark:bg-stone-900/80 border border-white/60 dark:border-stone-700/30 overflow-hidden shadow-lg"
                      >
                        {listing.image_url && (
                          <ShimmerImage src={listing.image_url} alt={listing.title} className="w-full h-28" />
                        )}
                        <div className="p-3.5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">{listing.title}</h4>
                              <p className="text-xs text-stone-500 capitalize italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{listing.category}</p>
                              {listing.price && (
                                <p className="text-[#ee9d2b] font-bold text-sm mt-1">{listing.price.toLocaleString()} FCFA</p>
                              )}
                            </div>
                            <div className="flex gap-1.5 ml-2">
                              <button
                                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                                className="p-2 rounded-full bg-[#ee9d2b]/10 hover:bg-[#ee9d2b]/20 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#ee9d2b]" />
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
                <h3 className="text-base font-bold text-stone-800 italic mb-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {t('account.myFavorites')}
                </h3>
                {favoriteEvents.length === 0 ? (
                  <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-8 text-center">
                    <Heart size={32} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm mb-1">{t('account.noFavorites')}</p>
                    <p className="text-stone-400 text-xs">{t('account.favoritesHint')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteEvents.map(event => (
                      <div key={event.id} className="relative">
                        <EventListCard event={event} />
                        <div className="absolute top-3 right-3">
                          <GoingBadge eventId={event.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-base font-bold text-stone-800 italic mb-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  {t('account.goingTitle')}
                </h3>
                {goingEvents.length === 0 ? (
                  <div className="rounded-2xl backdrop-blur-2xl bg-white/50 border border-white/60 shadow-sm p-8 text-center">
                    <Zap size={32} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm mb-1">{t('account.noActivity')}</p>
                    <p className="text-stone-400 text-xs">{t('account.activityHint')}</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-[#ee9d2b] text-white text-xs font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      {t('account.explore')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goingEvents.map(event => (
                      <div key={event.id} className="relative">
                        <EventListCard event={event} />
                        <div className="absolute top-3 right-3">
                          <GoingBadge eventId={event.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
