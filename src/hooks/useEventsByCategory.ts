import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';
import { eventCategoryKeys } from '@/lib/eventCategories';

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

      return data as Event[];
    },
    staleTime: 3 * 60 * 1000, // Fresh for 3 minutes
  });
};
