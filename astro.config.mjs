import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static',
  base: '/', // Mantenha "/" se for um domínio raiz ou "/repositorio" se for um subdomínio
});