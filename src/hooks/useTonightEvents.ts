import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';

export const useTonightEvents = () => {
  return useQuery({
    queryKey: ['events', 'tonight'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching tonight events:', error);
        throw error;
      }

      return data as Event[];
    },
    refetchInterval: 60_000,
  });
};
