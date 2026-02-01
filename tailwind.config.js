/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#D2B48C',
          medium: '#A0522D',
          dark: '#6B5344',
          board: '#8B7355',
        },
      },
    },
  },
  plugins: [],
}
