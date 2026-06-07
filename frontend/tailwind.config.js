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
        orange: {
          400: '#EAB308', // Gold
          500: '#D4AF37', // Metallic Gold
          600: '#CA8A04', // Dark Gold
        },
        amber: {
          400: '#FDE047',
          500: '#EAB308',
        },
        luxury: {
          dark: '#070C1B',
          navy: '#0F172A',
          slate: '#1E293B',
          gold: '#D4AF37',
          orange: '#D4AF37',
          bronze: '#B45309',
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
        'glow': '0 0 15px rgba(212, 175, 55, 0.3)',
        'luxury': '0 10px 30px -10px rgba(7, 12, 27, 0.15)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
