import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';
import { eventStart, isUpcomingOrLive, todayIso } from '@/lib/eventStatus';

const MAX_FEATURED = 6;

/**
 * Événements du cadre de la carte : ceux en cours d'abord, puis les prochains
 * par date de début (le plus proche en premier). Les événements terminés ne
 * sont montrés que s'il n'y a plus rien à venir.
 */
export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const today = todayIso();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .or(`date.gte.${today},end_date.gte.${today}`)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(30);

      if (error) {
        console.error('Error fetching featured events:', error);
        throw error;
      }

      const upcoming = (data as Event[])
        .filter(isUpcomingOrLive)
        .sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime())
        .slice(0, MAX_FEATURED);
      if (upcoming.length > 0) return upcoming;

      // Rien à venir : les derniers événements passés, pour ne pas laisser la carte vide
      const { data: past } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(3);
      return (past ?? []) as Event[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
