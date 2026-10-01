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
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
"group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-0 group-[.toaster]:bg-ink group-[.toaster]:text-parchment group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-stone-400",
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
