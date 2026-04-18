/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        soil: {
          50: '#fdf8f0',
          100: '#f9edd8',
          200: '#f2d9ae',
          300: '#e8bf7c',
          400: '#dca050',
          500: '#d4892f',
          600: '#c07024',
          700: '#9f5820',
          800: '#814623',
          900: '#6a3a1f',
        },
        leaf: {
          50: '#f0faf0',
          100: '#d9f2db',
          200: '#b3e5b8',
          300: '#7dd188',
          400: '#4ab857',
          500: '#2a9e38',
          600: '#1d7f2a',
          700: '#186524',
          800: '#175120',
          900: '#14431c',
        },
        sky: {
          50: '#f0f7ff',
          100: '#dbeefe',
          200: '#bfdffd',
          300: '#93c7fc',
          400: '#60a5f9',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
