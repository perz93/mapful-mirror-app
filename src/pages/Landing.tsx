import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BellRing, ChevronDown, MapPin, Route, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { openInstallGuide } from '@/components/InstallGuide';
import ShimmerImage from '@/components/ShimmerImage';
import { focusPosition } from '@/lib/imageFocus';
import { softCase } from '@/lib/softCase';

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
  'Publié en 2 minutes, visible tout de suite sur la carte.',
  'Une alerte aux personnes autour.',
  'Places Standard, VIP, VVIP avec leurs prix.',
];

const PROVIDER_PERKS = [
  { title: 'Ta vitrine', text: 'Photos, prix et quartier : ton annonce est vue par tous les organisateurs.' },
  { title: 'Contact direct', text: 'Appel, WhatsApp ou e-mail. Pas d’intermédiaire, pas de commission.' },
  { title: 'Un seul lien', text: 'Ton profil regroupe toutes tes annonces, prêt à partager.' },
];

const REASONS = [
  { icon: BellRing, title: 'Alertes près de toi', text: 'Un événement à 800 m ? Ton téléphone te prévient, et te rappelle 1 h avant.' },
  { icon: MapPin, title: 'Tout sur la carte', text: 'Plus besoin de fouiller les statuts WhatsApp : lieu, heure et prix au même endroit.' },
  { icon: Route, title: 'Itinéraire en un geste', text: 'Tu touches « Itinéraire », tu y vas. Même dans un quartier que tu ne connais pas.' },
  { icon: Smartphone, title: 'Gratuit, sans store', text: 'Installé en 3 gestes depuis ton navigateur, presque sans place sur ton téléphone.' },
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
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
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

const Logo = ({ className = 'h-8' }: { className?: string }) => (
  <img src="/landing/logo.png" alt="Upvibe" width={278} height={96} className={`w-auto ${className}`} />
);

/** Vraie capture de l'app dans un cadre de téléphone incliné, posé sur une scène */
const TiltPhone = ({ src, alt, rotate, delay = 0, className = '' }: { src: string; alt: string; rotate: number; delay?: number; className?: string }) => (
  <div className={`absolute ${className}`}>
    <Reveal effect="rise" delay={delay}>
      <div className="rounded-[30px] bg-ink p-[6px] shadow-[0_26px_50px_-18px_rgba(20,20,15,0.55)] lg:rounded-[40px] lg:p-[8px]" style={{ rotate: `${rotate}deg` }}>
        <img src={src} alt={alt} width={660} height={1431} loading="lazy" className="block w-full rounded-[25px] lg:rounded-[33px]" />
      </div>
    </Reveal>
  </div>
);

/** Pastille flottante posée sur les téléphones, comme les marqueurs de la carte */
const Badge = ({ title, accent, dot = 'lime', light = false, delay = 0, className = '' }: {
  title: string; accent: string; dot?: 'lime' | 'cream'; light?: boolean; delay?: number; className?: string;
}) => (
  <div className={`absolute z-10 ${className}`}>
    <Reveal effect="pop" delay={delay}>
      <div
        className={`landing-float flex items-center gap-2.5 whitespace-nowrap rounded-full py-2 pl-2 pr-5 text-[17px] font-bold shadow-[0_14px_30px_-12px_rgba(20,20,15,0.55)] lg:text-[19px] ${light ? 'bg-parchment text-ink' : 'bg-ink text-parchment'}`}
        style={{ '--float-delay': `${delay / 1000}s` } as React.CSSProperties}
      >
        <span className={`size-8 flex-shrink-0 rounded-full ${dot === 'lime' ? 'bg-lime' : light ? 'bg-ink' : 'bg-parchment'}`} />
        {title}<span className={light ? 'text-[#6fae12]' : 'text-lime'}>· {accent}</span>
      </div>
    </Reveal>
  </div>
);

const Eyebrow = ({ children, className = 'text-ink' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[13px] font-bold uppercase tracking-[0.12em] ${className}`}>{children}</p>
);

const Checks = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
  <ul className="mt-5 grid max-w-[520px] gap-2.5">
    {items.map((item, i) => (
      <Reveal as="li" key={item} delay={i * 160} className={`flex gap-3 text-[16.5px] leading-snug ${dark ? 'text-parchment' : 'text-ink'}`}>
        <span className={`mt-0.5 flex size-[20px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${dark ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}>✓</span>
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
    <div className="min-h-[100dvh] overflow-x-clip bg-parchment text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />

      {/* En-tête fixe */}
      <header className="sticky top-0 z-40 bg-ink" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <button type="button" onClick={openInstallGuide} className="rounded-full bg-lime px-4 py-2.5 text-[15px] font-semibold text-ink active:scale-95 lg:hidden">
            Installer l'appli
          </button>
          <span className="hidden text-[14px] text-stone-300 lg:block">Toutes les sorties d'Abidjan sur une carte</span>
        </div>
      </header>

      <main>
        {/* 1. Ce soir, tu fais quoi ? : titre à gauche, téléphones qui débordent d'un panneau vert */}
        <section className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-5 lg:pt-14">
          <div className="px-5 pt-7 lg:px-0 lg:pt-0">
            <Reveal><h1 className="text-[58px] !font-[800] leading-[0.93] tracking-[-0.045em] lg:text-[84px]">
              Ce soir,<br />tu fais <span className="inline-block rounded-xl bg-lime px-2 pb-0.5">quoi&nbsp;?</span>
            </h1></Reveal>
            <Reveal delay={220}><p className="mt-4 max-w-[330px] text-[18px] leading-snug text-stone-500 lg:max-w-[440px] lg:text-[20px]">
              Sortir, organiser, proposer tes services : tout Abidjan sur une seule carte.
            </p></Reveal>
            <nav aria-label="Pour qui ?" className="mt-4 flex flex-wrap gap-2">
              {AUDIENCES.map(({ href, label }, i) => (
                <Reveal as="span" key={href} effect="pop" delay={400 + i * 140}>
                  <a href={href} onClick={(e) => scrollToSection(e, href)} className="block rounded-full border border-ink/15 bg-white px-4 py-2.5 text-[15px] font-semibold text-ink active:scale-95">
                    {label}
                  </a>
                </Reveal>
              ))}
            </nav>
            <div className="mt-8"><QrCard /></div>
          </div>
          <div className="relative mx-auto mt-8 w-full h-[440px] max-w-[420px] lg:mt-0 lg:h-[560px] lg:max-w-[520px]">
            <div className="absolute bottom-0 left-[54px] right-0 top-[60px] overflow-hidden rounded-l-[34px] bg-lime lg:rounded-[40px]">
              <div className="absolute -right-16 top-5 size-[260px] rounded-full border-[38px] border-white/30" />
            </div>
            <TiltPhone src="/landing/ecran-evenements.webp" alt="La liste des événements dans Upvibe" rotate={7} delay={250} className="left-[150px] top-0 w-[168px] lg:left-[230px] lg:w-[210px]" />
            <TiltPhone src="/landing/ecran-carte-2026-10.webp" alt="La carte Upvibe avec les événements d'Abidjan" rotate={-5} delay={100} className="left-[22px] top-[26px] z-[2] w-[188px] lg:left-[40px] lg:w-[240px]" />
            <Badge title="Brunch des débout" accent="13h" delay={1100} className="-left-1 top-[118px]" />
            <Badge title="Fifa tournoi" accent="10h30" dot="cream" delay={1450} className="right-[6px] top-[236px]" />
            <Badge title="Créative Meet'Up" accent="11h" delay={1800} className="bottom-[30px] left-[4px]" />
          </div>
        </section>

        {/* 2. Pour sortir : panneau blanc à gauche, téléphone à droite */}
        <section id="sortir" className="mx-auto max-w-6xl scroll-mt-16 pt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-5 lg:pt-24">
          <Reveal className="px-5 lg:px-0">
            <Eyebrow>01 · Pour sortir</Eyebrow>
            <h2 className="mt-2.5 text-[46px] !font-[800] leading-[0.93] tracking-[-0.045em] lg:text-[64px]">Trouve.<br />Sors. Vibe.</h2>
            <p className="mt-3 max-w-[460px] text-[17px] leading-[1.45] text-stone-500 lg:text-[18px]">Concerts, soirées, festivals, brunchs : tout ce qui se passe autour de toi, en un coup d'œil.</p>
            <ol className="mt-5 grid gap-2.5">
              {STEPS.map((step, i) => (
                <Reveal as="li" key={step} delay={300 + i * 220} className="flex items-center gap-3 font-display text-[21px] tracking-[-0.03em] lg:text-[24px]">
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink font-sans text-[13px] font-semibold">{i + 1}</span>
                  {step}
                </Reveal>
              ))}
            </ol>
          </Reveal>
          <div className="relative mx-auto mt-8 w-full h-[400px] max-w-[420px] lg:mt-0 lg:h-[520px] lg:max-w-[520px]">
            <div className="absolute bottom-[40px] left-0 right-[54px] top-0 rounded-r-[34px] bg-white lg:rounded-[40px]" />
            <TiltPhone src="/landing/ecran-itineraire.webp" alt="L'itinéraire jusqu'à une soirée sur la carte Upvibe" rotate={4} className="right-[24px] top-[-10px] w-[190px] lg:right-[60px] lg:w-[240px]" />
            <Badge title="Concerts" accent="live" delay={500} className="left-[12px] top-[70px]" />
            <Badge title="Soirées" accent="ce week-end" dot="cream" delay={800} className="left-[22px] top-[150px]" />
            <Badge title="Itinéraire" accent="en 1 geste" delay={1100} className="left-[10px] top-[230px]" />
          </div>
        </section>

        {/* 3. Pour les organisateurs : bloc noir arrondi, téléphone qui déborde à droite */}
        <section id="organiser" className="mx-2.5 mt-14 scroll-mt-16 overflow-hidden rounded-[34px] bg-ink text-parchment lg:mx-auto lg:max-w-6xl lg:rounded-[44px]">
          <div className="px-5 pt-7 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-14 lg:pt-14">
            <Reveal>
              <Eyebrow className="text-lime">02 · Pour les organisateurs</Eyebrow>
              <h2 className="mt-2.5 text-[46px] !font-[800] leading-[0.93] tracking-[-0.045em] text-parchment lg:text-[64px]">
                Tu organises ?<br /><span className="text-lime">Fais-toi voir.</span>
              </h2>
              <p className="mt-3 max-w-[480px] text-[17px] leading-[1.45] text-stone-300 lg:text-[18px]">
                Ton événement sur la carte, devant ceux qui cherchent quoi faire ce soir.
              </p>
              <Checks items={ORGANIZER_PERKS} dark />
            </Reveal>
            <div className="relative mt-5 h-[290px] lg:mt-0 lg:h-[500px]">
              <TiltPhone src="/landing/ecran-organisateur.webp" alt="Fiche d'un concert avec ses places Standard, VIP et VVIP" rotate={-4} className="right-[-30px] top-0 w-[200px] lg:right-[30px] lg:w-[250px]" />
              <Badge title="VIP" accent="20 000 F" light delay={500} className="left-0 top-[36px]" />
              <Badge title="Alerte" accent="envoyée" light delay={850} className="left-[14px] top-[112px]" />
            </div>
          </div>
        </section>

        {/* 4. Pour les prestataires : panneau vert à droite, téléphone à gauche */}
        <section id="prestataires" className="mx-auto max-w-6xl scroll-mt-16 pt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-5 lg:pt-24">
          <Reveal className="px-5 lg:order-2 lg:px-0">
            <Eyebrow>03 · Pour les prestataires</Eyebrow>
            <h2 className="mt-2.5 text-[46px] !font-[800] leading-[0.93] tracking-[-0.045em] lg:text-[64px]">
              Abidjan fait la fête.<br /><span className="marker">Fais-en ton business.</span>
            </h2>
            <p className="mt-3 max-w-[480px] text-[17px] leading-[1.45] text-stone-500 lg:text-[18px]">
              DJ, traiteur, déco, photo, location : les organisateurs te trouvent par catégorie et te contactent direct.
            </p>
            <ol className="mt-6 max-w-[520px] border-t-[1.5px] border-ink">
              {PROVIDER_PERKS.map(({ title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 180} className="flex gap-4 border-b border-ink/15 py-4">
                  <span className="w-7 flex-shrink-0 pt-1 font-display text-[15px] font-bold tabular-nums text-stone-400">0{i + 1}</span>
                  <div>
                    <p className="font-display text-[24px] font-bold leading-none tracking-[-0.03em]"><span className="marker">{title}</span></p>
                    <p className="mt-1.5 text-[16.5px] leading-snug text-stone-500">{text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </Reveal>
          <div className="relative mx-auto mt-8 w-full h-[400px] max-w-[420px] lg:order-1 lg:mt-0 lg:h-[520px] lg:max-w-[520px]">
            <div className="absolute bottom-[40px] left-[54px] right-0 top-0 rounded-l-[34px] bg-lime lg:rounded-[40px]" />
            <TiltPhone src="/landing/ecran-marketplace-2026-10.webp" alt="Le Marketplace Upvibe : lieux, traiteurs, matériel" rotate={-4} className="left-[22px] top-[-6px] w-[190px] lg:left-[40px] lg:w-[240px]" />
            <Badge title="Appeler" accent="WhatsApp" delay={500} className="right-[10px] top-[80px]" />
            <Badge title="Ton annonce" accent="en ligne" dot="cream" delay={850} className="right-[18px] top-[160px]" />
          </div>
        </section>

        {/* 5. Pourquoi Upvibe : petites cartes en quinconce */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-14 lg:py-24">
          <Reveal><h2 className="max-w-[640px] text-[38px] !font-[800] leading-[0.98] tracking-[-0.04em] lg:text-[52px]">
            Pourquoi tout Abidjan passe par <span className="rounded-xl bg-lime px-1.5">Upvibe</span>
          </h2></Reveal>
          <div className="mt-6 grid grid-cols-2 items-start gap-2.5 lg:grid-cols-4 lg:gap-4">
            {REASONS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 160} className={`rounded-[22px] bg-white p-4 lg:p-5 ${i % 2 ? 'mt-7 lg:mt-0' : ''}`}>
                <span className="flex size-9 items-center justify-center rounded-full bg-parchment"><Icon size={18} strokeWidth={1.75} /></span>
                <h3 className="mt-3 text-[18px] leading-[1.05] tracking-[-0.02em] lg:text-[21px]">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-snug text-stone-500 lg:text-[15px]">{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. Prochains événements (ouvrent l'installation) */}
        {events && events.length > 0 && (
          <section className="mx-auto max-w-6xl pb-12 lg:pb-20">
            <Reveal><h2 className="px-5 text-[40px] !font-[800] tracking-[-0.04em] lg:text-[52px]">Bientôt à Abidjan</h2></Reveal>
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
                        <p className="truncate font-display text-[18px] tracking-[-0.02em]">{softCase(e.title)}</p>
                        <p className="truncate text-[13.5px] text-stone-500">{[e.venue?.split(',')[0], e.time?.slice(0, 5).replace(':', 'h')].filter(Boolean).join(' · ')}</p>
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
          <Reveal><h2 className="text-[40px] !font-[800] tracking-[-0.04em] lg:text-[52px]">Questions fréquentes</h2></Reveal>
          <div className="mt-4">
            {FAQ.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group border-b border-stone-200 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17.5px] font-semibold">
                  {q}
                  <ChevronDown size={18} className="flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[16px] leading-snug text-stone-500">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-black px-5 pb-36 pt-8 text-[14.5px] leading-7 text-stone-400 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          <Logo className="h-7" />
          <p>Toutes les sorties d'Abidjan sur une carte.</p>
          <p><a href="mailto:contact@upvibe.app" className="hover:text-parchment">contact@upvibe.app</a> · Abidjan, Côte d'Ivoire</p>
        </div>
      </footer>

      {/* Bandeau fixe en bas (téléphone) */}
      <div className="fixed inset-x-2 z-40 lg:hidden" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-[30px] bg-ink py-3 pl-3 pr-3 text-parchment shadow-[0_14px_30px_-10px_rgba(0,0,0,0.55)]">
          <img src="/icon-192.png" alt="" className="size-11 flex-shrink-0 rounded-[12px] border border-white/10" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[16px] font-semibold">Ce soir, tu fais quoi ?</p>
            <p className="text-[13px] text-stone-400">Gratuit · installé en 3 gestes</p>
          </div>
          <button type="button" onClick={openInstallGuide} className="flex-shrink-0 rounded-full bg-lime px-4 py-2.5 text-[15px] font-bold text-ink active:scale-95">
            Installer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
