import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static', // Configura saída estática para deploy
  base: '/', // URL base, pode ser ajustada dependendo do repositório
  build: {
    outDir: 'dist', // Define a pasta de saída do build
  },
  integrations: [tailwind(), react()],
});
