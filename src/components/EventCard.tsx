import { useState, useEffect, useRef } from 'react';
import ShimmerImage from './ShimmerImage';
import { Link } from 'react-router-dom';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventCardSkeleton from './EventCardSkeleton';
import { eventStatus } from '@/lib/eventStatus';
import { useLanguage } from '@/contexts/LanguageContext';
const OUT_MS = 320;
const IN_MS = 520;

const EventCard = () => {
  const { t } = useLanguage();
  const {
    data: events,
    isLoading
  } = useFeaturedEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;
  // Images déjà décodées : le changement d'événement n'attend jamais le réseau.
  const decodedRef = useRef<Map<string, Promise<void>>>(new Map());

  const decodeImage = (url?: string | null) => {
    if (!url) return Promise.resolve();
    const cache = decodedRef.current;
    if (!cache.has(url)) {
      const img = new Image();
      img.src = url;
      cache.set(url, img.decode().catch(() => undefined));
    }
    return cache.get(url)!;
  };

  useEffect(() => {
    events?.forEach((event) => decodeImage(event.image_url));
  }, [events]);

  useEffect(() => {
    if (!events || events.length < 2) return;
    let cancelled = false;
    let swapTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(async () => {
      const next = (currentIndexRef.current + 1) % events.length;
      // On attend que l'image suivante soit décodée avant de lancer l'animation.
      await decodeImage(events[next].image_url);
      if (cancelled) return;
      setIsTransitioning(true);
      // Le contenu ne change qu'une fois la sortie terminée (OUT_MS),
      // puis la carte revient avec une courbe plus douce (IN_MS).
      swapTimer = setTimeout(() => {
        setCurrentIndex(next);
        requestAnimationFrame(() => setIsTransitioning(false));
      }, OUT_MS);
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(swapTimer);
    };
  }, [events]);

  if (isLoading) {
    return <EventCardSkeleton />;
  }
  if (!events || events.length === 0) {
    return null;
  }
  const currentEvent = events[currentIndex];
  const status = eventStatus(currentEvent.date, currentEvent.time);
  return <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="pointer-events-auto touch-auto">
        <div
          className="relative h-[164px] overflow-hidden rounded-3xl bg-[#ebe9dd] shadow-[0_14px_32px_-14px_rgba(20,20,15,0.45)] [isolation:isolate] transform-gpu will-change-[opacity,transform] motion-reduce:transition-none"
          style={{
            // Animation d'origine (fondu + léger rétrécissement + glissement),
            // limitée à opacity/transform pour rester sur le GPU.
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translate3d(0, 8px, 0) scale(0.95)' : 'translate3d(0, 0, 0) scale(1)',
            transition: isTransitioning
              ? `opacity ${OUT_MS}ms cubic-bezier(0.4, 0, 1, 1), transform ${OUT_MS}ms cubic-bezier(0.4, 0, 1, 1)`
              : `opacity ${IN_MS}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${IN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          {/* Mini affiche : photo en fond, texte posé dessus */}
          <ShimmerImage
            key={currentEvent.id}
            src={currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=640&q=75&fm=webp'}
            alt=""
            loading="eager"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,20,15,0.72)_0%,rgba(20,20,15,0.32)_55%,rgba(20,20,15,0)_100%)]" />

          <div className="absolute inset-x-4 top-3.5 flex items-center justify-between gap-2">
            {status ? (
              <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${status.live ? 'bg-lime text-ink' : 'bg-white/90 text-ink'}`}>
                {status.live && <span className="size-1.5 rounded-full bg-ink" />}
                {t(status.key).replace('{n}', String(status.n ?? ''))}
              </span>
            ) : <span />}
          </div>

          <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3">
            <div className="min-w-0 text-parchment">
              <p className="font-display text-[24px] leading-[1.02] tracking-tight line-clamp-2">{currentEvent.title}</p>
              <p className="mt-1 truncate text-[12.5px] text-parchment/85">
                <span className="capitalize">{format(new Date(`${currentEvent.date}T00:00:00`), 'EEE d MMM', { locale: fr })}</span>
                {' · '}{currentEvent.time?.slice(0, 5)}{' · '}{currentEvent.venue}
              </p>
            </div>
            <Link
              to={`/event/${currentEvent.id}`}
              className="inline-flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-medium text-parchment ring-1 ring-white/15 active:scale-95 transition-transform"
            >
              {t('seeDetails')} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {events.map((_, index) => <div key={index} className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20 dark:bg-stone-600'}`} />)}
        </div>
      </div>
    </div>;
};
export default EventCard;
