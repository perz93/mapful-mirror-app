import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';
import { eventCategoryKeys } from '@/lib/eventCategories';

export const useEventsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['events', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .in('category', eventCategoryKeys(category))
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events by category:', error);
        throw error;
      }

      return data as Event[];
    },
    staleTime: 3 * 60 * 1000, // Fresh for 3 minutes
  });
};
