/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#1A1A1A',
        accent: '#FF4D4D'
      }
    }
  },
  plugins: []
};