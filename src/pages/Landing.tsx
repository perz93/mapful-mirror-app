import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BellRing, ChevronDown, MapPin, Route, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { openInstallGuide } from '@/components/InstallGuide';
import ShimmerImage from '@/components/ShimmerImage';
import { focusPosition } from '@/lib/imageFocus';
import { softCase } from '@/lib/softCase';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplaceCategories';

/**
 * Page vitrine (« / » dans un navigateur). Elle s'adresse aux trois publics
 * d'Upvibe (ceux qui sortent, les organisateurs, les prestataires) et ne
 * propose qu'une action : installer l'app (en-tête et bandeau flottant).
 */

const AUDIENCES = [
  { href: '#sortir', label: 'Je sors' },
  { href: '#organiser', label: "J'organise" },
  { href: '#prestataires', label: 'Je propose mes services' },
];

const STEPS = ['Ouvre la carte', 'Choisis ton event', "Vas-y avec l'itinéraire"];

const ORGANIZER_PERKS = [
  'Publie ton événement en 2 minutes : il apparaît tout de suite sur la carte.',
  'Les personnes autour reçoivent une alerte, et un rappel avant le début.',
  'Plusieurs types de places (Standard, VIP, VVIP…) avec leurs prix.',
  'Ton WhatsApp, ton Instagram et ton numéro sur ta fiche : on te contacte direct.',
];

const PROVIDER_PERKS = [
  'Ton annonce avec photos, prix et quartier, visible par tous les organisateurs.',
  'Les clients te contactent par appel, WhatsApp ou e-mail, sans intermédiaire.',
  "Ton profil regroupe tes annonces : un seul lien à partager.",
];

const REASONS = [
  { icon: BellRing, title: 'Alerte quand ça bouge près de toi', text: 'Un événement à 800 m ? Ton téléphone te prévient. Et un rappel 1 h avant que ça commence.' },
  { icon: MapPin, title: 'Tout est sur la carte', text: 'Plus besoin de fouiller les statuts WhatsApp : lieu, date, heure et prix au même endroit.' },
  { icon: Route, title: "L'itinéraire en un geste", text: 'Tu choisis, tu touches « Itinéraire », tu y vas. Même dans les quartiers que tu ne connais pas.' },
  { icon: Smartphone, title: 'Gratuit, léger, sans store', text: "Installé en 3 gestes depuis ton navigateur. Elle prend presque pas de place sur ton téléphone." },
];

const FAQ = [
  { q: 'Upvibe est gratuit ?', a: 'Oui, totalement gratuit pour découvrir les sorties, publier tes événements et proposer tes services.' },
  { q: 'Je dois passer par le Play Store ?', a: "Non. Upvibe s'installe directement depuis ton navigateur (Chrome sur Android, Safari sur iPhone), en 3 gestes. Pas de store, pas de téléchargement lourd." },
  { q: 'Ça marche sur iPhone et Android ?', a: "Oui, sur tous les smartphones récents. Sur iPhone, ouvre upvibe.app dans Safari pour l'installer." },
  { q: 'Comment publier mon événement ?', a: "Installe l'app, crée ton compte puis touche « Créer un événement » : titre, date, lieu, photo et prix des places. Il apparaît aussitôt sur la carte." },
  { q: 'Je suis prestataire, comment être visible ?', a: "Crée ton compte puis publie une annonce sur le Marketplace : photos, prix, quartier et contacts. Les organisateurs te trouvent par catégorie (DJ, traiteur, déco, photo…)." },
];

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});


type RevealEffect = 'up' | 'rise' | 'left' | 'right' | 'pop';

/** Fait apparaître son contenu quand il entre à l'écran (une seule fois) */
const Reveal = ({ children, effect = 'up', delay = 0, className = '', as: Tag = 'div' }: {
  children: React.ReactNode; effect?: RevealEffect; delay?: number; className?: string; as?: 'div' | 'li' | 'span';
}) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal reveal-${effect} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
};

/** Défilement fluide vers une section (sous l'en-tête fixe) */
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', href);
};

const Logo = ({ className = '' }: { className?: string }) => (
  <span className={`font-display text-[24px] !font-[800] tracking-[-0.05em] text-parchment ${className}`}>
    <span className="text-lime">up</span>vibe<span className="text-lime">.</span>
  </span>
);

/** Vraie capture de l'app dans un cadre de téléphone (net sur tous les écrans) */
const Phone = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <div className={`rounded-[48px] bg-ink p-[9px] shadow-[0_30px_60px_-24px_rgba(20,20,15,0.55)] ${className}`}>
    <img src={src} alt={alt} width={660} height={1431} loading="lazy" className="block w-full rounded-[40px]" />
  </div>
);

/** Téléphone qui « sort » du bas de la section */
const RisingPhone = (props: { src: string; alt: string }) => (
  <div className="mx-auto h-[440px] w-[270px] overflow-hidden lg:h-[560px] lg:w-[330px]">
    <Reveal effect="rise"><Phone {...props} /></Reveal>
  </div>
);

const Eyebrow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${className}`}>{children}</p>
);

const Checks = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
  <ul className="mt-6 grid max-w-[560px] gap-3">
    {items.map((item, i) => (
      <Reveal as="li" key={item} delay={i * 160} className={`flex gap-3 text-[15.5px] leading-snug ${dark ? 'text-parchment' : 'text-ink'}`}>
        <span className={`mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${dark ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}>✓</span>
        {item}
      </Reveal>
    ))}
  </ul>
);

/** Sur ordinateur : on installe depuis son téléphone en scannant le QR code */
const QrCard = () => (
  <div className="hidden items-center gap-4 rounded-[24px] bg-white p-4 lg:flex">
    <img src="/landing/qr.svg" alt="QR code vers upvibe.app" className="size-[104px] rounded-xl bg-white p-1.5" />
    <div>
      <p className="font-display text-[20px] leading-tight tracking-[-0.03em] text-ink">Scanne avec ton téléphone</p>
      <p className="mt-1 text-[14px] text-stone-500">Upvibe s'installe en 3 gestes, gratuitement.</p>
    </div>
  </div>
);

/** Pastille d'événement, comme sur la carte */
const Pin = ({ label, time, dot = 'lime', delay = 0, className = '' }: { label: string; time: string; dot?: 'lime' | 'ink'; delay?: number; className?: string }) => (
  <span className={`absolute ${className}`}>
    <Reveal as="span" effect="pop" delay={delay} className="block">
      <span className="landing-float flex items-center gap-2 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[15px] font-bold shadow-[0_12px_28px_-12px_rgba(20,20,15,0.5)]" style={{ '--float-delay': `${delay / 1000}s` } as React.CSSProperties}>
        <span className={`size-7 rounded-full ${dot === 'lime' ? 'bg-lime' : 'bg-ink'}`} />
        {label}<span className="text-[#6fae12]">· {time}</span>
      </span>
    </Reveal>
  </span>
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
        <section className="mx-auto grid max-w-6xl items-center gap-10 overflow-hidden px-5 pb-12 pt-8 lg:grid-cols-2 lg:pt-16">
          <div className="text-center lg:text-left">
            <Reveal><h1 className="text-[52px] !font-[800] leading-[0.95] tracking-[-0.045em] lg:text-[84px]">
              Ce soir,<br />tu fais <span className="inline-block rounded-2xl bg-lime px-2.5 pb-1">quoi&nbsp;?</span>
            </h1></Reveal>
            <Reveal delay={220}><p className="mx-auto mt-4 max-w-[360px] text-[17px] leading-snug text-stone-500 lg:mx-0 lg:max-w-[460px] lg:text-[20px]">
              Sortir, organiser, proposer tes services : tout Abidjan se retrouve sur une seule carte.
            </p></Reveal>
            <nav aria-label="Pour qui ?" className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {AUDIENCES.map(({ href, label }, i) => (
                <Reveal as="span" key={href} effect="pop" delay={400 + i * 140}>
                <a href={href} onClick={(e) => scrollToSection(e, href)} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[14px] font-semibold text-ink active:scale-95">
                  {label}
                </a>
                </Reveal>
              ))}
            </nav>
            <div className="mt-8"><QrCard /></div>
          </div>
          <div className="relative mx-auto w-[260px] lg:w-[300px]">
            <Reveal effect="rise" delay={300}><Phone src="/landing/ecran-carte.webp" alt="La carte Upvibe avec les événements d'Abidjan" /></Reveal>
            <Pin label="Pool party" time="21h" delay={1100} className="-left-14 top-[26%]" />
            <Pin label="Brunch des débout" time="13h" dot="ink" delay={1450} className="-right-16 top-[48%]" />
            <Pin label="Créative Meet'Up" time="11h" delay={1800} className="-left-12 top-[70%]" />
          </div>
        </section>

        {/* 2. Pour ceux qui sortent */}
        <section id="sortir" className="scroll-mt-16 overflow-hidden bg-lime">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pt-12 lg:grid-cols-2 lg:pt-20">
            <Reveal className="lg:pb-20">
              <Eyebrow className="bg-ink text-lime">Pour sortir</Eyebrow>
              <h2 className="mt-4 text-[64px] !font-[800] leading-[0.9] tracking-[-0.05em] lg:text-[96px]">Trouve.<br />Sors.<br />Vibe.</h2>
              <p className="mt-4 max-w-[340px] text-[17px] leading-snug lg:text-[20px]">Concerts, soirées, festivals, brunchs, expos : tout ce qui se passe autour de toi, en un coup d'œil.</p>
              <ol className="mt-6 grid gap-3">
                {STEPS.map((step, i) => (
                  <Reveal as="li" key={step} effect="left" delay={300 + i * 220} className="flex items-center gap-3.5 font-display text-[22px] tracking-[-0.03em]">
                    <span className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[18px] text-parchment">{i + 1}</span>
                    {step}
                  </Reveal>
                ))}
              </ol>
            </Reveal>
            <RisingPhone src="/landing/ecran-evenements.webp" alt="La liste des événements dans Upvibe" />
          </div>
        </section>

        {/* 3. Pour les organisateurs */}
        <section id="organiser" className="scroll-mt-16 overflow-hidden bg-ink text-parchment">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pt-12 lg:grid-cols-2 lg:pt-20">
            <Reveal className="lg:order-2 lg:pb-20">
              <Eyebrow className="bg-lime text-ink">Pour les organisateurs</Eyebrow>
              <h2 className="mt-4 text-[44px] !font-[800] leading-[0.95] tracking-[-0.045em] text-parchment lg:text-[68px]">
                Tu organises ?<br /><span className="text-lime">Fais-toi voir.</span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[17px] leading-snug text-stone-300">
                Promoteurs, bars, lounges, artistes, associations : Upvibe met ton événement devant ceux qui sortent, au moment où ils cherchent quoi faire.
              </p>
              <Checks items={ORGANIZER_PERKS} dark />
            </Reveal>
            <div className="lg:order-1">
              <RisingPhone src="/landing/ecran-organisateur.webp" alt="Fiche d'un concert avec ses places Standard, VIP et VVIP" />
            </div>
          </div>
        </section>

        {/* 4. Pour les prestataires */}
        <section id="prestataires" className="scroll-mt-16 overflow-hidden bg-white">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pt-12 lg:grid-cols-2 lg:pt-20">
            <Reveal className="lg:pb-20">
              <Eyebrow className="bg-parchment text-ink">Pour les prestataires</Eyebrow>
              <h2 className="mt-4 text-[44px] !font-[800] leading-[0.95] tracking-[-0.045em] lg:text-[68px]">
                Tes services,<br /><span className="rounded-xl bg-lime px-2">devant les clients.</span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[17px] leading-snug text-stone-500">
                DJ, traiteur, déco, photographe, location de salle ou de matériel : le Marketplace Upvibe te met en relation avec ceux qui organisent.
              </p>
              <ul className="mt-5 flex max-w-[560px] flex-wrap gap-2">
                {MARKETPLACE_CATEGORIES.filter((c) => c.value !== 'autre').map((c, i) => (
                  <Reveal as="li" key={c.value} effect="pop" delay={i * 110} className="rounded-full bg-parchment px-3.5 py-1.5 text-[13.5px] font-semibold">{c.fr}</Reveal>
                ))}
              </ul>
              <Checks items={PROVIDER_PERKS} />
            </Reveal>
            <RisingPhone src="/landing/ecran-marketplace.webp" alt="Le Marketplace Upvibe : lieux, traiteurs, matériel" />
          </div>
        </section>

        {/* 5. Pourquoi Upvibe */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:py-20">
          <Reveal><h2 className="max-w-[640px] text-[34px] !font-[700] leading-[0.98] tracking-[-0.04em] lg:text-[52px]">
            Pourquoi tout Abidjan passe par <span className="rounded-xl bg-lime px-2">Upvibe</span>
          </h2></Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 160} className="rounded-[24px] bg-white p-5">
                <span className="flex size-12 items-center justify-center rounded-full bg-parchment"><Icon size={22} strokeWidth={1.75} /></span>
                <h3 className="mt-4 text-[20px] tracking-[-0.03em]">{title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-snug text-stone-500">{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. Prochains événements (ouvrent l'installation) */}
        {events && events.length > 0 && (
          <section className="mx-auto max-w-6xl pb-12 lg:pb-20">
            <Reveal><h2 className="px-5 text-[34px] !font-[700] tracking-[-0.04em] lg:text-[52px]">Bientôt à Abidjan</h2></Reveal>
            <Reveal effect="right" delay={250} className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto px-5 pb-1">
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
            </Reveal>
          </section>
        )}

        {/* 7. FAQ */}
        <section className="mx-auto max-w-3xl px-5 pb-12 pt-4 lg:pb-20">
          <Reveal><h2 className="text-[34px] !font-[700] tracking-[-0.04em] lg:text-[52px]">Questions fréquentes</h2></Reveal>
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
