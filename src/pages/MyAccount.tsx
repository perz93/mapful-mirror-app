import { useState, useEffect } from 'react';
import { ArrowLeft, Grid3x3, Pencil, Users, FileText, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MyAccount = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('hello');

  useEffect(() => {
    if (user) {
      loadProfile();
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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-700 to-orange-600" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <Link 
            to="/" 
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          
          <h1 className="text-white text-lg font-medium">Profile</h1>
          
          <button className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/20">
            <Grid3x3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex-1 flex flex-col items-center px-6 pt-8">
          {/* Profile Picture with Circle Background */}
          <div className="relative mb-8">
            {/* Yellow Circle Background */}
            <div className="w-56 h-56 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              {/* Profile Image */}
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">{initials}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Experience Badge - Curved Text */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="text-white text-xs font-medium tracking-wide whitespace-nowrap">
                12 years experience
              </div>
            </div>
            
            {/* Edit Button */}
            <button className="absolute bottom-2 right-2 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 transition-all border-4 border-white/20">
              <Pencil className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Name */}
          <h2 className="text-white text-4xl font-bold mb-8 text-center leading-tight">
            {displayName}
          </h2>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white/90" />
              <span className="text-white text-lg font-medium">275K</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-white/90" />
              <span className="text-white text-lg font-medium">2,963</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-white/90" />
              <span className="text-white text-lg font-medium">581</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab('hello')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'hello'
                  ? 'bg-white text-gray-900'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
            >
              Hello
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-gray-900'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'photos'
                  ? 'bg-white text-gray-900'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-gray-900'
                  : 'bg-black/70 text-white hover:bg-black/90'
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
