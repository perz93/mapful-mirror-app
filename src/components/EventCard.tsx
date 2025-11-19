const EventCard = () => {
  return <div className="fixed bottom-28 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none animate-slide-in-bottom">
      <div className="pointer-events-auto touch-auto">
        <div className="flex items-stretch justify-between gap-3 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-stone-900/80 p-4 shadow-2xl border border-white/50 dark:border-stone-700/50">
        <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
          <div className="flex flex-col gap-0.5">
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              Central Park
            </p>
            <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
              Festival de Musique Indie
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              Sam, 16 Nov • 20:00
            </p>
          </div>
          <a href="/event/1" className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-7 px-3 bg-primary text-primary-foreground text-xs font-medium leading-normal hover:opacity-90 transition-all active:scale-95">
            <span>Voir détails</span>
          </a>
        </div>
        <div className="w-20 h-20 flex-shrink-0 bg-center bg-no-repeat bg-cover rounded-xl" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop')"
        }} />
        </div>
      </div>
    </div>;
};
export default EventCard;