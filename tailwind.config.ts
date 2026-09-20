import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        // Grayscale/black ramp — anchored on the brand's exact spec values:
        // 950 Black #0A0A0A, 900 Dark Text #171717, 500 Muted #666666,
        // 100 Border #E5E5E5, 50 Light Gray #F7F7F7. Verified WCAG AA+ at
        // every text/background pairing used in the components.
        ink: {
          950: "#0a0a0a",
          900: "#171717",
          800: "#2f2f2f",
          700: "#424242",
          600: "#565656",
          500: "#666666",
          400: "#929292",
          300: "#b9b9b9",
          200: "#d8d8d8",
          100: "#e5e5e5",
          50: "#f7f7f7",
        },
        // Red ramp — anchored on the brand's exact spec values:
        // 600 Red #E50914, 700 Dark Red #B20710. Tints (50-500) and shades
        // (800-950) are derived from those two. Verified WCAG AA+ (white on
        // 600 = 4.79:1, white on 700 = 7.17:1; 600/700 on white pass too).
        brand: {
          950: "#34090c",
          900: "#56090d",
          800: "#80080e",
          700: "#b20710",
          600: "#e50914",
          500: "#e71d27",
          400: "#eb444c",
          300: "#f2848a",
          200: "#f7b0b4",
          100: "#fbddde",
          50: "#fdf0f1",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(10,10,10,0.06), 0 8px 24px -8px rgba(10,10,10,0.12)",
        "card-hover": "0 1px 2px 0 rgba(10,10,10,0.08), 0 16px 40px -12px rgba(10,10,10,0.22)",
        glow: "0 0 0 1px rgba(229,9,20,0.25), 0 8px 30px -8px rgba(229,9,20,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        marquee: "marquee 22s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
