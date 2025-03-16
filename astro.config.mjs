import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

/**
 * Configuração do Astro com detecção inteligente de ambiente
 * @version 1.2.0 - 2025-03-15 - Adicionadas otimizações de SEO e performance
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
    build: {
      // Otimizações para performance e SEO
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar bibliotecas grandes em chunks separados
            'react-vendor': ['react', 'react-dom'],
            'ui-components': ['tailwindcss']
          }
        }
      }
    },
    // Otimizações de CSS
    css: {
      devSourcemap: !isProd
    },
    // Otimizações de imagem
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    // Configurações de compressão
    plugins: []
  },
  
  // Configurações de build
  build: {
    // Otimizações para SEO
    format: 'file',
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  
  // Configurações de site para SEO
  site: 'https://lytspot.com.br',
  trailingSlash: 'always'
});