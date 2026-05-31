/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          teal: '#00d4aa',
          blue: '#4a9eff',
          purple: '#a78bfa',
          red: '#ff6b7a',
          amber: '#fbbf24',
          green: '#34d399',
          dark: '#050b18',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(.215,.61,.355,1) infinite',
        'slide-up': 'slideUp .5s ease both',
        'fade-in': 'fadeIn .4s ease both',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        breathe: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.03)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        'pulse-ring': { '0%': { transform: 'scale(.9)', opacity: '.8' }, '70%,100%': { transform: 'scale(1.2)', opacity: '0' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
