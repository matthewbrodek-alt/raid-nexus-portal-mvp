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
        abyss: "#07070a",
        obsidian: "#101116",
        charcoal: "#191b22",
        blood: "#9f1d22",
        ember: "#d63c2d",
        relic: "#d8a847",
        pale: "#f2ead6"
      },
      boxShadow: {
        glow: "0 0 40px rgba(216, 168, 71, 0.18)",
        blood: "0 0 34px rgba(159, 29, 34, 0.2)"
      },
      backgroundImage: {
        "raid-radial":
          "radial-gradient(circle at 18% 12%, rgba(216,168,71,0.16), transparent 28%), radial-gradient(circle at 86% 18%, rgba(159,29,34,0.18), transparent 30%), linear-gradient(135deg, #07070a 0%, #121319 52%, #060608 100%)"
      }
    }
  },
  plugins: [forms]
};

export default config;
