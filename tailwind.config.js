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
      fontSize: {
        xs: '0.75rem', // 12px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        // ...etc.
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
