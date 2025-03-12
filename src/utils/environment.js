/**
 * Módulo centralizado para detecção e configuração de ambiente
 * @version 1.0.0 - 2025-03-12
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
  
  // Lista de URLs para produção em ordem de prioridade
  const prodApiUrls = [
    'https://lytspot.onrender.com',  // URL principal do Render
    'https://api.lytspot.com.br',    // URL personalizada (quando estiver configurada)
    window.location.origin           // URL atual como fallback
  ];
  
  return {
    type: 'browser',
    isDev: isLocalhost,
    // Em desenvolvimento, use localhost:3000
    // Em produção, use a primeira URL da lista (será testada com fallback)
    baseUrl: isLocalhost ? 'http://localhost:3000' : prodApiUrls[0],
    prodApiUrls: isLocalhost ? [] : prodApiUrls, // Lista de URLs alternativas para fallback
    hostname: window.location.hostname,
    href: window.location.href
  };
};

export default getEnvironment;
