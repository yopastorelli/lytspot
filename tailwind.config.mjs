/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#041424',
          light: '#3c4c54',
        },
        secondary: {
          DEFAULT: '#2d3b44',
          light: '#3c4454',
        },
        dark: {
          DEFAULT: '#041424',
          lighter: '#1c2c34',
        },
        gray: {
          100: '#bdc0c4',
          200: '#848c92',
          300: '#7c848c',
          400: '#606b71',
          500: '#3c4c54',
          600: '#2d3b44',
          700: '#1c2c34',
          800: '#041424',
          900: '#020a12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
