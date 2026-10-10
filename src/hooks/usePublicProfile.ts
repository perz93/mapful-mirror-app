import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
}

/**
 * Profil public (nom, photo, bio, date d'inscription) via la fonction SQL
 * get_public_profile : la table profiles reste privée (e-mail).
 */
export const usePublicProfile = (userId?: string | null) =>
  useQuery({
    queryKey: ['public-profile', userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<PublicProfile | null> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('get_public_profile', { p_user_id: userId });
      if (error) throw error;
      return (Array.isArray(data) ? data[0] : data) ?? null;
    },
  });

export const profileDisplayName = (p: PublicProfile | null | undefined, lang: string) =>
  p?.full_name?.trim() || (lang === 'fr' ? 'Membre VIBE' : 'VIBE member');

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'V';
