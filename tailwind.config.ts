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
        nisc: {
          orange: "#F97316",
          "orange-dark": "#EA580C",
          "orange-light": "#FFF7ED",
          navy: "#1E293B",
          "navy-light": "#334155",
          blue: "#3B82F6",
          "blue-dark": "#1D4ED8",
          purple: "#8B5CF6",
          peach: "#FFF7ED",
          gray: "#64748B",
          "gray-light": "#F1F5F9",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        heading: ['"Outfit"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        soft: "0 2px 8px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "nisc-gradient": "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 30%, #EFF6FF 70%, #F0F9FF 100%)",
        "nisc-hero": "linear-gradient(180deg, #FFF7ED 0%, #FEFCE8 40%, #EFF6FF 100%)",
        "orange-gradient": "linear-gradient(135deg, #F97316 0%, #F59E0B 50%, #EC4899 100%)",
        "blue-gradient": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
