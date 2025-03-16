/**
 * Script para monitoramento de Web Vitals
 * Versão: 1.3.0
 * Data: 2025-03-15
 * 
 * Este script coleta métricas de performance importantes para SEO
 * e as envia para análise.
 */

// Função para enviar métricas para análise
function sendToAnalytics(metric) {
  // Criar o objeto de dados a ser enviado
  const data = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    navigationType: performance.getEntriesByType('navigation')[0]?.type || 'navigate',
    url: window.location.href,
    timestamp: Date.now()
  };
  
  // Converter para JSON
  const body = JSON.stringify(data);
  
  // Definir URLs para tentar em ordem
  const urls = [
    '/analytics/web-vitals',
    '/api/analytics/web-vitals'
  ];
  
  // Função para tentar enviar com fetch
  const sendWithFetch = (url, attempt = 0) => {
    console.log(`[Web Vitals] Tentando enviar via fetch para ${url} (tentativa ${attempt + 1})`);
    
    return fetch(url, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    })
    .then(response => {
      if (response.ok) {
        console.log(`[Web Vitals] Métricas enviadas com sucesso para ${url}: ${response.status}`);
        return true;
      } else {
        console.warn(`[Web Vitals] Resposta não-OK de ${url}: ${response.status}`);
        throw new Error(`Status ${response.status}`);
      }
    })
    .catch(error => {
      console.error(`[Web Vitals] Erro ao enviar métricas para ${url}:`, error);
      
      // Se ainda há URLs para tentar
      const nextIndex = urls.indexOf(url) + 1;
      if (nextIndex < urls.length) {
        console.log(`[Web Vitals] Tentando próxima URL: ${urls[nextIndex]}`);
        return sendWithFetch(urls[nextIndex], 0);
      }
      
      // Se já tentamos todas as URLs mas ainda temos tentativas restantes
      if (attempt < 2) {
        console.log(`[Web Vitals] Tentando novamente ${url} após 1s (tentativa ${attempt + 2})`);
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(sendWithFetch(url, attempt + 1));
          }, 1000);
        });
      }
      
      console.error('[Web Vitals] Todas as tentativas falharam');
      return false;
    });
  };
  
  // Tentar enviar com sendBeacon primeiro (se disponível)
  let beaconSuccess = false;
  
  if (navigator.sendBeacon) {
    // Tentar cada URL com sendBeacon
    for (const url of urls) {
      console.log(`[Web Vitals] Tentando enviar via sendBeacon para ${url}`);
      beaconSuccess = navigator.sendBeacon(url, body);
      
      if (beaconSuccess) {
        console.log(`[Web Vitals] Métricas enviadas com sucesso via sendBeacon para ${url}`);
        break;
      } else {
        console.warn(`[Web Vitals] SendBeacon falhou para ${url}, tentando próxima URL`);
      }
    }
  } else {
    console.log('[Web Vitals] SendBeacon não suportado, usando fetch');
  }
  
  // Se sendBeacon falhou ou não está disponível, usar fetch
  if (!beaconSuccess) {
    sendWithFetch(urls[0])
      .then(success => {
        if (success) {
          console.log('[Web Vitals] Envio via fetch bem-sucedido');
        } else {
          console.error('[Web Vitals] Falha no envio via fetch após todas as tentativas');
        }
      });
  }
  
  // Também registrar no console para debug
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168.')) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
  }
}

// Carregar a biblioteca web-vitals de forma assíncrona
function loadWebVitals() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
  script.async = true;
  script.onload = () => {
    // Quando a biblioteca estiver carregada, iniciar monitoramento
    if (typeof webVitals !== 'undefined') {
      webVitals.onCLS(sendToAnalytics);
      webVitals.onFID(sendToAnalytics);
      webVitals.onLCP(sendToAnalytics);
      webVitals.onTTFB(sendToAnalytics);
      webVitals.onFCP(sendToAnalytics);
      
      console.log('[Web Vitals] Monitoramento iniciado');
    } else {
      console.error('[Web Vitals] Biblioteca não carregada corretamente');
    }
  };
  script.onerror = (error) => {
    console.error('[Web Vitals] Erro ao carregar biblioteca:', error);
  };
  document.head.appendChild(script);
}

// Iniciar carregamento após o evento DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadWebVitals);
} else {
  // Se o DOM já foi carregado, iniciar imediatamente
  loadWebVitals();
}
