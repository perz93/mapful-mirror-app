import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorite(eventId: string) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId || !user) return;

    const check = async () => {
      const { data } = await supabase
        .from('event_favorites')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    check();
  }, [eventId, user]);

  const toggleFavorite = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);

    try {
      if (isFavorite) {
        await supabase
          .from('event_favorites')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        setIsFavorite(false);
      } else {
        await supabase
          .from('event_favorites')
          .insert({ event_id: eventId, user_id: user.id });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user, isFavorite, loading]);

  return { isFavorite, toggleFavorite, loading };
}
