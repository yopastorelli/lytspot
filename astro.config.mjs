import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

/**
 * Configuração do Astro com detecção inteligente de ambiente
 * @version 1.1.0 - 2025-03-12 - Adicionada detecção de ambiente para Render
 */

// Detectar ambiente de forma mais robusta
const isRenderEnv = process.env.RENDER === 'true';
const isProd = process.env.NODE_ENV === 'production' || isRenderEnv;
const apiUrl = isProd ? 'https://lytspot.onrender.com' : 'http://localhost:3000';

console.log(`[ASTRO CONFIG] Ambiente: ${isProd ? 'produção' : 'desenvolvimento'}`);
console.log(`[ASTRO CONFIG] API URL configurada: ${apiUrl}`);

// Configuração simplificada do Astro
export default defineConfig({
  integrations: [react(), tailwind()],
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 4321,
    host: true,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // Logs detalhados para diagnóstico
          proxy.on('error', (err, req, res) => {
            console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, err);
          });
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[PROXY REQUEST] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[PROXY RESPONSE] ${proxyRes.statusCode} ${req.url}`);
          });
        }
      }
    }
  },
  
  // Configuração do Vite
  vite: {
    // Configuração para garantir que variáveis de ambiente estejam disponíveis
    define: {
      'process.env.API_URL': JSON.stringify(apiUrl),
      'process.env.IS_PRODUCTION': isProd
    },
    
    // Ativando logs detalhados para debug
    logLevel: 'info',
    
    // Configuração de server para melhor feedback durante desenvolvimento
    server: {
      hmr: {
        overlay: true
      },
      watch: {
        usePolling: true
      }
    }
  }
});