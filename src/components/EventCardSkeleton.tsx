const EventCardSkeleton = () => {
  return (
    <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div className="animate-pulse">
        <div className="flex items-stretch justify-between gap-4 neo-white-bottom rounded-3xl bg-white/90 dark:bg-stone-900/40 p-3 pl-4">
          {/* Left side */}
          <div className="flex flex-col justify-between gap-1.5 flex-[2_2_0px]">
            <div className="flex flex-col gap-1">
              <div className="h-7 w-24 rounded-full bg-stone-100 dark:bg-stone-700/40" />
              <div className="h-4 w-40 rounded-md bg-stone-100 dark:bg-stone-700/40" />
              <div className="h-3 w-28 rounded-md bg-stone-100 dark:bg-stone-700/40" />
            </div>
            <div className="h-8 w-24 rounded-full bg-stone-100 dark:bg-stone-700/40" />
          </div>

          {/* Right side — image placeholder */}
          <div className="w-[104px] h-[104px] flex-shrink-0 rounded-2xl bg-stone-100 dark:bg-stone-700/40" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
