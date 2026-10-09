import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';
import { ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePublicProfile, profileDisplayName, initials } from '@/hooks/usePublicProfile';
import { useDarkPageBackground } from '@/hooks/useDarkPageBackground';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactFab from '@/components/ContactFab';
import ShimmerImage from '@/components/ShimmerImage';
import { toast } from '@/components/PillToast';

interface ProfileEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue: string | null;
  image_url: string | null;
  created_at: string;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_instagram: string | null;
  contact_facebook: string | null;
  contact_tiktok: string | null;
  contact_twitter: string | null;
  contact_email: string | null;
}

interface ProfileListing extends Omit<ProfileEvent, 'date' | 'time' | 'venue'> {
  location: string | null;
  price: number | null;
}

const CONTACT_COLS =
  'contact_phone, contact_whatsapp, contact_instagram, contact_facebook, contact_tiktok, contact_twitter, contact_email';

const hasContact = (c: Partial<ProfileEvent>) =>
  !!(c.contact_phone || c.contact_whatsapp || c.contact_instagram || c.contact_facebook || c.contact_tiktok || c.contact_twitter || c.contact_email);

/** Profil public « affiche » d'un organisateur ou d'un vendeur. */
const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const fr = lang === 'fr';
  const locale = fr ? frLocale : enUS;

  const { data: profile, isLoading: loadingProfile } = usePublicProfile(id);
  const { data, isLoading } = useQuery({
    queryKey: ['public-profile-content', id],
    enabled: !!id,
    queryFn: async () => {
      const [ev, li] = await Promise.all([
        supabase
          .from('events')
          .select(`id, title, date, time, venue, image_url, created_at, ${CONTACT_COLS}`)
          .eq('user_id', id!)
          .eq('is_published', true)
          .order('date', { ascending: false }),
        supabase
          .from('marketplace_listings')
          .select(`id, title, location, price, image_url, created_at, ${CONTACT_COLS}`)
          .eq('user_id', id!)
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
      ]);
      return {
        events: (ev.data ?? []) as unknown as ProfileEvent[],
        listings: (li.data ?? []) as unknown as ProfileListing[],
      };
    },
  });

  const loaded = !isLoading && !loadingProfile;
  useDarkPageBackground(loaded);

  const name = profileDisplayName(profile, lang);
  const events = data?.events ?? [];
  const listings = data?.listings ?? [];
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  // Bannière : les affiches les plus récentes (événements puis annonces)
  const banner = [...events, ...listings]
    .filter((x) => x.image_url)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3)
    .map((x) => x.image_url as string);

  // Contact : celui de la publication la plus récente qui en a un
  const contact = [...events, ...listings]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .find(hasContact);

  const since = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;
  const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: name, url }).catch(() => {});
    else {
      navigator.clipboard.writeText(url);
      toast.success(fr ? 'Lien copié' : 'Link copied');
    }
  };

  const roundBtn = 'inline-flex size-12 btn-float items-center justify-center rounded-full bg-white text-ink active:scale-95 transition-transform';

  if (!loaded) {
    return (
      <div className="min-h-screen bg-parchment animate-fade-in">
        <div className="mx-auto max-w-md">
          <div className="skeleton h-[230px]" />
          <div className="px-4">
            <div className="skeleton -mt-10 size-20 rounded-full ring-4 ring-parchment" />
            <div className="skeleton mt-4 h-8 w-2/3 rounded-xl" />
            <div className="skeleton mt-3 h-6 w-1/2 rounded-full" />
            <div className="skeleton mt-8 h-20 rounded-[20px]" />
            <div className="skeleton mt-2 h-20 rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment p-6 text-center">
        <p className="text-lg font-medium text-ink">{fr ? 'Profil introuvable' : 'Profile not found'}</p>
        <button onClick={() => navigate(-1)} className="h-11 rounded-full bg-ink px-5 text-sm font-medium text-parchment">
          {fr ? 'Retour' : 'Back'}
        </button>
      </div>
    );
  }

  const Row = ({ to, image, title, sub }: { to: string; image: string | null; title: string; sub: string }) => (
    <Link to={to} className="card-shadow flex items-center gap-3 rounded-[20px] bg-white p-2.5 active:scale-[0.99] transition-transform">
      <div className="size-14 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-200">
        {image && <ShimmerImage src={image} alt="" className="h-full w-full" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{title}</p>
        <p className="mt-0.5 truncate text-xs text-stone-500 first-letter:uppercase">{sub}</p>
      </div>
    </Link>
  );

  const eventSub = (e: ProfileEvent) =>
    [format(new Date(e.date), fr ? 'EEE d MMM' : 'EEE, MMM d', { locale }).replace('.', ''), e.time?.slice(0, 5), e.venue]
      .filter(Boolean)
      .join(' · ');

  return (
    <div className="min-h-screen bg-parchment page-enter">
      <div className="relative mx-auto max-w-md pb-32">
        {/* Bannière faite des affiches de la personne */}
        <div className="relative h-[230px] overflow-hidden">
          {banner.length === 0 ? (
            <div className="h-full w-full bg-[linear-gradient(135deg,#14140f_0%,#2b3a12_60%,#a6e22e_140%)]" />
          ) : banner.length === 1 ? (
            <ShimmerImage src={banner[0]} alt="" loading="eager" className="h-full w-full" />
          ) : (
            <div className="grid h-full grid-cols-[2fr_1fr] gap-[3px]">
              <ShimmerImage src={banner[0]} alt="" loading="eager" className="h-full w-full" />
              <div className={`grid gap-[3px] ${banner.length > 2 ? 'grid-rows-2' : ''}`}>
                {banner.slice(1).map((src) => (
                  <ShimmerImage key={src} src={src} alt="" loading="eager" className="h-full w-full" />
                ))}
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,15,0.35)_0%,rgba(20,20,15,0)_35%,rgba(245,245,235,0)_60%,#f5f5eb_100%)]" />
        </div>

        <div
          className="fixed inset-x-0 z-30 mx-auto flex max-w-md items-center justify-between px-4"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <button onClick={() => navigate(-1)} aria-label={fr ? 'Retour' : 'Back'} className={roundBtn}>
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <button onClick={handleShare} aria-label={t('event.share')} className={roundBtn}>
            <Share2 size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative -mt-12 px-4">
          <span className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-semibold text-ink ring-4 ring-parchment">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(name)}
          </span>
          <h1 className="mt-3 text-[32px] leading-[1] tracking-tighter text-ink">{name}</h1>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {events.length > 0 && (
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-medium text-ink">
                {plural(events.length, fr ? 'événement' : 'event', fr ? 'événements' : 'events')}
              </span>
            )}
            {listings.length > 0 && (
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-medium text-ink">
                {plural(listings.length, fr ? 'annonce' : 'listing', fr ? 'annonces' : 'listings')}
              </span>
            )}
            {since && (
              <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-medium text-stone-600">
                {fr ? `Membre depuis ${since}` : `Member since ${since}`}
              </span>
            )}
          </div>

          {profile.bio && <p className="mt-4 text-[15px] leading-[1.5] text-ink/80 whitespace-pre-line">{profile.bio}</p>}

          <div className="mt-7 space-y-7">
            {upcoming.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3 text-stone-500">{fr ? 'Prochains événements' : 'Upcoming events'}</h2>
                <div className="space-y-2">
                  {upcoming.map((e) => <Row key={e.id} to={`/event/${e.id}`} image={e.image_url} title={e.title} sub={eventSub(e)} />)}
                </div>
              </section>
            )}

            {listings.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3 text-stone-500">{fr ? 'Annonces Market' : 'Market listings'}</h2>
                <div className="space-y-2">
                  {listings.map((l) => (
                    <Row
                      key={l.id}
                      to={`/listing/${l.id}`}
                      image={l.image_url}
                      title={l.title}
                      sub={[l.price != null ? `${l.price.toLocaleString('fr-FR')} FCFA` : null, l.location].filter(Boolean).join(' · ')}
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3 text-stone-500">{fr ? 'Événements passés' : 'Past events'}</h2>
                <div className="space-y-2 opacity-80">
                  {past.map((e) => <Row key={e.id} to={`/event/${e.id}`} image={e.image_url} title={e.title} sub={eventSub(e)} />)}
                </div>
              </section>
            )}

            {events.length === 0 && listings.length === 0 && (
              <p className="rounded-[20px] bg-white p-5 text-center text-sm text-stone-500">
                {fr ? 'Aucune publication pour le moment.' : 'Nothing published yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barre fixe : contacter la personne */}
      {contact && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex h-16 items-center justify-between gap-2 rounded-full bg-ink pl-6 pr-2 shadow-2xl">
            <p className="min-w-0 truncate font-display text-[18px] leading-none tracking-tight text-parchment">{name}</p>
            <ContactFab
              variant="pill"
              label={t('event.contact')}
              closeLabel={t('close')}
              contactPhone={contact.contact_phone}
              contactWhatsapp={contact.contact_whatsapp}
              contactInstagram={contact.contact_instagram}
              contactFacebook={contact.contact_facebook}
              contactTiktok={contact.contact_tiktok}
              contactTwitter={contact.contact_twitter}
              contactEmail={contact.contact_email}
              emailSubject={name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
