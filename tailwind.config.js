/** @type {import('tailwindcss').Config} */
import { createThemes } from "tw-colors";

const cubicInOut = "cubic-bezier(0.66, 0.00, 0.34, 1.00)";
const customCubic = "cubic-bezier(.85,.52,.12,.58)";

export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx,js,ts}"],
  theme: {
    extend: {
      colors: {
        rose: "#FC79C1",
        "dark-grey": "#473C75",
        "mid-grey": "#817A90",
        "light-grey": "#E3E0EB",
        "off-white": "#F4F0FC",
        "error-red": "#FF005C",
        "light-green": "#4DCB75",
      },
      screens: {
        xs: "360px",
        sm: "600px",
        md: "900px",
        lg: "1200px",
        xl: "1440px",
        "2xl": "1536px",
        // => @media (min-width: 1120px) { ... }
      },
      transitionTimingFunction: {
        "cubic-in-out": cubicInOut,
        "cubic-in": "cubic-bezier(0.40, 0.00, 0.68, 0.06)",
        "cubic-out": "cubic-bezier(0.32, 0.94, 0.60, 1.00)",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%) skewX(30deg)", opacity: 1 },
          "100%": { left: "100%", transform: "skewX(30deg)", opacity: 1 },
        },
        "navbar-shine": {
          "0%": { transform: "translateX(-100%) skewX(135deg)", opacity: 1 },
          "100%": { left: "100%", transform: "skewX(135deg)", opacity: 1 },
        },
        "loader-shine": {
          "0%": { transform: "translateX(-120%) skewX(135deg)", opacity: 1 },
          "100%": { left: "120%", transform: "skewX(135deg)", opacity: 1 },
        },
        "button-shine": {
          "0%": { transform: "translateX(-100%) skewX(30deg)", opacity: 1 },
          "100%": { left: "100%", transform: "skewX(30deg)", opacity: 1 },
        },
      },
      animation: {
        shine: `shine 1s ${cubicInOut}`,
        "navbar-shine": `navbar-shine 2s ${customCubic} infinite`,
        "loader-shine": `loader-shine 2s ${customCubic} infinite`,
        "button-shine": `button-shine 2s ${customCubic} infinite`,
      },
      boxShadow: {
        custom: "0px 0px 16px #554B6A14",
      },
    },
  },
  plugins: [
    createThemes({
      swap: {
        primary: "#E4EBF2",
        "primary-lighter": "#DEF6EE",
      },
      quests: {
        primary: "#D8BEFF",
      },
      stake: {
        primary: "#E4EBF2",
      },
    }),
  ],
};
