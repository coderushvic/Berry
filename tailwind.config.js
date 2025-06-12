module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        cards: "#8b6060eb",
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', // Custom blue gradient
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}