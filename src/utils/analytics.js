/**
 * Módulo de analytics para o LytSpot
 * @version 1.0.0 - 2025-03-15
 * @description Fornece funções para capturar e enviar métricas de performance e eventos de usuário
 */

import { getApiUrl, getEnvironment } from './environment.js';
// Importação correta das funções individuais do web-vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

/**
 * Envia métricas de Web Vitals para o servidor
 * @param {Object} metric - Métrica de Web Vitals
 */
export const sendWebVitals = async (metric) => {
  try {
    const env = getEnvironment();
    
    // Em desenvolvimento, apenas logar no console
    if (env.isDev) {
      console.log('[Analytics] Web Vital:', metric.name, metric.value);
      return;
    }
    
    // Em produção, enviar para o servidor
    const url = getApiUrl('api/analytics/web-vitals', { forceProd: true });
    
    // Adicionar informações do ambiente
    const data = {
      ...metric,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // Enviar de forma não bloqueante
    navigator.sendBeacon(url, JSON.stringify(data));
  } catch (error) {
    // Silenciar erros para não afetar a experiência do usuário
    console.error('[Analytics] Erro ao enviar métrica:', error);
  }
};

/**
 * Registra um evento de página
 * @param {string} eventType - Tipo de evento
 * @param {Object} details - Detalhes adicionais do evento
 */
export const trackPageEvent = async (eventType, details = {}) => {
  try {
    const env = getEnvironment();
    
    // Em desenvolvimento, apenas logar no console
    if (env.isDev) {
      console.log('[Analytics] Evento:', eventType, details);
      return;
    }
    
    // Em produção, enviar para o servidor
    const url = getApiUrl('api/analytics/page-event', { forceProd: true });
    
    // Adicionar informações do ambiente
    const data = {
      type: eventType,
      url: window.location.href,
      details,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // Enviar usando fetch para garantir compatibilidade
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      // Não esperar pela resposta
      keepalive: true
    }).catch(e => console.error('[Analytics] Erro ao enviar evento:', e));
  } catch (error) {
    // Silenciar erros para não afetar a experiência do usuário
    console.error('[Analytics] Erro ao registrar evento:', error);
  }
};

/**
 * Inicializa o rastreamento de Web Vitals
 */
export const initWebVitals = async () => {
  try {
    // Registrar todas as métricas importantes
    getCLS(sendWebVitals);
    getFID(sendWebVitals);
    getLCP(sendWebVitals);
    getFCP(sendWebVitals);
    getTTFB(sendWebVitals);
    
    console.log('[Analytics] Web Vitals inicializado com sucesso');
  } catch (error) {
    console.error('[Analytics] Erro ao inicializar Web Vitals:', error);
  }
};

/**
 * Inicializa o rastreamento de eventos de página
 */
export const initPageTracking = () => {
  try {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') return;
    
    // Registrar visualização de página inicial
    trackPageEvent('pageview');
    
    // Adicionar listener para mudanças de rota (para SPAs)
    if (typeof history !== 'undefined' && history.pushState) {
      // Salvar o método original
      const originalPushState = history.pushState;
      
      // Sobrescrever o método para rastrear mudanças de rota
      history.pushState = function(state, title, url) {
        // Chamar o método original
        originalPushState.apply(this, [state, title, url]);
        
        // Rastrear mudança de página
        trackPageEvent('navigation', { 
          from: document.referrer || window.location.href,
          to: url 
        });
        
        // Enviar para o Google Analytics, se disponível
        if (typeof window.gtag === 'function') {
          try {
            window.gtag('event', 'page_view', {
              page_title: document.title,
              page_location: url,
              page_path: url.replace(window.location.origin, '')
            });
          } catch (gtagError) {
            console.error('[Analytics] Erro ao enviar evento para Google Analytics:', gtagError);
          }
        }
      };
    }
    
    console.log('[Analytics] Rastreamento de página inicializado com sucesso');
  } catch (error) {
    console.error('[Analytics] Erro ao inicializar rastreamento de página:', error);
  }
};

/**
 * Inicializa todos os módulos de analytics
 */
export const initAnalytics = () => {
  try {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      console.log('[Analytics] Não inicializando analytics no servidor');
      return;
    }
    
    // Verificar se o analytics já foi inicializado
    if (window._lytspotAnalyticsInitialized) {
      console.log('[Analytics] Analytics já inicializado anteriormente');
      return;
    }
    
    // Inicializar Web Vitals
    initWebVitals();
    
    // Inicializar rastreamento de página
    initPageTracking();
    
    // Marcar como inicializado
    window._lytspotAnalyticsInitialized = true;
    
    console.log('[Analytics] Módulo de analytics inicializado com sucesso');
  } catch (error) {
    console.error('[Analytics] Erro ao inicializar módulo de analytics:', error);
  }
};

export default {
  initAnalytics,
  trackPageEvent,
  sendWebVitals
};
