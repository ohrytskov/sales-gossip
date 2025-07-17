// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',  // components and pages
    './src/styles/**/*.{css}',          // globals.css
  ],
  theme: {
    extend: {
      colors: {
        // custom colors…
      },
      fontFamily: {
        // override the 'sans' key
        sans: ['DM Sans', 'sans‑serif'],
        inter: ['Inter', 'sans‑serif'],
      },
    },
  },
  plugins: [],
}
