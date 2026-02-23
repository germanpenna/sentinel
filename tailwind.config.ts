import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0a0a0a",
        surfaceHover: "#111111",
        border: "#1a1a1a",
        accent: {
          DEFAULT: "#00E599", // Clario-style green
          glow: "rgba(0, 229, 153, 0.15)",
        },
        muted: {
          DEFAULT: "#737373",
          dark: "#404040",
        },
        risk: {
          red: "#FF4444",
          yellow: "#FFB020",
          green: "#00E599",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 229, 153, 0.1) 0%, rgba(5, 5, 5, 0) 50%)',
        'surface-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'accent-glow': '0 0 40px -10px rgba(0, 229, 153, 0.3)',
        'surface-elevation': '0 4px 24px -1px rgba(0, 0, 0, 0.5), 0 0 1px 0 rgba(255, 255, 255, 0.1) inset',
      }
    },
  },
  plugins: [],
};
export default config;
