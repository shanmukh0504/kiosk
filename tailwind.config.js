/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { createThemes } = require("tw-colors");

export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx,js,ts}"],
  theme: {
    extend: {
      colors: {
        // TODO: Move these to garden-book
        "mid-grey": "#817A90",
        "light-grey": "#E3E0EB",
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
