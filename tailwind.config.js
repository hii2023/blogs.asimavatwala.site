/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FEFBF7',
        ink: '#1A1510',
        'accent-coral': '#C8472A',
        'accent-blue': '#2C5F8A',
        'accent-gold': '#D4A942',
        'accent-green': '#4A7C59',
        muted: '#7A6E62',
        border: '#EAE4DC',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
