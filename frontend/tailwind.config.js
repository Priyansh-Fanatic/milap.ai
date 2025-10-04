module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS/TS files in src for Tailwind classes
  ],
  darkMode: "class", // Enable class-based dark mode toggling
  theme: {
    extend: {
      colors: {
        indigo: {
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [

  ],
};