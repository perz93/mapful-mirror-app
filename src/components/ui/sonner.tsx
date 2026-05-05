import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
 
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset="calc(env(safe-area-inset-top, 0px) + 60px)"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-white/60 group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-stone-900 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)]",
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
