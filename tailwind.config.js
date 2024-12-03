/** @type {import('tailwindcss').Config} */
import { createThemes } from "tw-colors";

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
      },
      animation: {
        shine: `shine 1s ${cubicInOut}`,
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
      stake: {
        primary: "#FFCD82",
      }
    }),
  ],
};
