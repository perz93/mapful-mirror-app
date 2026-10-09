import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProfile, profileDisplayName, initials } from '@/hooks/usePublicProfile';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrganizerCardProps {
  userId?: string | null;
  /** « event » → « Organisé par », « listing » → « Vendu par » */
  kind: 'event' | 'listing';
}

/** Carte « Organisé par / Vendu par » qui ouvre le profil public. */
const OrganizerCard = ({ userId, kind }: OrganizerCardProps) => {
  const { lang } = useLanguage();
  const { data: profile } = usePublicProfile(userId);
  const { data: counts } = useQuery({
    queryKey: ['public-profile-counts', userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const [ev, li] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('user_id', userId!).eq('is_published', true),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }).eq('user_id', userId!).eq('is_published', true),
      ]);
      return { events: ev.count ?? 0, listings: li.count ?? 0 };
    },
  });

  if (!userId) return null;
  const name = profileDisplayName(profile, lang);
  const fr = lang === 'fr';
  const label = kind === 'event' ? (fr ? 'Organisé par' : 'Hosted by') : (fr ? 'Vendu par' : 'Sold by');
  const sub = counts
    ? kind === 'event'
      ? `${counts.events} ${fr ? (counts.events > 1 ? 'événements' : 'événement') : counts.events > 1 ? 'events' : 'event'}`
      : `${counts.listings} ${fr ? (counts.listings > 1 ? 'annonces' : 'annonce') : counts.listings > 1 ? 'listings' : 'listing'}`
    : '';
  const since = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;

  return (
    <Link
      to={`/u/${userId}`}
      className="card-shadow flex w-full items-center gap-3.5 rounded-[20px] bg-white dark:bg-stone-900 p-3.5 active:scale-[0.99] transition-transform"
    >
      <span className="flex size-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-parchment text-sm font-semibold text-ink">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-stone-500">{label}</span>
        <span className="mt-0.5 block truncate font-medium text-ink dark:text-white">{name}</span>
        {(sub || since) && (
          <span className="block truncate text-xs text-stone-500">
            {[sub, since && (fr ? `membre depuis ${since}` : `member since ${since}`)].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
      <ChevronRight size={18} strokeWidth={1.75} className="flex-shrink-0 text-stone-400" />
    </Link>
  );
};

export default OrganizerCard;
