/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#070C1B',       // Extreme deep slate black
          navy: '#0F172A',       // Rich luxury navy
          slate: '#1E293B',      // Elegant lighter slate
          gold: '#FCBF49',       // Warm luxury gold accent
          orange: '#F77F00',     // Vibrant signature orange
          bronze: '#D97706',     // Sophisticated deep amber
          light: '#F8FAFC',      // Soft primary light background
          glass: 'rgba(15, 23, 42, 0.65)' // Premium glassmorphism base
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(247, 127, 0, 0.3)',
        'luxury': '0 10px 30px -10px rgba(7, 12, 27, 0.15)',
        'gold-glow': '0 0 15px rgba(252, 191, 73, 0.25)',
      }
    },
  },
  plugins: [],
}
