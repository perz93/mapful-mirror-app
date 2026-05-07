import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
 
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={80}
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-white/60 group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-stone-900 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] group-[.toaster]:relative",
          closeButton:
            "group-[.toast]:!static group-[.toast]:!ml-auto group-[.toast]:!w-8 group-[.toast]:!h-8 group-[.toast]:!rounded-full group-[.toast]:!bg-white group-[.toast]:!shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-[.toast]:!border-0 group-[.toast]:!text-stone-600 group-[.toast]:hover:!text-stone-900 group-[.toast]:hover:!scale-105 group-[.toast]:!transition-all group-[.toast]:!opacity-100",
          description: "group-[.toast]:text-stone-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full px-3 py-1 text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-stone-100 group-[.toast]:text-stone-600 group-[.toast]:rounded-full px-3 py-1 text-xs font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
