import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    nextui({
      themes: {
        dark: {
          fontFamily: {
            sans: ["Poppins", "sans-serif"],
          },
          colors: {
            background: "#1F1F1F",
            secondary: "#9BC8E3",
            warning: "#F4BA41",
            yellow: "#F4BA41",
            orange: "#EC8B33",
            blue: "#4D9CB9",
            black: "#161616",
            "original-black": "#000000",
            "dark-blue": "#112F45",
            white: "#FFFFFF",
            "light-blue": "#DFF3FF",
          },
        },
      },
    }),
  ],
  keygrames: {
    shimer: {
      "100%": { transform: "translateX(100%)" },
    },
  },
};
