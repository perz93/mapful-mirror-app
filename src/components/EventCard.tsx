const EventCard = () => {
  return <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none animate-slide-in-bottom">
      <div className="pointer-events-auto touch-auto">
        <div className="flex items-stretch justify-between gap-3 rounded-lg bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm p-3 shadow-2xl py-[12px] my-[23px]">
        <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
          <div className="flex flex-col gap-0.5">
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              Central Park
            </p>
            <p className="text-stone-900 dark:text-white text-sm font-bold leading-tight">
              Indie Music Festival
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-xs font-normal leading-normal">
              Sat, Nov 16 • 8:00 PM
            </p>
          </div>
          <a href="/event/1" className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-7 px-3 bg-primary text-primary-foreground text-xs font-medium leading-normal hover:opacity-90 transition-all active:scale-95">
            <span>View Details</span>
          </a>
        </div>
        <div className="w-20 h-20 flex-shrink-0 bg-center bg-no-repeat bg-cover rounded-lg" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop')"
        }} />
        </div>
      </div>
    </div>;
};
export default EventCard;