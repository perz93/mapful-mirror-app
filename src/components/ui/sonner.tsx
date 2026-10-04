import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Conteneur des notifications : les pilules sont rendues par `@/components/PillToast`. */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-center"
    offset="calc(env(safe-area-inset-top, 0px) + 10px)"
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
