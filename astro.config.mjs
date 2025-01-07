import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  output: 'static', // Configuração para saída estática (necessário para GitHub Pages)
  base: '/lytspot/', // Ajuste para o nome do repositório no GitHub Pages
  build: {
    outDir: 'dist', // Diretório de saída para os arquivos estáticos
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
    port: 4321, // Porta para servidor de desenvolvimento
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
          target: 'http://127.0.0.1:3000', // Backend local durante o desenvolvimento
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'), // Mantém o caminho
        },
      },
    },
  },
  integrations: [
    tailwind({ config: './tailwind.config.js' }), // Integração com Tailwind CSS
    react(), // Integração com React
  ],
});
