const EventCardSkeleton = () => {
  return (
    <div className="fixed bottom-36 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-10 touch-none">
      <div>
        {/* Même gabarit que la mini affiche */}
        <div className="neo-white-bottom relative h-[164px] overflow-hidden rounded-3xl bg-white/90 p-4">
          <div className="flex justify-between">
            <div className="h-6 w-20 rounded-full skeleton skeleton-on-white" />
            <div className="h-6 w-20 rounded-full skeleton skeleton-on-white" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 rounded-md skeleton skeleton-on-white" />
              <div className="h-3 w-52 rounded-md skeleton skeleton-on-white" />
            </div>
            <div className="h-10 w-28 rounded-full skeleton skeleton-on-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
