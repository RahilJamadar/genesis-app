/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scopes Tailwind to only work inside the genesis-root div
  important: '#genesis-root',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ensuring cyan and other colors are available
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
    },
  },
  plugins: [],
}