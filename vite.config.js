import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_URL || '/', // Define a base URL para o projeto
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias para a pasta "src"
    },
  },
  server: {
    host: true, // Permite conexões externas durante o desenvolvimento
    port: 4321, // Porta personalizada
    proxy: {
      '/api': {
        target: process.env.API_URL || 'https://lytspot.onrender.com', // Proxy para o backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist', // Diretório de saída
  },
});
