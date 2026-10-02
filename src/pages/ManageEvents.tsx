import { useState, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import { CalendarDays } from 'lucide-react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/hooks/useEvents';
import ManageEventCard from '@/components/ManageEventCard';
import { ManageEventsSkeleton } from '@/components/PageSkeleton';

const ManageEvents = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen relative overflow-hidden animate-fade-in animate-zoom-smooth bg-parchment">

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: '12px' }}>
          <Link
            to="/my-account"
            className="inline-flex size-10 items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} strokeWidth={1.75} className="text-ink" />
          </Link>

          <Link
            to="/create-event"
            aria-label={t('event.create')}
            className="inline-flex size-10 items-center justify-center rounded-full bg-lime text-ink hover:bg-lime-deep active:scale-95 transition-transform"
          >
            <Plus size={20} strokeWidth={1.75} />
          </Link>
        </div>
        <h1 className="px-5 pt-4 pb-2 text-[40px] leading-[0.95] tracking-tighter text-ink">{t('manage.title')}</h1>

        {/* Events List */}
        <div className="flex-1 px-6 pb-8 pt-4">
          {loading ? (
            <ManageEventsSkeleton />
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t('manage.noEvents')}
              action={
                <Link to="/create-event" className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime text-ink text-sm font-medium hover:bg-lime-deep transition-colors active:scale-95">
                  <Plus size={16} strokeWidth={1.75} />
                  {t('event.create')}
                </Link>
              }
            />
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
