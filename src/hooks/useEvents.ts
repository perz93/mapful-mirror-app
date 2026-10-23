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
  ticket_types?: unknown;
  /** Partie de l'affiche montrée dans les cadres (object-position) */
  image_focus?: string | null;
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

/**
 * Dernière liste d'événements gardée sur le téléphone : à l'ouverture, la carte
 * affiche tout de suite les pastilles connues, puis la liste est rafraîchie en
 * arrière-plan (elle est considérée comme ancienne, donc rechargée aussitôt).
 */
const EVENTS_CACHE_KEY = 'upvibe-events-cache-v1';
const MAX_CACHE_CHARS = 2_000_000; // ~2 Mo : au-delà, on ne garde rien plutôt que saturer le stockage

const readCachedEvents = (): { data: Event[]; savedAt: number } | undefined => {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.data) && typeof parsed.savedAt === 'number' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const writeCachedEvents = (data: Event[]) => {
  try {
    const raw = JSON.stringify({ data, savedAt: Date.now() });
    if (raw.length <= MAX_CACHE_CHARS) localStorage.setItem(EVENTS_CACHE_KEY, raw);
    else localStorage.removeItem(EVENTS_CACHE_KEY);
  } catch { /* stockage plein ou indisponible : sans cache */ }
};

export const useEvents = () => {
  const cached = readCachedEvents();
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Tous les événements publiés (passés compris), plafonnés aux 1 500 plus récents
      // pour que l'app reste légère quand il y en aura des milliers.
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(1500);

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      const events = (data as Event[]).reverse(); // du plus ancien au plus récent, comme avant
      writeCachedEvents(events);
      return events;
    },
    // Affichage immédiat depuis le téléphone ; daté de 0 pour forcer le rechargement en arrière-plan
    initialData: cached?.data,
    initialDataUpdatedAt: cached ? 0 : undefined,
    staleTime: 3 * 60 * 1000, // Fresh for 3 minutes
  });
};
