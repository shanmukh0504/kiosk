/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { createThemes } = require("tw-colors");

const cubicInOut = "cubic-bezier(0.66, 0.00, 0.34, 1.00)";

export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx,js,ts}"],
  theme: {
    extend: {
      colors: {
        rose: "#E36492",
        "dark-grey": "#554B6A",
        "mid-grey": "#817A90",
        "light-grey": "#E3E0EB",
        "off-white": "#F4F0FC",
      },
      transitionTimingFunction: {
        "cubic-in-out": cubicInOut,
        "cubic-in": "cubic-bezier(0.40, 0.00, 0.68, 0.06)",
        "cubic-out": "cubic-bezier(0.32, 0.94, 0.60, 1.00)",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%) skewX(30deg)" },
          "100%": { left: "100%", transform: "skewX(30deg)" },
        },
      },
      animation: {
        shine: `shine 1s ${cubicInOut} infinite`,
      },
    },
  },
  plugins: [
    createThemes({
      swap: {
        primary: "#7BDCBA",
        "primary-lighter": "#DEF6EE",
      },
      quests: {
        primary: "#D8BEFF",
      },
    }),
  ],
};
