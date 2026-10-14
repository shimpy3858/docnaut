/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#070B1A',
          800: '#0D1226',
          700: '#141B33',
          600: '#1B2444',
        },
        royal: {
          900: '#2A0F4F',
          800: '#3A1668',
          700: '#4A1D87',
          600: '#5B24A6',
        },
        gold: {
          100: '#FFF4D1',
          200: '#F5D77A',
          300: '#EBC558',
          400: '#D4AF37',
          500: '#BF9B30',
          600: '#A88420',
        },
        ivory: '#FFF8E7',
      },
      fontFamily: {
        heading: ['"Cinzel"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.6)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5D77A 50%, #D4AF37 100%)',
        'royal-gradient': 'linear-gradient(135deg, #070B1A 0%, #2A0F4F 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #D4AF37 0%, #F5D77A 50%, #D4AF37 100%)',
      },
    },
  },
  plugins: [],
};
