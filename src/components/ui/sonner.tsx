import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const TOP = "calc(env(safe-area-inset-top, 0px) + 76px + var(--toast-extra, 0px))";

/** Conteneur des notifications : les pilules sont rendues par `@/components/PillToast`. */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    // Sous la rangée de boutons du haut ; --toast-extra pousse plus bas quand
    // les pastilles d'itinéraire sont affichées (voir RouteInfoPanel)
    offset={{ top: TOP }}
    mobileOffset={{ top: TOP }}
    gap={8}
    toastOptions={{
      unstyled: true,
      classNames: { toast: "w-full flex justify-center" },
    }}
    {...props}
  />
);

export { Toaster };
export { toast } from "@/components/PillToast";
