/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0F4C81',
        secondary: '#0E9AA7',
        accent: '#F6CD61',
        dark: '#0B1B2B'
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
};

