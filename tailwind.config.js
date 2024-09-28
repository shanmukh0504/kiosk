/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { createThemes } = require("tw-colors");

export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        grey: "#554B6A",
      },
    },
  },
  plugins: [
    createThemes({
      swap: {
        primary: "#7BDCBA",
      },
      quests: {
        primary: "#D8BEFF",
      },
    }),
  ],
};
