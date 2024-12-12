import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync } from 'fs';

export default defineConfig({
  output: 'static', // Configura saída como estática (necessário para GitHub Pages)
  base: '/', // URL base (para domínios personalizados ou raiz de repositório)
  build: {
    outDir: 'dist', // Define o diretório de saída
    async afterBuild() {
      // Cria o arquivo CNAME automaticamente no diretório dist
      writeFileSync('dist/CNAME', 'www.lytspot.com.br');
    },
  },
  server: {
    host: true, // Permite que o servidor local seja acessível na rede
    port: 4321, // Define a porta (ajuste se necessário)
  },
  integrations: [tailwind(), react()], // Integrações usadas no projeto
});
