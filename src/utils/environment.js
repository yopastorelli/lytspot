/**
 * Módulo centralizado para detecção e configuração de ambiente
 * @version 1.6.0 - 2025-03-20 - Melhorada a detecção de ambiente e adicionado suporte para múltiplos endpoints de API
 * @description Fornece informações consistentes sobre o ambiente atual e URLs da API
 */

/**
 * Detecta o ambiente atual e retorna configurações relevantes
 * @returns {Object} Configurações do ambiente
 */
export const getEnvironment = () => {
  // Verificação segura para SSR
  if (typeof window === 'undefined') {
    return { 
      type: 'server', 
      isDev: true,
      baseUrl: 'http://localhost:3000'  
    };
  }
  
  // Detecta ambiente de desenvolvimento tanto pelo localhost quanto por IPs locais
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.startsWith('192.168.') ||
                     window.location.hostname.startsWith('10.');
  
  // Lista de URLs da API em produção (em ordem de preferência)
  const prodApiUrls = [
    'https://lytspot-api.onrender.com',
    'https://lytspot.onrender.com'
  ];
  
  // Determinar a URL base da API
  let baseUrl;
  
  if (isLocalhost) {
    // Em desenvolvimento, use localhost:3000
    baseUrl = 'http://localhost:3000';
    console.log('[Environment] Ambiente de desenvolvimento detectado. Usando API local:', baseUrl);
  } else {
    // Em produção, sempre usar a primeira URL da lista de APIs
    baseUrl = prodApiUrls[0];
    console.log('[Environment] Ambiente de produção detectado. Usando API remota:', baseUrl);
  }
  
  return {
    type: 'browser',
    isDev: isLocalhost,
    baseUrl: baseUrl,
    prodApiUrls: prodApiUrls,
    hostname: window.location.hostname,
    href: window.location.href
  };
};

/**
 * Obtém a URL da API para um endpoint específico, com suporte a fallback
 * @param {string} endpoint - O endpoint da API (sem barra inicial)
 * @returns {string} URL completa para o endpoint
 */
export const getApiUrl = (endpoint) => {
  const env = getEnvironment();
  
  // Normalizar o endpoint (remover barras iniciais)
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Em desenvolvimento, sempre usar a URL base
  if (env.isDev) {
    return `${env.baseUrl}/${normalizedEndpoint}`;
  }
  
  // Em produção, usar a URL principal da API
  return `${env.baseUrl}/${normalizedEndpoint}`;
};

export default getEnvironment;
