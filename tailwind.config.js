/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#006820",
        "accent-gold": "#D4AF37",
        "warm-gold": "#D4AF37",
        "forest-green": "#0a2e1e",
        "deep-green": "#113d2a",
        "swamp-deer": "#1b4332",
        "warm-gold": "#D4AF37",
        "neutral-light": "#f8f9f8",
        "border-light": "#e5e7eb"
      },
      fontFamily: {
        display: "Manrope, sans-serif"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
