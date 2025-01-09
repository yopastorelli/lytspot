/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A73E8', // Novo azul primário mais vibrante
          light: '#4A90E2', // Tom claro para contrastar
          dark: '#0C47A1', // Tom mais escuro para elementos destacados
        },
        secondary: {
          DEFAULT: '#FFB74D', // Novo laranja secundário para contraste
          light: '#FFD080',
          dark: '#E6932D',
        },
        neutral: {
          light: '#F5F5F5', // Tons neutros reformulados
          DEFAULT: '#E0E0E0',
          dark: '#9E9E9E',
        },
        success: {
          DEFAULT: '#4CAF50', // Verde para feedback positivo
        },
        dark: {
          DEFAULT: '#121212', // Um tom escuro para o fundo
          lighter: '#1E1E1E', // Alternativa mais clara, se necessário
        },
        error: {
          DEFAULT: '#F44336', // Vermelho para feedback negativo
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
