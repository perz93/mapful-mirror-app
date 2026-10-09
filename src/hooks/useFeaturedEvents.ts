import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event } from './useEvents';
import { eventStart, isUpcomingOrLive, todayIso } from '@/lib/eventStatus';

const MAX_FEATURED = 6;
/** En dessous, le cadre est complété par les derniers événements passés. */
const MIN_FEATURED = 5;

/**
 * Événements du cadre de la carte : ceux en cours d'abord, puis les prochains
 * par date de début (le plus proche en premier). S'il y en a moins de 5, on
 * complète avec les derniers événements passés pour que le cadre défile.
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
      if (upcoming.length >= MIN_FEATURED) return upcoming;

      // Pas assez d'événements à venir pour que le cadre défile : on complète
      // avec les plus récents déjà passés (affichés « Terminé »), après ceux à venir.
      const { data: past } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .lt('date', today)
        .order('date', { ascending: false })
        .limit(MIN_FEATURED);
      const seen = new Set(upcoming.map((e) => e.id));
      const filler = ((past ?? []) as Event[]).filter((e) => !seen.has(e.id) && !isUpcomingOrLive(e));
      return [...upcoming, ...filler].slice(0, Math.max(MIN_FEATURED, upcoming.length));
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
