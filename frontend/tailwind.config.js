const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: colors.blue,
        amber: colors.indigo,
        luxury: {
          dark: '#070C1B',
          navy: '#0F172A',
          slate: '#1E293B',
          gold: '#3B82F6',
          orange: '#2563EB',
          bronze: '#1D4ED8',
          light: '#F8FAFC',
          glass: 'rgba(15, 23, 42, 0.65)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.3)',
        'luxury': '0 10px 30px -10px rgba(7, 12, 27, 0.15)',
        'gold-glow': '0 0 15px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
