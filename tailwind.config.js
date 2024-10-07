/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { createThemes } = require("tw-colors");

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
