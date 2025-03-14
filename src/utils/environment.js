/**
 * Módulo centralizado para detecção e configuração de ambiente
 * @version 1.3.0 - 2025-03-12 - Adicionado prefixo /api na URL base
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
      baseUrl: 'http://localhost:3000/api'
    };
  }
  
  // Detecta ambiente de desenvolvimento tanto pelo localhost quanto por IPs locais
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.startsWith('192.168.') ||
                     window.location.hostname.startsWith('10.');
  
  // Lista de URLs para produção - usando apenas a URL válida do Render
  const prodApiUrls = [
    'https://lytspot.onrender.com'  // URL principal do Render sem prefixo /api
  ];
  
  // Determinar a URL base da API
  let baseUrl;
  
  if (isLocalhost) {
    // Em desenvolvimento, use localhost:3000 sem prefixo /api
    baseUrl = 'http://localhost:3000';
    console.log('[Environment] Ambiente de desenvolvimento detectado. Usando API local:', baseUrl);
  } else {
    // Em produção, use a URL do Render sem prefixo /api
    baseUrl = prodApiUrls[0];
    console.log('[Environment] Ambiente de produção detectado. Usando API remota:', baseUrl);
  }
  
  return {
    type: 'browser',
    isDev: isLocalhost,
    baseUrl: baseUrl,
    prodApiUrls: isLocalhost ? [] : prodApiUrls, // Lista de URLs alternativas para fallback
    hostname: window.location.hostname,
    href: window.location.href
  };
};

export default getEnvironment;
