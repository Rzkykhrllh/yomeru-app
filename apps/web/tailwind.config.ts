import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Noto Sans JP", "sans-serif"],
      },
      colors: {
        surface: "#f6f7fb",
        panel: "#ffffff",
        card: "#ffffff",
        line: "#e8ecf3",
        body: "#1f2430",
        muted: "#7b8596",
        ink: "#12151c",
        accent: "#232935",
        "accent-soft": "#eaf2ff",
        highlight: "#f3f6fb",
        "highlight-strong": "#dbe9ff",
        ring: "#c7d8f8",
      },
      backgroundImage: {
        "app-gradient":
          "radial-gradient(1200px 600px at 12% -10%, #ffffff 0%, #f6f7fb 55%, #eef2f8 100%)",
      },
      boxShadow: {
        card: "0 1px 0 rgba(16, 24, 40, 0.04), 0 12px 30px rgba(16, 24, 40, 0.06)",
        "card-hover": "0 12px 30px rgba(16, 24, 40, 0.1)",
        soft: "0 4px 12px rgba(16, 24, 40, 0.08)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
