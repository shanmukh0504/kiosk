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
          // The actual animation will only run for 1/5 of the specified duration
          "0%, 40%": { transform: "translateX(-100%) skew(240deg)" },
          "60%, 100%": { transform: "translateX(100%) skew(240deg)" },
        },
      },
      animation: {
        // Change `infinite` to `forwards` to have the animation run only once
        shine: `shine 5s ${cubicInOut} infinite`,
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
