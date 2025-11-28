import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
 
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // Center the toast in the app
      position="top-center"
      className="toaster group fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      toastOptions={{
        classNames: {
          toast:
            "group toast pointer-events-auto group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-white/20 group-[.toaster]:bg-white/30 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full px-3 py-1 text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted/60 group-[.toast]:text-muted-foreground group-[.toast]:rounded-full px-3 py-1 text-xs font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
