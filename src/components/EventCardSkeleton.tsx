const EventCardSkeleton = () => {
  return (
    <div className="fixed bottom-[100px] left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="animate-pulse">
        <div className="flex items-stretch justify-between gap-4 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-stone-900/40 p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/60 dark:border-stone-700/30">
          {/* Left side */}
          <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
            <div className="flex flex-col gap-1">
              <div className="h-7 w-24 rounded-full bg-stone-200/60 dark:bg-stone-700/40" />
              <div className="h-4 w-40 rounded-md bg-stone-200/60 dark:bg-stone-700/40" />
              <div className="h-3 w-28 rounded-md bg-stone-200/60 dark:bg-stone-700/40" />
            </div>
            <div className="h-8 w-24 rounded-full bg-stone-200/60 dark:bg-stone-700/40" />
          </div>

          {/* Right side — image placeholder */}
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl bg-stone-200/60 dark:bg-stone-700/40" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
