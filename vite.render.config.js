import { defineConfig } from 'vite';
import path from 'path';

/**
 * Configuração do Vite específica para o ambiente Render
 * @version 1.0.0 - 2025-03-14 - Configuração otimizada para build em produção no Render
 */
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Configuração simplificada para evitar problemas com o Rollup
    rollupOptions: {
      external: [
        // Dependências do servidor que não devem ser incluídas no bundle
        '@prisma/client',
        'prisma',
        'fs',
        'path',
        'crypto',
        'child_process',
        'express',
        'cors',
        'dotenv',
        'winston',
        'nodemailer',
        'bcryptjs',
        'jsonwebtoken',
        // Módulos que causam problemas no build
        'axios',
        'node-fetch'
      ],
      output: {
        // Configuração básica para garantir compatibilidade
        format: 'es',
        // Sem preserveModules para simplificar o build
        manualChunks: {
          // Agrupar dependências em chunks lógicos
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // Configurações simplificadas para o build
    minify: 'terser',
    // Desativar a remoção de console.logs para facilitar o diagnóstico
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    // Outras configurações para garantir um build estável
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Desativar a geração de source maps em produção
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.VITE_API_URL': '"https://lytspot.onrender.com/api"',
  },
});
