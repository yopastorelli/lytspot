/**
 * Script para monitoramento de Web Vitals
 * Versão: 1.0.0
 * Data: 2025-03-15
 * 
 * Este script coleta métricas de performance importantes para SEO
 * e as envia para análise.
 */

// Função para enviar métricas para análise
function sendToAnalytics(metric) {
  // Verificar se o navegador suporta sendBeacon
  if (navigator.sendBeacon) {
    const url = '/api/analytics/web-vitals';
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      navigationType: performance.getEntriesByType('navigation')[0]?.type || 'navigate',
      url: window.location.href,
      timestamp: Date.now()
    });
    
    // Tentar enviar via sendBeacon primeiro (não bloqueante)
    const success = navigator.sendBeacon(url, body);
    
    // Fallback para fetch se sendBeacon falhar
    if (!success) {
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(console.error);
    }
  } else {
    // Fallback para navegadores que não suportam sendBeacon
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now()
      }),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }
  
  // Também registrar no console para debug
  if (window.location.hostname === 'localhost') {
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
      webVitals.onINP(sendToAnalytics);
    }
  };
  document.head.appendChild(script);
}

// Iniciar carregamento após o evento DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadWebVitals);
} else {
  // Se o DOM já estiver carregado, iniciar imediatamente
  loadWebVitals();
}
