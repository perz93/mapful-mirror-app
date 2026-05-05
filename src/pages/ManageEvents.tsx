import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/hooks/useEvents';
import ManageEventCard from '@/components/ManageEventCard';
import mapBackground from '@/assets/map-background.jpg';

const ManageEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserEvents();
    }
  }, [user]);

  const loadUserEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleEventUpdated = () => {
    loadUserEvents();
  };

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in animate-zoom-smooth bg-stone-200">
      {/* Map Background — light natural */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={mapBackground} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="fixed inset-0 bg-white/30 backdrop-blur-xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: '12px' }}>
          <Link
            to="/my-account"
            className="w-11 h-11 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>

          <h1 className="text-stone-800 text-lg font-semibold italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Gérer mes événements</h1>

          <Link
            to="/create-event"
            className="w-11 h-11 rounded-full bg-primary backdrop-blur-md flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </Link>
        </div>

        {/* Events List */}
        <div className="flex-1 px-6 pb-8 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Vous n'avez créé aucun événement pour le moment</p>
              <Link
                to="/create-event"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Créer un événement
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event) => (
                <ManageEventCard 
                  key={event.id} 
                  event={event} 
                  onDeleted={handleEventDeleted}
                  onUpdated={handleEventUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
