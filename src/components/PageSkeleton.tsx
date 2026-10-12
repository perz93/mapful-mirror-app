/**
 * Squelettes de chargement par type de page.
 * Classe `.skeleton` (index.css) : bloc parchemin + reflet crème discret.
 */

// Arrondi par défaut seulement si le bloc n'en précise pas (sinon rounded-lg l'emportait sur rounded-full)
const ShimmerBlock = ({ className = '' }: { className?: string }) => (
  <div className={`${/\brounded/.test(className) ? '' : 'rounded-lg '}skeleton ${className}`} />
);

/** Pastille ronde des actions du haut (retour, partage…) */
const TopBar = ({ right = 0 }: { right?: number }) => (
  <div
    className="flex items-center justify-between px-4"
    style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
  >
    <ShimmerBlock className="size-12 rounded-full" />
    <div className="flex gap-2">
      {Array.from({ length: right }).map((_, i) => <ShimmerBlock key={i} className="size-12 rounded-full" />)}
    </div>
  </div>
);

/** Cadre d'événement / d'annonce des listes : photo, bloc gauche, titre + pastilles */
export const ListCardSkeleton = () => (
  <div className="card-shadow rounded-[26px] bg-white p-2">
    <ShimmerBlock className="h-44 rounded-[20px]" />
    <div className="flex items-center gap-3.5 px-2 pb-1.5 pt-3">
      <div className="flex w-[52px] flex-shrink-0 flex-col items-center gap-1.5 border-r border-stone-200 pr-3.5">
        <ShimmerBlock className="h-2.5 w-7 rounded-full skeleton-on-white" />
        <ShimmerBlock className="h-6 w-8 rounded-md skeleton-on-white" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <ShimmerBlock className="h-5 w-3/4 rounded-md skeleton-on-white" />
        <div className="flex gap-1.5">
          <ShimmerBlock className="h-[26px] w-28 rounded-full skeleton-on-white" />
          <ShimmerBlock className="h-[26px] w-16 rounded-full skeleton-on-white" />
        </div>
      </div>
    </div>
  </div>
);

/** Skeleton for EventDetails page */
export const EventDetailsSkeleton = () => (
  <div className="min-h-screen bg-parchment dark:bg-background-dark animate-fade-in">
    <div className="mx-auto max-w-md">
      <TopBar right={3} />
      {/* Billet : photo, pastilles, titre, pointillés, grille date / heure / lieu / prix */}
      <div className="px-4 pt-4">
        <div className="card-shadow overflow-hidden rounded-[28px] bg-white">
          <ShimmerBlock className="m-2 h-[240px] rounded-[22px]" />
          <div className="space-y-3 px-5 pb-5 pt-2">
            <div className="flex gap-1.5">
              <ShimmerBlock className="h-7 w-28 rounded-full skeleton-on-white" />
              <ShimmerBlock className="h-7 w-24 rounded-full skeleton-on-white" />
            </div>
            <ShimmerBlock className="h-8 w-2/3 rounded-lg skeleton-on-white" />
          </div>
          <div className="mx-5 border-t-2 border-dashed border-stone-200" />
          <div className="grid grid-cols-2 gap-4 px-5 pb-5 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 border-l border-stone-200 pl-3">
                <ShimmerBlock className="h-2.5 w-12 rounded-full skeleton-on-white" />
                <ShimmerBlock className="h-4 w-24 rounded-md skeleton-on-white" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-7 space-y-3">
          <ShimmerBlock className="h-3 w-40 rounded-full" />
          <ShimmerBlock className="h-4 w-full rounded-md" />
          <ShimmerBlock className="h-4 w-4/5 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

/** Skeleton for CategoryPage (list of events) */
export const CategoryPageSkeleton = () => (
  <div className="p-4 pt-5 space-y-4">
    {[1, 2, 3].map((i) => <ListCardSkeleton key={i} />)}
  </div>
);

/** Skeleton for CreateEvent / form pages */
export const FormPageSkeleton = () => (
  <div className="min-h-screen bg-parchment">
    <div className="mx-auto max-w-md px-4 space-y-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
      <ShimmerBlock className="h-10 w-10 rounded-full" />
      <ShimmerBlock className="h-9 w-3/4 rounded-xl" />
      <ShimmerBlock className="h-4 w-1/2" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-3xl bg-white p-5 space-y-3">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="size-10 rounded-2xl skeleton-on-white" />
            <ShimmerBlock className="h-5 w-40 skeleton-on-white" />
          </div>
          <ShimmerBlock className="h-11 w-full rounded-xl skeleton-on-white" />
          <ShimmerBlock className="h-11 w-full rounded-xl skeleton-on-white" />
        </div>
      ))}
    </div>
  </div>
);

/** Skeleton for Settings page */
export const SettingsSkeleton = () => (
  <div className="mx-auto max-w-md px-4 pt-20 space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-3xl bg-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <ShimmerBlock className="size-10 rounded-2xl skeleton-on-white" />
          <ShimmerBlock className="h-5 w-32 rounded-md skeleton-on-white" />
        </div>
        <ShimmerBlock className="h-3 w-48 rounded-full skeleton-on-white" />
        <ShimmerBlock className="h-12 w-full rounded-xl skeleton-on-white" />
        <ShimmerBlock className="h-10 w-40 rounded-full skeleton-on-white" />
      </div>
    ))}
  </div>
);

/** Skeleton for MyAccount profile page */
export const AccountSkeleton = () => (
  <div className="flex flex-col items-center px-6 pt-4">
    {/* Photo ronde, nom, e-mail */}
    <ShimmerBlock className="size-24 rounded-full mb-4" />
    <ShimmerBlock className="h-8 w-44 rounded-lg mb-2" />
    <ShimmerBlock className="h-3.5 w-36 rounded-full mb-7" />
    {/* Onglets avec compteurs */}
    <div className="flex w-full border-b border-stone-200 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-1 items-center justify-center gap-1.5 pb-3 pt-1">
          <ShimmerBlock className="h-3.5 w-16 rounded-full" />
          <ShimmerBlock className="size-[22px] rounded-full" />
        </div>
      ))}
    </div>
    <div className="mb-4 flex w-full items-center justify-between">
      <ShimmerBlock className="h-5 w-32 rounded-md" />
      <ShimmerBlock className="h-3 w-16 rounded-full" />
    </div>
    {/* Liste : texte à gauche, photo à droite */}
    <div className="w-full space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-3xl bg-white p-3">
          <div className="flex-1 space-y-2 pl-1">
            <ShimmerBlock className="h-3 w-24 rounded-full skeleton-on-white" />
            <ShimmerBlock className="h-4 w-3/4 rounded-md skeleton-on-white" />
            <ShimmerBlock className="h-3 w-1/2 rounded-full skeleton-on-white" />
          </div>
          <ShimmerBlock className="size-20 flex-shrink-0 rounded-2xl skeleton-on-white" />
        </div>
      ))}
    </div>
  </div>
);

/** Skeleton for ManageEvents list */
export const ManageEventsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-3xl bg-white p-4 space-y-3">
        <div className="flex items-center gap-3">
          <ShimmerBlock className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-3/4" />
            <ShimmerBlock className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-8 w-20 rounded-full" />
          <ShimmerBlock className="h-8 w-24 rounded-full" />
          <ShimmerBlock className="h-8 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton for EditEvent form page */
export const EditEventSkeleton = () => (
  <div className="mx-auto max-w-md px-4 pt-20 space-y-4">
    <ShimmerBlock className="h-48 rounded-2xl" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-3xl bg-white p-4 space-y-3">
        <ShimmerBlock className="h-5 w-32" />
        <ShimmerBlock className="h-9 w-full rounded-xl" />
        <ShimmerBlock className="h-9 w-full rounded-xl" />
      </div>
    ))}
  </div>
);

export default ShimmerBlock;
