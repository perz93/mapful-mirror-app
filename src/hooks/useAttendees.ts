import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAttendees(eventId: string) {
  const { user } = useAuth();
  const [isGoing, setIsGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    // Fetch count + check if current user is going
    const fetch = async () => {
      const { count: total } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      setCount(total ?? 0);

      if (user) {
        const { data } = await supabase
          .from('event_attendees')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsGoing(!!data);
      }
    };

    fetch();

    // Realtime subscription for live updates
    const channel = supabase
      .channel(`attendees-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_attendees', filter: `event_id=eq.${eventId}` },
        () => { fetch(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, user]);

  const toggleGoing = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);

    try {
      if (isGoing) {
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        setIsGoing(false);
        setCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('event_attendees')
          .insert({ event_id: eventId, user_id: user.id });

        setIsGoing(true);
        setCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user, isGoing, loading]);

  return { isGoing, count, toggleGoing, loading };
}
