

export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#edfff4',
          100: '#d5ffe6',
          200: '#aeffcf',
          300: '#70ffab',
          400: '#2bfd80',
          500: '#00e85f',
          600: '#00a651',
          700: '#008a44',
          800: '#066c38',
          900: '#075930',
          950: '#003219',
        },
      }
    },
  },
  plugins: [],
}

