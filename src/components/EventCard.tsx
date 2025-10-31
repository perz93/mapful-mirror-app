const EventCard = () => {
  return (
    <div className="absolute bottom-24 left-0 right-0 p-4">
      <div className="flex items-stretch justify-between gap-4 rounded-lg bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex flex-col justify-between gap-2 flex-[2_2_0px]">
          <div className="flex flex-col gap-1">
            <p className="text-stone-500 dark:text-stone-400 text-sm font-normal leading-normal">
              Central Park
            </p>
            <p className="text-stone-900 dark:text-white text-base font-bold leading-tight">
              Indie Music Festival
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-normal leading-normal">
              Sat, Nov 16 • 8:00 PM
            </p>
          </div>
          <a 
            href="/event/1"
            className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-primary text-primary-foreground text-sm font-medium leading-normal hover:opacity-90 transition-opacity active:scale-95"
          >
            <span>View Details</span>
          </a>
        </div>
        <div 
          className="w-24 flex-shrink-0 bg-center bg-no-repeat bg-cover rounded-lg"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop')"
          }}
        />
      </div>
    </div>
  );
};

export default EventCard;
