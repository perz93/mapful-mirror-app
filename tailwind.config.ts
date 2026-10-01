import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* VIBE — encre, parchemin et un seul accent lime (Perk × Notion) */
        ink: "#14140f",
        lime: {
          DEFAULT: "#a6e22e",
          deep: "#93cc1f",
        },
        parchment: "#f5f5eb",
        ash: "#d2d2c8",
        graphite: "#6e6e64",
        charcoal: "#30302a",
        /* Neutres chauds : on remappe "stone" pour que tout le site
           bascule sur la gamme parchemin → encre sans toucher chaque classe. */
        stone: {
          50: "#f5f5eb",
          100: "#edede2",
          200: "#e2e2d7",
          300: "#d2d2c8",
          400: "#919183",
          500: "#6e6e64",
          600: "#55554c",
          700: "#3d3d36",
          800: "#30302a",
          900: "#1d1d18",
          950: "#14140f",
        },
        primary: {
          DEFAULT: "#a6e22e",
          foreground: "#14140f",
        },
        "background-light": "#f5f5eb",
        "background-dark": "#14140f",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"Instrument Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Bricolage Grotesque Variable"', '"Instrument Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      /* Deux voix seulement : 400 (texte) et 500 (titres, labels, CTA).
         "bold" reste un cran au-dessus pour les chiffres et gros titres. */
      fontWeight: {
        semibold: "500",
        bold: "600",
        extrabold: "600",
        black: "600",
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.02em",
        eyebrow: "0.1em",
      },
      /* Rayons Perk : 8 (inputs) · 18 (blocs internes) · 28 (cartes, boutons) · pilule */
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "28px",
        full: "9999px",
      },
      /* Pas d'élévation : les surfaces se séparent par le ton.
         Seuls les éléments flottant au-dessus de la carte gardent une ombre douce. */
      boxShadow: {
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "0 1px 2px rgb(20 20 15 / 0.06), 0 12px 28px -14px rgb(20 20 15 / 0.28)",
        xl: "0 1px 2px rgb(20 20 15 / 0.06), 0 12px 28px -14px rgb(20 20 15 / 0.28)",
        "2xl": "0 1px 2px rgb(20 20 15 / 0.08), 0 16px 36px -16px rgb(20 20 15 / 0.32)",
        none: "none",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "slide-in-bottom": {
          "0%": {
            transform: "translate3d(0, 100%, 0)",
            opacity: "0",
          },
          "100%": {
            transform: "translate3d(0, 0, 0)",
            opacity: "1",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "zoom-smooth": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-in-right": {
          "0%": {
            transform: "translate3d(-100%, 0, 0)",
            opacity: "0",
          },
          "100%": {
            transform: "translate3d(0, 0, 0)",
            opacity: "1",
          },
        },
        "pan": {
          "0%": {
            backgroundPosition: "0% 0%",
          },
          "25%": {
            backgroundPosition: "100% 0%",
          },
          "50%": {
            backgroundPosition: "100% 100%",
          },
          "75%": {
            backgroundPosition: "0% 100%",
          },
          "100%": {
            backgroundPosition: "0% 0%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-in": "fade-in 0.4s ease-out",
        "zoom-smooth": "zoom-smooth 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "pan": "pan 120s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
