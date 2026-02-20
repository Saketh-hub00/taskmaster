/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "background-dark": "#101622",
        "surface-dark": "#1c2333",
        "border-dark": "#2d3748",
        "card-dark": "#282e39",
        "text-secondary": "#9da6b9",
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
