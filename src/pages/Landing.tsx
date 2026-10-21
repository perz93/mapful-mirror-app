import { useQuery } from '@tanstack/react-query';
import { BellRing, ChevronDown, Lock, MapPin, Route, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { openInstallGuide } from '@/components/InstallGuide';
import ShimmerImage from '@/components/ShimmerImage';
import { focusPosition } from '@/lib/imageFocus';
import { softCase } from '@/lib/softCase';

/**
 * Page vitrine (« / » dans un navigateur). Tous les boutons mènent à
 * l'installation : la carte n'est accessible que dans l'app installée.
 */

const REASONS = [
  { icon: BellRing, title: 'Alerte quand ça bouge près de toi', text: "Un événement à 800 m ? Ton téléphone te prévient. Et un rappel 1 h avant que ça commence." },
  { icon: MapPin, title: 'Tout est sur la carte', text: 'Plus besoin de fouiller les statuts WhatsApp : lieu, date, heure et prix au même endroit.' },
  { icon: Route, title: "L'itinéraire en un geste", text: "Tu choisis, tu touches « Itinéraire », tu y vas. Même dans les quartiers que tu ne connais pas." },
  { icon: Sparkles, title: 'Gratuit, léger, sans store', text: "Installé en 3 gestes depuis ton navigateur. Elle prend presque pas de place sur ton téléphone." },
];

const STEPS = ['Ouvre la carte', 'Choisis ton event', "Vas-y avec l'itinéraire"];

const ORGANIZER_PERKS = [
  'Publie ton événement en 2 minutes, il apparaît tout de suite sur la carte.',
  'Les personnes autour reçoivent une alerte.',
  'Plusieurs types de places (Standard, VIP…) avec leurs prix.',
  'DJ, traiteurs, photographes : propose tes services sur le Marketplace.',
];

const FAQ = [
  { q: 'Upvibe est gratuit ?', a: 'Oui, totalement gratuit pour découvrir les sorties et pour publier tes événements.' },
  { q: 'Je dois passer par le Play Store ?', a: "Non. Upvibe s'installe directement depuis ton navigateur (Chrome sur Android, Safari sur iPhone), en 3 gestes. Pas de store, pas de téléchargement lourd." },
  { q: 'Ça marche sur iPhone et Android ?', a: "Oui, sur tous les smartphones récents. Sur iPhone, ouvre upvibe.app dans Safari pour l'installer." },
  { q: 'Comment publier mon événement ?', a: "Installe l'app, crée ton compte puis touche « Créer un événement » : titre, date, lieu, photo et prix. Il apparaît aussitôt sur la carte." },
];

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const Logo = ({ className = '' }: { className?: string }) => (
  <span className={`font-display text-[24px] !font-[800] tracking-[-0.05em] text-parchment ${className}`}>
    <span className="text-lime">up</span>vibe<span className="text-lime">.</span>
  </span>
);

const InstallButton = ({ children = 'Installer Upvibe', tone = 'ink', className = '' }: { children?: React.ReactNode; tone?: 'ink' | 'lime'; className?: string }) => (
  <button
    type="button"
    onClick={openInstallGuide}
    className={`flex h-14 w-full items-center justify-center rounded-full text-[16.5px] font-semibold transition active:scale-[0.98] lg:hidden ${
      tone === 'lime' ? 'bg-lime text-ink hover:bg-lime-deep' : 'bg-ink text-parchment'
    } ${className}`}
  >
    {children}
  </button>
);

/** Sur ordinateur : on installe depuis son téléphone en scannant le QR code */
const QrCard = ({ dark = false }: { dark?: boolean }) => (
  <div className={`hidden items-center gap-4 rounded-[24px] p-4 lg:flex ${dark ? 'bg-white/10' : 'bg-white'}`}>
    <img src="/landing/qr.svg" alt="QR code vers upvibe.app" className="size-[104px] rounded-xl bg-white p-1.5" />
    <div>
      <p className={`font-display text-[20px] leading-tight tracking-[-0.03em] ${dark ? 'text-parchment' : 'text-ink'}`}>Scanne avec ton téléphone</p>
      <p className={`mt-1 text-[14px] ${dark ? 'text-stone-300' : 'text-stone-500'}`}>Upvibe s'installe en 3 gestes, gratuitement.</p>
    </div>
  </div>
);

const Trust = ({ className = '' }: { className?: string }) => (
  <ul className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-ink ${className}`}>
    {['Gratuit', 'Sans Play Store', '3 gestes'].map((t) => (
      <li key={t} className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-ink" />{t}</li>
    ))}
  </ul>
);

interface UpcomingEvent {
  id: string; title: string; venue: string | null; date: string; time: string | null;
  image_url: string | null; image_focus: string | null;
}

const useUpcomingEvents = () =>
  useQuery({
    queryKey: ['landing-events'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('events')
        .select('id, title, venue, date, time, image_url, image_focus')
        .eq('is_published', true)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as UpcomingEvent[];
    },
    staleTime: 5 * 60 * 1000,
  });

const Landing = () => {
  const { data: events } = useUpcomingEvents();

  return (
    <div className="min-h-[100dvh] bg-parchment text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />

      {/* En-tête fixe */}
      <header className="sticky top-0 z-40 bg-ink" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <button type="button" onClick={openInstallGuide} className="rounded-full bg-lime px-4 py-2.5 text-[14px] font-semibold text-ink active:scale-95 lg:hidden">
            Installer l'appli
          </button>
          <span className="hidden text-[14px] text-stone-300 lg:block">Toutes les sorties d'Abidjan sur une carte</span>
        </div>
      </header>

      <main>
        {/* 1. Ce soir, tu fais quoi ? */}
        <section className="mx-auto grid max-w-6xl items-center gap-6 px-5 pt-8 lg:grid-cols-2 lg:gap-12 lg:pt-16">
          <div className="text-center lg:text-left">
            <h1 className="text-[52px] !font-[800] leading-[0.95] tracking-[-0.045em] lg:text-[84px]">
              Ce soir,<br />tu fais <span className="inline-block rounded-2xl bg-lime px-2.5 pb-1">quoi&nbsp;?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[340px] text-[17px] leading-snug text-stone-500 lg:mx-0 lg:max-w-[440px] lg:text-[20px]">
              La réponse est sur la carte. Toutes les sorties d'Abidjan, autour de toi.
            </p>
            <InstallButton className="mt-6">Installer Upvibe, c'est gratuit</InstallButton>
            <Trust className="justify-center lg:hidden" />
            <div className="mt-8"><QrCard /></div>
          </div>
          <img
            src="/landing/carte.webp"
            alt="La carte Upvibe avec les événements d'Abidjan : Pool party, Brunch des débout, Créative Meet'Up"
            width={1020}
            height={760}
            className="-mx-3 w-[calc(100%+24px)] max-w-none lg:mx-0 lg:w-full"
          />
        </section>

        {/* 2. Trouve. Sors. Vibe. */}
        <section className="overflow-hidden bg-lime">
          <div className="mx-auto grid max-w-6xl items-center gap-4 px-5 pt-10 lg:grid-cols-2 lg:gap-12 lg:py-16">
            <div>
              <h2 className="text-[64px] !font-[800] leading-[0.9] tracking-[-0.05em] lg:text-[96px]">Trouve.<br />Sors.<br />Vibe.</h2>
              <p className="mt-4 max-w-[320px] text-[17px] leading-snug lg:text-[20px]">L'app qui met toute la vie d'Abidjan sur une carte.</p>
              <ol className="mt-6 grid gap-3">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-3.5 font-display text-[22px] tracking-[-0.03em]">
                    <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[18px] text-parchment">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <InstallButton className="mt-7" />
            </div>
            <img
              src="/landing/telephones.webp"
              alt="Upvibe : la liste des événements et la fiche d'un événement sur la carte"
              width={659}
              height={830}
              loading="lazy"
              className="ml-[6%] w-[110%] max-w-none lg:ml-0 lg:w-full"
            />
          </div>
        </section>

        {/* 3. Pourquoi Upvibe */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <h2 className="max-w-[640px] text-[34px] !font-[700] leading-[0.98] tracking-[-0.04em] lg:text-[52px]">
            Pourquoi tout Abidjan passe par <span className="rounded-xl bg-lime px-2">Upvibe</span>
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[24px] bg-white p-5">
                <span className="flex size-12 items-center justify-center rounded-full bg-parchment"><Icon size={22} strokeWidth={1.75} /></span>
                <h3 className="mt-4 text-[20px] tracking-[-0.03em]">{title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-snug text-stone-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Prochains événements : les détails sont dans l'app */}
        {events && events.length > 0 && (
          <section className="mx-auto max-w-6xl pb-12 lg:pb-20">
            <h2 className="px-5 text-[34px] !font-[700] tracking-[-0.04em] lg:text-[52px]">Bientôt à Abidjan</h2>
            <div className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto px-5 pb-1">
              {events.map((e) => {
                const d = new Date(`${e.date}T12:00:00`);
                return (
                  <button key={e.id} type="button" onClick={openInstallGuide} className="w-[240px] flex-shrink-0 rounded-[24px] bg-white p-[7px] text-left active:scale-[0.98]">
                    {e.image_url
                      ? <ShimmerImage src={e.image_url} alt={softCase(e.title)} position={focusPosition(e.image_focus)} className="h-[124px] w-full rounded-[18px]" />
                      : <div className="h-[124px] rounded-[18px] bg-stone-200" />}
                    <div className="flex items-center gap-3 px-1.5 pb-1.5 pt-2.5">
                      <div className="border-r border-stone-200 pr-3 text-center leading-none">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em]">{d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</p>
                        <p className="mt-0.5 font-display text-[24px]">{d.getDate()}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[16px] tracking-[-0.02em]">{softCase(e.title)}</p>
                        <p className="truncate text-[12px] text-stone-500">{[e.venue?.split(',')[0], e.time?.slice(0, 5).replace(':', 'h')].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-[18px] bg-white px-4 py-3 text-[14px] font-semibold">
              <Lock size={18} strokeWidth={2} className="flex-shrink-0" />
              Les détails, les prix et l'itinéraire sont dans l'app.
            </div>
            <div className="px-5"><InstallButton className="mt-4">Voir tous les événements dans l'app</InstallButton></div>
          </section>
        )}

        {/* 5. Organisateurs */}
        <section className="bg-ink text-parchment">
          <div className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
            <h2 className="text-[34px] !font-[700] leading-[0.98] tracking-[-0.04em] text-parchment lg:text-[52px]">
              Tu organises ?<br /><span className="text-lime">Fais-toi voir.</span>
            </h2>
            <p className="mt-3 max-w-[520px] text-[16px] leading-snug text-stone-300">
              Promoteurs, bars, lounges, artistes, prestataires : Upvibe met ton événement devant ceux qui sortent.
            </p>
            <ul className="mt-6 grid max-w-[620px] gap-3">
              {ORGANIZER_PERKS.map((perk) => (
                <li key={perk} className="flex gap-3 text-[15px] leading-snug">
                  <span className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-lime text-[11px] font-bold text-ink">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <InstallButton tone="lime" className="mt-7">Installer et publier</InstallButton>
            <div className="mt-8 max-w-md"><QrCard dark /></div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-12 lg:py-20">
          <h2 className="text-[34px] !font-[700] tracking-[-0.04em] lg:text-[52px]">Questions fréquentes</h2>
          <div className="mt-4">
            {FAQ.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group border-b border-stone-200 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold">
                  {q}
                  <ChevronDown size={18} className="flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[14.5px] leading-snug text-stone-500">{a}</p>
              </details>
            ))}
          </div>
          <InstallButton className="mt-6" />
        </section>
      </main>

      <footer className="bg-black px-5 pb-36 pt-8 text-[13px] leading-7 text-stone-400 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          <Logo className="text-[22px]" />
          <p>Toutes les sorties d'Abidjan sur une carte.</p>
          <p><a href="mailto:contact@upvibe.app" className="hover:text-parchment">contact@upvibe.app</a> · Abidjan, Côte d'Ivoire</p>
        </div>
      </footer>

      {/* Bandeau fixe en bas (téléphone) */}
      <div className="fixed inset-x-2 z-40 lg:hidden" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-[30px] bg-ink py-3 pl-3 pr-3 text-parchment shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)]">
          <img src="/icon-192.png" alt="" className="size-11 flex-shrink-0 rounded-[12px] border border-white/10" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[15px] font-semibold">Ce soir, tu fais quoi ?</p>
            <p className="text-[12px] text-stone-400">Gratuit · installé en 3 gestes</p>
          </div>
          <button type="button" onClick={openInstallGuide} className="flex-shrink-0 rounded-full bg-lime px-4 py-2.5 text-[14px] font-bold text-ink active:scale-95">
            Installer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
