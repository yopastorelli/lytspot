import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// Configuração simplificada do Astro
export default defineConfig({
  integrations: [react(), tailwind()],
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 4321,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
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
      'process.env.API_URL': JSON.stringify('http://localhost:3000')
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

// Log para confirmar a configuração da API
console.log('[ASTRO CONFIG] API URL configurada: http://localhost:3000');