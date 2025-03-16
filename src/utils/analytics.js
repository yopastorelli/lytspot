/**
 * Módulo de analytics para o LytSpot
 * @version 1.0.0 - 2025-03-15
 * @description Fornece funções para capturar e enviar métricas de performance e eventos de usuário
 */

import { getApiUrl, getEnvironment } from './environment.js';
// Importação estática para o Vite resolver corretamente
// As funções serão usadas dinamicamente para não bloquear o carregamento
import * as webVitalsLib from 'web-vitals';

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
    webVitalsLib.getCLS(sendWebVitals);
    webVitalsLib.getFID(sendWebVitals);
    webVitalsLib.getLCP(sendWebVitals);
    webVitalsLib.getFCP(sendWebVitals);
    webVitalsLib.getTTFB(sendWebVitals);
    
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
    // Registrar visualização de página
    trackPageEvent('pageview');
    
    // Registrar quando o usuário sai da página
    window.addEventListener('beforeunload', () => {
      trackPageEvent('exit');
    });
    
    console.log('[Analytics] Rastreamento de página inicializado com sucesso');
  } catch (error) {
    console.error('[Analytics] Erro ao inicializar rastreamento de página:', error);
  }
};

/**
 * Inicializa todos os módulos de analytics
 */
export const initAnalytics = () => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined') return;
  
  // Inicializar Web Vitals
  initWebVitals();
  
  // Inicializar rastreamento de página
  initPageTracking();
  
  console.log('[Analytics] Módulo de analytics inicializado com sucesso');
};

export default {
  initAnalytics,
  trackPageEvent,
  sendWebVitals
};
