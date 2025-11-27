import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching featured events:', error);
        throw error;
      }

      return data as Event[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
