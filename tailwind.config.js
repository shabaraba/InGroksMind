/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1d9bf0',
        'twitter-dark': '#15202b',
        'twitter-darker': '#192734',
        'twitter-border': '#2f3336',
        'twitter-light-border': '#38444d',
      },
    },
  },
  plugins: [],
}