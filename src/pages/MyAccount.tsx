import { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, Users, Calendar, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEvents, Event } from '@/hooks/useEvents';
import EventListCard from '@/components/EventListCard';
import { toast } from 'sonner';
const MyAccount = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState({
    eventsCreated: 0,
    favorites: 0,
    friends: 0
  });
  const {
    data: allEvents
  } = useEvents();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];
  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
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
    const {
      data
    } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };
  const loadStats = async () => {
    if (!user) return;

    // Count events created by user
    const {
      count: eventsCount
    } = await supabase.from('events').select('*', {
      count: 'exact',
      head: true
    }).eq('user_id', user.id);

    // Count favorites
    const {
      count: favoritesCount
    } = await supabase.from('event_favorites').select('*', {
      count: 'exact',
      head: true
    }).eq('user_id', user.id);

    // Count accepted friends
    const {
      count: friendsCount
    } = await supabase.from('user_friends').select('*', {
      count: 'exact',
      head: true
    }).or(`user_id.eq.${user.id},friend_id.eq.${user.id}`).eq('status', 'accepted');
    setStats({
      eventsCreated: eventsCount || 0,
      favorites: favoritesCount || 0,
      friends: friendsCount || 0
    });
  };
  const handleAvatarClick = () => {
    document.getElementById('avatar-upload')?.click();
  };
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }
    setUploading(true);
    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update profile
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        avatar_url: publicUrl
      }).eq('id', user.id);
      if (updateError) throw updateError;
      setProfile({
        ...profile,
        avatar_url: publicUrl
      });
      toast.success('Photo de profil mise à jour !');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    } finally {
      setUploading(false);
    }
  };
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  return <div className="min-h-screen relative overflow-hidden animate-fade-in animate-zoom-smooth">
      {/* Map Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: "url('/src/assets/map-background.jpg')",
      filter: "blur(3px)"
    }} />
      {/* Darker Semi-Transparent Blur Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <Link to="/" className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          
          <h1 className="text-lg font-semibold text-black">Profile</h1>
          
          <div className="w-11 h-11" />
        </div>

        {/* Profile Section */}
        <div className="flex-1 flex flex-col items-center px-6 pt-8">
          {/* Profile Picture with Circle Background */}
          <div className="relative mb-6">
            {/* Circle Background */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
              {/* Profile Image */}
              <div className="w-36 h-36 rounded-full overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>}
              </div>
            </div>
            
            {/* Edit Button */}
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <button onClick={handleAvatarClick} disabled={uploading} className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-all border-2 border-background disabled:opacity-50">
              {uploading ? <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <Pencil className="w-4 h-4 text-background" />}
            </button>
          </div>

          {/* Name */}
          <h2 className="text-3xl font-bold mb-6 text-center leading-tight text-white">
            {displayName}
          </h2>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.friends}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.eventsCreated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.favorites}</span>
            </div>
          </div>

          {/* Navigation Tabs - Relevant to event app */}
          <div className="flex items-center gap-2 mb-8">
            <button onClick={() => setActiveTab('events')} className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${activeTab === 'events' ? 'bg-foreground text-background' : 'bg-background/80 text-foreground hover:bg-background'}`}>
              Mes événements
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${activeTab === 'favorites' ? 'bg-foreground text-background' : 'bg-background/80 text-foreground hover:bg-background'}`}>
              Favoris
            </button>
            <button onClick={() => setActiveTab('friends')} className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${activeTab === 'friends' ? 'bg-foreground text-background' : 'bg-background/80 text-foreground hover:bg-background'}`}>
              Amis
            </button>
          </div>

          {/* Content Based on Active Tab */}
          {activeTab === 'events' && <div className="w-full px-6 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black">Mes événements créés</h3>
                <Link to="/manage-events" className="text-primary text-sm font-medium hover:underline">
                  Gérer
                </Link>
              </div>
              {userEvents.length === 0 ? <p className="text-center py-8 text-white">Vous n'avez créé aucun événement pour le moment</p> : <div className="grid grid-cols-1 gap-4">
                  {userEvents.map(event => <EventListCard key={event.id} event={event} />)}
                </div>}
            </div>}

          {activeTab === 'favorites' && <div className="w-full px-6 pb-8">
              <h3 className="text-foreground text-xl font-semibold mb-4">Mes favoris</h3>
              <p className="text-muted-foreground text-center py-8">Vos événements favoris apparaîtront ici</p>
            </div>}

          {activeTab === 'friends' && <div className="w-full px-6 pb-8">
              <h3 className="text-foreground text-xl font-semibold mb-4">Mes amis</h3>
              <p className="text-muted-foreground text-center py-8">Votre liste d'amis apparaîtra ici</p>
            </div>}
        </div>
      </div>
    </div>;
};
export default MyAccount;