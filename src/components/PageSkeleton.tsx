/**
 * Facebook-style shimmer skeleton loaders for different page types.
 * Uses CSS shimmer animation for smooth loading effect.
 */

const ShimmerBlock = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-stone-200/70 dark:bg-stone-800/50 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
  </div>
);

/** Skeleton for EventDetails page */
export const EventDetailsSkeleton = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark animate-fade-in">
    <div className="mx-auto max-w-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Hero image */}
      <div className="mx-4 mt-2">
        <ShimmerBlock className="h-80 rounded-3xl" />
      </div>

      <div className="p-6 space-y-5">
        {/* Countdown */}
        <ShimmerBlock className="h-20 rounded-2xl" />

        {/* Hype bar */}
        <ShimmerBlock className="h-16 rounded-2xl" />

        {/* Info block */}
        <div className="space-y-4 rounded-md p-3">
          <div className="flex items-start gap-3">
            <ShimmerBlock className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-4 w-3/4" />
              <ShimmerBlock className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShimmerBlock className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-4 w-2/3" />
              <ShimmerBlock className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShimmerBlock className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 pt-4">
          <ShimmerBlock className="h-6 w-2/3" />
          <ShimmerBlock className="h-4 w-full" />
          <ShimmerBlock className="h-4 w-full" />
          <ShimmerBlock className="h-4 w-4/5" />
        </div>

        {/* Going section */}
        <ShimmerBlock className="h-24 rounded-2xl" />
      </div>
    </div>
  </div>
);

/** Skeleton for CategoryPage (list of events) */
export const CategoryPageSkeleton = () => (
  <div className="p-4 space-y-5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-white/80 dark:border-stone-700/40 shadow-sm">
        <ShimmerBlock className="h-48 rounded-none" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-7 w-28 rounded-full" />
            <ShimmerBlock className="h-7 w-20 rounded-full" />
          </div>
          <ShimmerBlock className="h-3 w-full rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton for CreateEvent / form pages */
export const FormPageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-[#ee9d2b] border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
);

/** Skeleton for Settings page */
export const SettingsSkeleton = () => (
  <div className="mx-auto max-w-md px-4 pt-20 space-y-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-2xl bg-white/50 border border-white/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-5 h-5 rounded" />
          <ShimmerBlock className="h-5 w-32" />
        </div>
        <ShimmerBlock className="h-3 w-48" />
        <ShimmerBlock className="h-11 w-full rounded-xl" />
        <ShimmerBlock className="h-10 w-40 rounded-full" />
      </div>
    ))}
  </div>
);

export default ShimmerBlock;
