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
        changeOrigin: true, // Permite proxy em hosts diferentes
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Reescreve o caminho
      },
    },
  },
  build: {
    outDir: 'dist', // Diretório de saída
    emptyOutDir: true, // Limpa o diretório de saída antes de construir
    rollupOptions: {
      // Marcar dependências do Node.js como externas para evitar problemas de build
      external: [
        /^node:.*/,  // Módulos nativos do Node.js
        '@prisma/client',
        'prisma',
        'fs',
        'path',
        'crypto',
        'child_process',
        'bcryptjs',
        'jsonwebtoken',
        'express',
        'cors',
        'dotenv',
        'winston',
        'nodemailer'
      ],
      output: {
        // Preservar módulos para melhor compatibilidade
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src'
      }
    }
  },
  // Configuração adicional para compatibilidade com diferentes ambientes
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
