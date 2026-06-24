import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7fd",
          100: "#d9ecf9",
          200: "#b7d9f3",
          300: "#7bb7e0",
          400: "#5a9ed4",
          500: "#3a82c0",
          600: "#2a68a2",
          700: "#235484",
          800: "#22486d",
          900: "#213d5c",
          950: "#16273d",
        },
        primary: {
          DEFAULT: "#7bb7e0",
          dark: "#1a3a5c",
          light: "#b7d9f3",
        },
        accent: {
          DEFAULT: "#d4a843",
          light: "#e8c97a",
          dark: "#b08a30",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;