import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
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
        gold: {
          DEFAULT: "#d4af37",
          50: "#fbf6e2",
          100: "#f4e9b8",
          200: "#ecdb8a",
          300: "#e3cd5b",
          400: "#dcc138",
          500: "#d4af37",
          600: "#b08e25",
          700: "#86691a",
          800: "#5d4811",
          900: "#352806",
        },
        cream: {
          50: "#FDFAF5",
          100: "#FAF5EA",
          200: "#F3E8D0",
          300: "#E8D5B0",
          400: "#D8BC8C",
          500: "#C8A268",
          600: "#B08845",
          700: "#8A6A30",
          800: "#644D20",
          900: "#3E3013",
        },
        crimson: {
          DEFAULT: "#8C1520",
          50: "#FBE9EA",
          100: "#F5C7CA",
          200: "#EA8D94",
          300: "#E0555E",
          400: "#D42530",
          500: "#8C1520",
          600: "#741119",
          700: "#5C0D14",
          800: "#44090F",
          900: "#2C0509",
        },
        navy: {
          DEFAULT: "#1A2744",
          50: "#E9ECF4",
          100: "#C8D0E5",
          200: "#8E9EC9",
          300: "#5670AD",
          400: "#2D4A94",
          500: "#1A2744",
          600: "#152038",
          700: "#10182B",
          800: "#0B101E",
          900: "#060811",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
