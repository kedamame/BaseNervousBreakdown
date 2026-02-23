import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Voxel Noir: near-pure black with neon purple accent
        background: "#030305",
        surface: "#08080f",
        "surface-2": "#0e0e1a",
        border: "#1e1e2e",
        purple: {
          300: "#e9d5ff",
          400: "#d8b4fe",
          500: "#c084fc",
          600: "#a855f7",
          700: "#9333ea",
          800: "#6d28d9",
          900: "#3b0764",
        },
        accent: "#c084fc",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "flip-in": "flipIn 0.3s ease-in-out",
        "flip-out": "flipOut 0.3s ease-in-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "pixel-blink": "pixelBlink 1s step-end infinite",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        flipOut: {
          "0%": { transform: "rotateY(0deg)", opacity: "1" },
          "100%": { transform: "rotateY(90deg)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 6px #c084fc, 0 0 2px #c084fc" },
          "50%": { boxShadow: "0 0 24px #c084fc, 0 0 8px #c084fc" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pixelBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      perspective: {
        "1000": "1000px",
      },
    },
  },
  plugins: [],
};

export default config;
