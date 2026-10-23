/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00F0FF',
          violet: '#8A2BE2',
          magenta: '#FF2E93',
          dark: '#08080C'
        }
      }
    }
  },
  plugins: []
};
