/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#181A20', // dark background
        accentBlue: '#3B82F6', // blue accent
        accentGreen: '#22D3EE', // green accent
        accentPurple: '#A78BFA', // purple accent
        accentOrange: '#F59E42', // orange accent
      },
      fontFamily: {
        gamer: ['"Orbitron"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
