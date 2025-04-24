/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cube: {
          yellow: '#fde047',
          blue: '#3b82f6',
          orange: '#f97316',
          red: '#ef4444',
          green: '#10b981',
          white: '#f8fafc',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gentle': 'pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        'cube': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};