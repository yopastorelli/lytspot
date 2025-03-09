/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './public/**/*.html',
    './index.astro',
    './src/components/**/*.{astro,js,jsx,ts,tsx}',
    './src/layouts/**/*.{astro,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000430',
          light: '#4A90E2',
          dark: '#051520',
        },
        accent: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        neutral: {
          light: '#041424',
          DEFAULT: '#1A1A1A',
          dark: '#333333',
        },
        success: {
          DEFAULT: '#4CAF50',
        },
        light: {
          DEFAULT: '#F5F5F5',
          darker: '#E0E0E0',
        },
        error: {
          DEFAULT: '#F44336',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Nunito', 'Arial', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
