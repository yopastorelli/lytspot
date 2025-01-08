import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  output: 'static', // Gera um site estático
  base: process.env.BASE_URL || '/', // Define a URL base correta
  publicDir: 'public', // Garante que a pasta "public" seja usada
  build: {
    outDir: 'dist', // Diretório de saída
    async afterBuild() {
      try {
        const distDir = 'dist';
        if (!existsSync(distDir)) {
          mkdirSync(distDir);
        }
        const cnamePath = `${distDir}/CNAME`;
        writeFileSync(cnamePath, 'www.lytspot.com.br', 'utf8');
        console.log(`CNAME file created successfully at ${cnamePath}`);
      } catch (error) {
        console.error('Error creating CNAME file:', error);
      }
    },
  },
  server: {
    host: true, // Permite conexões externas no servidor local
    port: 4321, // Porta de desenvolvimento
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname, // Atalho para "src"
      },
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.API_URL || 'https://lytspot.onrender.com', // Proxy para o backend
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  },
  integrations: [
    tailwind({ config: './tailwind.config.js' }), // Integração com Tailwind CSS
    react(), // Integração com React
  ],
});
