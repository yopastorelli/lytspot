import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  output: 'static', // Configuração para saída estática
  base: '/', // Base para o domínio
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
    host: true, // Permite acesso pela rede local
    port: 4321, // Porta do servidor de desenvolvimento
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
          target: 'https://lytspot.onrender.com', // Garante o uso de IPv4
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // Mantém o caminho original
        },
      },
    },
  },
  integrations: [
    tailwind({ config: './tailwind.config.js' }), // Configuração do Tailwind
    react(), // Integração com React
  ],
});
