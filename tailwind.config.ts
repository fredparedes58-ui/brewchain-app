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
        espresso: "#1A0D05",
        tostado: "#3B1F08",
        caramelo: "#8B5E3C",
        latte: "#C49A6C",
        crema: "#FBF6EE",
        verde: "#1B5E30",
        eudr: "#1A2E5C",
        amber: { warn: "#D97706" },
        brewchain: {
          red: "#DC2626",
          green: "#1B5E30",
          amber: "#D97706",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
