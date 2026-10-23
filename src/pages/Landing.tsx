import { useQuery } from '@tanstack/react-query';
import { ChevronDown, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { openInstallGuide } from '@/components/InstallGuide';
import ShimmerImage from '@/components/ShimmerImage';
import { focusPosition } from '@/lib/imageFocus';
import { softCase } from '@/lib/softCase';

/**
 * Page vitrine (« / » dans un navigateur), inspirée de Glovo : contenu centré,
 * vagues entre les sections, puces arrondies. Elle s'adresse aux trois publics
 * d'Upvibe (ceux qui sortent, les organisateurs, les prestataires) et ne
 * propose qu'une action : installer l'app. Aucune animation.
 */

const AUDIENCES = [
  { href: '#sortir', label: 'Je sors' },
  { href: '#organiser', label: "J'organise" },
  { href: '#prestataires', label: 'Je propose mes services' },
];

/** Réseaux sociaux d'Upvibe (pied de page) */
const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/upvibe.app',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </g>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@upvibe.app',
    icon: <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.3 7.3 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" />,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1EAbxCtUiG/',
    icon: <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />,
  },
];

const FAQ = [
  { q: 'Upvibe est gratuit ?', a: 'Oui, totalement gratuit pour découvrir les événements, publier tes événements et proposer tes services.' },
  { q: 'Je dois passer par le Play Store ?', a: "Non. Upvibe s'installe directement depuis ton navigateur (Chrome sur Android, Safari sur iPhone), en une minute. Pas de store, pas de téléchargement lourd." },
  { q: 'Ça marche sur iPhone et Android ?', a: "Oui, sur tous les smartphones récents. Sur iPhone, ouvre upvibe.app dans Safari pour l'installer." },
  { q: 'Comment publier mon événement ?', a: "Installe l'app, crée ton compte puis touche « Créer un événement » : titre, date, lieu, photo et prix des places. Il apparaît aussitôt sur la carte." },
  { q: 'Je suis prestataire, comment être visible ?', a: "Crée ton compte puis publie une annonce sur le Marketplace : photos, prix, quartier et contacts. Les organisateurs te trouvent par catégorie (DJ, traiteur, déco, photo…)." },
];

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const CATEGORIES = ['Soirées', 'Concerts', 'Festivals', 'Brunch', 'Meetups', 'Ateliers', 'Religieux', 'Sport'];

/** Séparation en vague entre deux sections (couleur du haut → couleur du bas) */
const Wave = ({ top, bottom, flip = false }: { top: string; bottom: string; flip?: boolean }) => (
  <svg aria-hidden viewBox="0 0 390 60" preserveAspectRatio="none" className="block h-12 w-full lg:h-20" style={{ background: flip ? top : bottom }}>
    {/* Sans flip : la couleur du haut descend en arrondi ; avec flip : celle du bas remonte */}
    <path d={flip ? 'M0,60 L390,60 L390,10 C250,-10 120,10 0,50 Z' : 'M0,0 L390,0 L390,20 C260,70 120,70 0,30 Z'} fill={flip ? bottom : top} />
  </svg>
);

const Logo = ({ className = 'h-8' }: { className?: string }) => (
  <img src="/landing/logo.png" alt="Upvibe" width={278} height={96} className={`w-auto ${className}`} />
);

/** Pastille posée sur les téléphones, comme les marqueurs de la carte */
const Badge = ({ title, accent, className = '' }: { title: string; accent: string; className?: string }) => (
  <div className={`absolute z-10 flex items-center gap-2 whitespace-nowrap rounded-full bg-ink py-1.5 pl-1.5 pr-4 text-[14.5px] font-bold text-parchment shadow-[0_14px_30px_-12px_rgba(20,20,15,0.55)] lg:text-[16px] ${className}`}>
    <span className="size-6 flex-shrink-0 rounded-full bg-lime" />
    {title}<span className="text-lime">· {accent}</span>
  </div>
);

/** Section centrée : titre, texte avec une partie surlignée, téléphone posé sur une forme arrondie */
const PhoneSection = ({ id, eyebrow, title, lead, highlight, bg, blob, highlightClass = 'bg-lime', phone, alt, badges }: {
  id: string; eyebrow: string; title: React.ReactNode; lead: string; highlight: string; bg: string; blob: string;
  highlightClass?: string; phone: string; alt: string; badges: { title: string; accent: string; className: string }[];
}) => (
  <section id={id} className="scroll-mt-16 px-5 pb-6 pt-8 text-center" style={{ background: bg }}>
    <div className="mx-auto max-w-xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2.5 text-[38px] !font-[800] leading-[1] tracking-[-0.04em] lg:text-[52px]">{title}</h2>
      <p className="mt-3 text-[17px] leading-[1.5] text-stone-600 lg:text-[18px]">
        {lead} <span className={`rounded-lg px-1.5 py-0.5 text-ink [box-decoration-break:clone] ${highlightClass}`}>{highlight}</span>
      </p>
    </div>
    <div className="relative mx-auto mt-6 h-[360px] w-full max-w-[400px] lg:h-[460px] lg:max-w-[480px]">
      <div aria-hidden className="absolute inset-x-6 bottom-2 top-10" style={{ background: blob, borderRadius: '40% 60% 45% 55% / 50% 45% 55% 50%' }} />
      <div className="absolute left-1/2 top-0 w-[180px] -translate-x-1/2 lg:w-[220px]">
        <div className="rounded-[30px] bg-ink p-[6px] shadow-[0_26px_50px_-18px_rgba(20,20,15,0.55)]" style={{ rotate: '-4deg' }}>
          <img src={phone} alt={alt} width={660} height={1431} loading="lazy" className="block w-full rounded-[25px]" />
        </div>
      </div>
      {badges.map((b) => <Badge key={b.title} {...b} />)}
    </div>
  </section>
);

/** Défilement fluide vers une section (sous l'en-tête fixe) */
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', href);
};

const Eyebrow = ({ children, className = 'text-ink' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[13px] font-bold uppercase tracking-[0.12em] ${className}`}>{children}</p>
);

/** Sur ordinateur : on installe depuis son téléphone en scannant le QR code */
const QrCard = () => (
  <div className="hidden items-center gap-4 rounded-[24px] bg-parchment p-4 lg:flex">
    <img src="/landing/qr.svg" alt="QR code vers upvibe.app" className="size-[104px] rounded-xl bg-white p-1.5" />
    <div>
      <p className="font-display text-[20px] leading-tight tracking-[-0.03em] text-ink">Scanne avec ton téléphone</p>
      <p className="mt-1 text-[14px] text-stone-500">Upvibe s'installe en une minute, gratuitement.</p>
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
  const withImage = (events ?? []).filter((e) => e.image_url);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-white text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />

      {/* En-tête fixe */}
      <header className="sticky top-0 z-40 bg-parchment" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="rounded-2xl bg-ink px-3 pb-1.5 pt-2"><Logo className="h-6" /></span>
          <button type="button" onClick={openInstallGuide} className="rounded-full bg-lime px-4 py-2.5 text-[15px] font-semibold text-ink active:scale-95">
            Installer l'appli
          </button>
        </div>
      </header>

      <main>
        {/* 1. Accueil : titre centré, barre de recherche, publics, événements à venir en ronds */}
        <section className="bg-parchment pb-8 pt-6 text-center lg:pt-14">
          <div className="mx-auto max-w-2xl px-5">
            <h1 className="text-[46px] !font-[800] leading-[0.98] tracking-[-0.045em] lg:text-[76px]">
              On fait quoi<br />à <span className="marker">Abidjan&nbsp;?</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[460px] text-[17px] leading-[1.45] text-stone-600 lg:text-[19px]">
              Brunchs, concerts, meetups, ateliers, cultes, soirées : tous les événements de la ville, sur une seule carte.
            </p>
            {/* Barre de recherche : les événements se cherchent dans l'app, elle ouvre donc l'installation */}
            <button
              type="button"
              onClick={openInstallGuide}
              className="mx-auto mt-6 flex w-full max-w-[460px] items-center gap-3 rounded-2xl bg-white py-2.5 pl-4 pr-2.5 text-left shadow-[0_10px_30px_-18px_rgba(20,20,15,0.45)] active:scale-[0.99]"
            >
              <MapPin size={20} strokeWidth={1.9} className="flex-shrink-0 text-ink" />
              <span className="flex-1 truncate text-[16px] text-stone-400">Concert, brunch, atelier…</span>
              <span className="rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-parchment">Voir</span>
            </button>
            <nav aria-label="Pour qui ?" className="mt-5 flex flex-wrap justify-center gap-2">
              {AUDIENCES.map(({ href, label }) => (
                <a key={href} href={href} onClick={(e) => scrollToSection(e, href)} className="rounded-full bg-white px-4 py-2.5 text-[15px] font-bold text-ink active:scale-95">
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-6 flex justify-center"><QrCard /></div>
          </div>

          {withImage.length > 0 && (
            <div className="mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide lg:justify-center">
              {withImage.map((e) => (
                <button key={e.id} type="button" onClick={openInstallGuide} className="w-[132px] flex-shrink-0 snap-start text-center active:scale-[0.98]">
                  <ShimmerImage src={e.image_url!} alt={e.title} position={focusPosition(e.image_focus)} className="size-[132px] rounded-full" />
                  <span className="relative -mt-4 inline-block max-w-full truncate rounded-lg bg-white px-2.5 py-1 text-[13.5px] font-bold">{softCase(e.title)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <Wave top="#f5f5eb" bottom="#ffffff" />

        {/* 2. Pour sortir */}
        <PhoneSection
          id="sortir"
          eyebrow="01 · Pour sortir"
          title={<>Trouve. Sors. Vibe.</>}
          lead="Tout ce qui se passe autour de toi, en un coup d'œil :"
          highlight="le lieu, l'heure et le prix."
          bg="#ffffff"
          blob="#a6e22e"
          phone="/landing/ecran-itineraire.webp"
          alt="L'itinéraire jusqu'à une soirée sur la carte Upvibe"
          badges={[
            { title: 'Concerts', accent: 'live', className: 'left-0 top-[96px] lg:left-4' },
            { title: 'Ateliers', accent: 'ce week-end', className: 'right-0 top-[220px] lg:right-4' },
          ]}
        />

        <Wave top="#ffffff" bottom="#b5d8f0" flip />

        {/* 3. Pour les organisateurs */}
        <PhoneSection
          id="organiser"
          eyebrow="02 · Pour les organisateurs"
          title={<>Tu organises&nbsp;? Fais-toi voir.</>}
          lead="Ton événement sur la carte, devant ceux qui cherchent"
          highlight="où aller."
          highlightClass="bg-parchment"
          bg="#b5d8f0"
          blob="#eef0e4"
          phone="/landing/ecran-organisateur.webp"
          alt="Fiche d'un concert avec ses places Standard, VIP et VVIP"
          badges={[
            { title: 'VIP', accent: '20 000 F', className: 'left-0 top-[110px] lg:left-4' },
            { title: 'Alerte', accent: 'envoyée', className: 'right-0 top-[230px] lg:right-4' },
          ]}
        />

        <Wave top="#b5d8f0" bottom="#ffffff" />

        {/* 4. Pour les prestataires */}
        <PhoneSection
          id="prestataires"
          eyebrow="03 · Pour les prestataires"
          title={<>Abidjan fait la fête. Fais-en ton business.</>}
          lead="DJ, traiteur, déco, photo, location :"
          highlight="les organisateurs te contactent direct."
          bg="#ffffff"
          blob="#a6e22e"
          phone="/landing/ecran-marketplace-2026-10.webp"
          alt="Le Marketplace Upvibe : lieux, traiteurs, matériel"
          badges={[{ title: 'Appeler', accent: 'WhatsApp', className: 'left-0 top-[100px] lg:left-4' }]}
        />

        <Wave top="#ffffff" bottom="#a6e22e" flip />

        {/* 5. Catégories populaires */}
        <section className="bg-lime px-5 pb-10 pt-6 text-center">
          <h2 className="text-[34px] !font-[800] leading-[1] tracking-[-0.04em] lg:text-[48px]">Catégories populaires</h2>
          <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={openInstallGuide} className="rounded-full bg-white px-5 py-3 text-[15px] font-bold text-ink active:scale-95">
                {c}
              </button>
            ))}
          </div>
          <button type="button" onClick={openInstallGuide} className="mt-7 rounded-full bg-ink px-6 py-3.5 text-[16px] font-bold text-parchment active:scale-95">
            Installer Upvibe
          </button>
        </section>

        <Wave top="#a6e22e" bottom="#ffffff" />

        {/* 6. FAQ */}
        <section className="mx-auto max-w-3xl px-5 pb-12 pt-4">
          <h2 className="text-center text-[34px] !font-[800] leading-[1] tracking-[-0.04em] lg:text-[44px]">Questions fréquentes</h2>
          <div className="mt-5">
            {FAQ.map(({ q, a }, i) => (
              <details key={q} open={i === 0} className="group border-b border-stone-200 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17.5px] font-semibold">
                  {q}
                  <ChevronDown size={18} className="flex-shrink-0 group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[16px] leading-snug text-stone-500">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Wave top="#ffffff" bottom="#14140f" flip />
      <footer className="bg-ink px-5 pb-10 pt-4 text-[15px] text-stone-300">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-3 lg:gap-10">
          <div>
            <Logo className="h-8" />
            <p className="mt-3 text-stone-400">Tous les événements d'Abidjan sur une carte.</p>
            <ul className="mt-4 flex gap-2.5">
              {SOCIALS.map(({ name, href, icon }) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Upvibe sur ${name}`} className="flex size-11 items-center justify-center rounded-full bg-white/10 text-parchment hover:bg-lime hover:text-ink active:scale-95">
                    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>{icon}</svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mt-8 font-display text-[19px] font-bold text-parchment lg:mt-0">Upvibe</p>
            {AUDIENCES.map(({ href, label }) => (
              <a key={href} href={href} onClick={(e) => scrollToSection(e, href)} className="mt-3 block hover:text-parchment">{label}</a>
            ))}
          </div>
          <div>
            <p className="mt-8 font-display text-[19px] font-bold text-parchment lg:mt-0">Liens utiles</p>
            <button type="button" onClick={openInstallGuide} className="mt-3 block hover:text-parchment">Installer l'appli</button>
            <a href="mailto:contact@upvibe.app" className="mt-3 block hover:text-parchment">contact@upvibe.app</a>
            <p className="mt-3">Abidjan, Côte d'Ivoire</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
