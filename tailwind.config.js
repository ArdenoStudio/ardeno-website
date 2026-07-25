/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './constants.tsx',
    './components/**/*.{ts,tsx}',
    './components/Docs/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        body: ['Sora', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        brand: ['Bricolage Grotesque', 'sans-serif'],
        ui: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#080809',
        surface: {
          DEFAULT: '#0c0c0e',
          deep: '#060607',
        },
        accent: {
          DEFAULT: '#E50914',
          hover: '#B20710',
          glow: 'rgba(229, 9, 20, 0.5)',
        },
        zinc: {
          850: '#1f1f22',
          950: '#09090b',
        },
      },
      transitionTimingFunction: {
        ardeno: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
