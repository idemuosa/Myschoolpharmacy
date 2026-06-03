/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Inter', 'sans-serif'], // Use Inter as placeholder for outfit for compatibility
      },
    },
  },
  plugins: [],
}
