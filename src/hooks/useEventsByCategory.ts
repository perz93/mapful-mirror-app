import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';
import { eventCategoryKeys } from '@/lib/eventCategories';
import { eventEnd, isUpcomingOrLive } from '@/lib/eventStatus';

export const useEventsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['events', 'category', category],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_published', true);
      // « all » : tous les événements, sinon la catégorie (anciennes clés incluses)
      if (category !== 'all') query = query.in('category', eventCategoryKeys(category));
      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events by category:', error);
        throw error;
      }

      // À venir / en cours d'abord, les plus récemment publiés en tête ;
      // les événements terminés ensuite (du plus récent au plus ancien).
      const all = data as Event[];
      const upcoming = all
        .filter(isUpcomingOrLive)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      const ended = all
        .filter((e) => !isUpcomingOrLive(e))
        .sort((a, b) => eventEnd(b).getTime() - eventEnd(a).getTime());
      return [...upcoming, ...ended];
    },
    staleTime: 3 * 60 * 1000, // Fresh for 3 minutes
  });
};
