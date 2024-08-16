/** @type {import('tailwindcss').Config} */
const { createThemes } = require("tw-colors");

export default {
  content: ["./index.html", "./src/**/*.{jsx,tsx,js,ts}"],
  theme: {
    extend: {},
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
