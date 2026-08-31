/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0e4359',
          'primary-dark': '#092d3c',
          'primary-light': '#145773',
          accent: '#a78f31',
          'accent-hover': '#917b27',
          'accent-light': '#fdfaf0',
          waiting: '#eab308',
          'waiting-bg': '#fefce8',
          'waiting-border': '#fde047',
          approved: '#16a34a',
          'approved-bg': '#f0fdf4',
          'approved-border': '#86efac'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
