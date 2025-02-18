/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'white': "#fff",
      'red': "#FF7CA3",
      'bg': {
        100: "#252836",
        200: "#1F1D2B",
        300: "#2D303E"
      },
      "primary": "#EA7C69",
      "text": "#ABBBC2",
      "stroke": "#393C49",
      "transparent": "#00000000",
    },
    extend: {
    },
  },
  plugins: [],
}

