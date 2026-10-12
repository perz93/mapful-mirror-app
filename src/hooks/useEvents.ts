import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  /** Ville / localité (géocodage inverse à la création) */
  city?: string | null;
  address: string | null;
  category: string;
  date: string;
  time: string;
  /** Dernier jour si l'événement dure plusieurs jours */
  end_date?: string | null;
  /** Heure de fin facultative */
  end_time?: string | null;
  price: number | null;
  capacity: number | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  is_paid: boolean;
  is_published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data as Event[];
    },
    staleTime: 3 * 60 * 1000, // Fresh for 3 minutes
  });
};
