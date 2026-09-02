/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Keep in sync with src/constants/appColors.ts
        gold: "#d4af37",
        goldDark: "#8a6d1f",
        cardBg: "#0a0a0a",
      },
    },
  },
  plugins: [],
};
