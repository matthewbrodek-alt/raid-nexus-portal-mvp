import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#07111f",
        obsidian: "#101a2b",
        charcoal: "#1b2940",
        blood: "#1f5fbf",
        ember: "#4b8dff",
        relic: "#2f7cff",
        pale: "#edf5ff"
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(47, 124, 255, 0.2)",
        blood: "0 0 34px rgba(31, 95, 191, 0.18)"
      },
      backgroundImage: {
        "raid-radial":
          "radial-gradient(circle at 18% 12%, rgba(47,124,255,0.18), transparent 28%), radial-gradient(circle at 86% 18%, rgba(74,141,255,0.14), transparent 30%), linear-gradient(135deg, #07111f 0%, #101a2b 52%, #050a13 100%)"
      }
    }
  },
  plugins: [forms]
};

export default config;
