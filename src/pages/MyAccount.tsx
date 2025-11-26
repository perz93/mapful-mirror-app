import { useState, useEffect } from 'react';
import { ArrowLeft, Grid3x3, Pencil, Users, FileText, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MyAccount = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('hello');
  const [stats, setStats] = useState({
    eventsCreated: 0,
    favorites: 0,
    friends: 0
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;

    // Count events created by user
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count favorites
    const { count: favoritesCount } = await supabase
      .from('event_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count accepted friends
    const { count: friendsCount } = await supabase
      .from('user_friends')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    setStats({
      eventsCreated: eventsCount || 0,
      favorites: favoritesCount || 0,
      friends: friendsCount || 0
    });
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/src/assets/map-background.jpg')",
          filter: "blur(3px)"
        }}
      />
      {/* White Transparent Blur Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <Link 
            to="/" 
            className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          
          <h1 className="text-foreground text-lg font-semibold">Profile</h1>
          
          <button className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition-all">
            <Grid3x3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex-1 flex flex-col items-center px-6 pt-8">
          {/* Profile Picture with Circle Background */}
          <div className="relative mb-6">
            {/* Circle Background */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
              {/* Profile Image */}
              <div className="w-36 h-36 rounded-full overflow-hidden">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-all border-2 border-background">
              <Pencil className="w-4 h-4 text-background" />
            </button>
          </div>

          {/* Name */}
          <h2 className="text-foreground text-3xl font-bold mb-6 text-center leading-tight">
            {displayName}
          </h2>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.friends}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.eventsCreated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-lg font-medium">{stats.favorites}</span>
            </div>
          </div>

          {/* Navigation Tabs - 3 buttons only */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('hello')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${
                activeTab === 'hello'
                  ? 'bg-foreground text-background'
                  : 'bg-background/80 text-foreground hover:bg-background'
              }`}
            >
              Hello
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${
                activeTab === 'stats'
                  ? 'bg-foreground text-background'
                  : 'bg-background/80 text-foreground hover:bg-background'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2.5 rounded-full font-medium transition-all text-sm ${
                activeTab === 'photos'
                  ? 'bg-foreground text-background'
                  : 'bg-background/80 text-foreground hover:bg-background'
              }`}
            >
              Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
