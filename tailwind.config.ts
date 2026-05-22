import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
      },
      fontSize: {
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "h1": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "h2": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" }],
        "h3": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.55" }],
        "body": ["0.9375rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.375rem",
      },
      boxShadow: {
        "elev-1": "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "elev-2": "0 2px 8px -2px rgb(0 0 0 / 0.06), 0 1px 3px -1px rgb(0 0 0 / 0.04)",
        "elev-3": "0 8px 20px -6px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.06)",
        "elev-4": "0 20px 40px -12px rgb(0 0 0 / 0.18), 0 4px 12px -4px rgb(0 0 0 / 0.08)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "shimmer": "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
