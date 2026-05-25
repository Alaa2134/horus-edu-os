/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#050816",
          900: "#070B1A",
          800: "#0B1020",
          700: "#11162B",
          600: "#161B33",
        },
        danger: "#FF3B3B",
        critical: "#FF8A00",
        ai: "#00E5FF",
        ok: "#22C55E",
        info: "#3B82F6",
      },
      spacing: {
        "4.5": "1.125rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(0,229,255,0.45)",
        "glow-danger": "0 0 40px -8px rgba(255,59,59,0.55)",
        "glow-critical": "0 0 40px -8px rgba(255,138,0,0.5)",
        glass: "0 8px 32px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(0,229,255,0.12), transparent 60%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,59,59,0.6)" },
          "70%": { boxShadow: "0 0 0 16px rgba(255,59,59,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,59,59,0)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.6s infinite",
        scanline: "scanline 2.4s linear infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        "slide-in": "slide-in 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        blink: "blink 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
