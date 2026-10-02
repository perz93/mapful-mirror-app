import { useState, useEffect, useRef } from 'react';
import ShimmerImage from './ShimmerImage';
import { Link } from 'react-router-dom';
import { useFeaturedEvents } from '@/hooks/useFeaturedEvents';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EventCardSkeleton from './EventCardSkeleton';
import HypeBadge from './HypeBadge';
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
  return <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="pointer-events-auto touch-auto">
        <div
          className="neo-white-bottom rounded-3xl bg-white dark:bg-stone-900 p-3 pl-4 transform-gpu will-change-[opacity,transform] motion-reduce:transition-none"
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
          <div className="flex items-stretch justify-between gap-4">
          <div className="flex flex-col justify-between gap-2 flex-[2_2_0px] min-w-0 py-1">
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="eyebrow text-stone-500 dark:text-stone-400 truncate">
                {currentEvent.venue}
              </span>
              <p className="text-ink dark:text-white font-display text-[18px] leading-[1.1] tracking-tight line-clamp-2 min-h-[2.3em]">
                {currentEvent.title}
              </p>
              {/* Date & heure */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-lime text-[11px] font-medium text-ink capitalize">
                  {format(new Date(currentEvent.date), 'EEE dd MMM', { locale: fr })}
                </span>
                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-parchment dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300 tabular">
                  {currentEvent.time?.slice(0, 5)}
                </span>
                <HypeBadge eventId={currentEvent.id} eventDate={currentEvent.date} eventTime={currentEvent.time} capacity={currentEvent.capacity} size="sm" />
              </div>
            </div>
            <Link to={`/event/${currentEvent.id}`} className="group inline-flex w-fit cursor-pointer items-center gap-1.5 text-[13px] font-medium text-ink dark:text-white link-underline hover:text-stone-600 transition-colors">
              <span>{t('seeDetails')}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <ShimmerImage
            key={currentEvent.id}
            src={currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop'}
            alt=""
            loading="eager"
            className="w-[104px] h-[104px] flex-shrink-0 rounded-2xl"
          />
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
