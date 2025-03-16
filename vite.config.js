import { defineConfig } from 'vite';
import path from 'path';

/**
 * Configuração do Vite para o projeto Lytspot
 * @version 1.5.0 - 2025-03-16 - Melhorada a configuração de proxy para resolver problemas de CORS
 */
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
        target: process.env.API_URL || 'https://lytspot-api.onrender.com', // URL corrigida para a API
        changeOrigin: true, // Permite proxy em hosts diferentes
        secure: false, // Permite conexões inseguras durante o desenvolvimento
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Mantém o prefixo /api
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erro de proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Enviando requisição para:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`Recebida resposta de ${req.url}: ${proxyRes.statusCode}`);
          });
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        },
      },
    },
    cors: true, // Habilita CORS para todas as rotas
  },
  build: {
    outDir: 'dist', // Diretório de saída
    emptyOutDir: true, // Limpa o diretório de saída antes de construir
    minify: 'esbuild', // Usar esbuild para minificação em vez de terser
    rollupOptions: {
      // Marcar dependências do Node.js e bibliotecas problemáticas como externas
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
        'nodemailer',
        'axios',  // Adicionado axios como dependência externa
        'node-fetch'
      ],
      output: {
        // Preservar módulos para melhor compatibilidade
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src'
      }
    },
    sourcemap: true, // Gera sourcemaps para facilitar a depuração
  },
  // Configurações específicas para produção
  preview: {
    port: 4321,
    host: true,
    strictPort: true,
  },
  // Configurações para otimização
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
