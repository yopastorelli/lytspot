/**
 * Módulo centralizado para detecção e configuração de ambiente
 * @version 1.3.1 - 2025-03-14 - Melhorado o diagnóstico e adicionado fallback para URLs da API
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
  
  // Lista de URLs para produção - incluindo alternativas para fallback
  const prodApiUrls = [
    'https://lytspot.onrender.com/api',  // URL principal do Render com prefixo /api
    'https://lytspot.com.br/api',        // URL do domínio principal com prefixo /api
    'https://www.lytspot.com.br/api'     // URL com www e prefixo /api
  ];
  
  // Determinar a URL base da API
  let baseUrl;
  
  if (isLocalhost) {
    // Em desenvolvimento, use localhost:3000 com prefixo /api
    baseUrl = 'http://localhost:3000/api';
    console.log('[Environment] Ambiente de desenvolvimento detectado. Usando API local:', baseUrl);
  } else {
    // Em produção, use a URL do Render com prefixo /api
    baseUrl = prodApiUrls[0];
    console.log('[Environment] Ambiente de produção detectado. Usando API remota:', baseUrl);
    console.log('[Environment] URLs alternativas disponíveis:', prodApiUrls.slice(1).join(', '));
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

/**
 * Tenta acessar uma URL da API com fallback para URLs alternativas
 * @param {string} endpoint - Endpoint da API (sem a URL base)
 * @param {Object} options - Opções para fetch
 * @returns {Promise<Response>} Resposta da API
 */
export const fetchWithFallback = async (endpoint, options = {}) => {
  const env = getEnvironment();
  
  // Se estamos em desenvolvimento, não precisamos de fallback
  if (env.isDev) {
    const url = `${env.baseUrl}/${endpoint}`.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
    console.log(`[API] Fazendo requisição para: ${url}`);
    return fetch(url, options);
  }
  
  // Em produção, tentamos cada URL da lista até uma funcionar
  let lastError = null;
  
  for (const baseUrl of env.prodApiUrls) {
    try {
      const url = `${baseUrl}/${endpoint}`.replace(/\/+/g, '/').replace('http:/', 'http://').replace('https:/', 'https://');
      console.log(`[API] Tentando requisição para: ${url}`);
      
      const response = await fetch(url, options);
      
      // Se a resposta não for ok, continuamos tentando
      if (!response.ok) {
        console.warn(`[API] Resposta não ok de ${url}: ${response.status} ${response.statusText}`);
        lastError = new Error(`Resposta não ok: ${response.status} ${response.statusText}`);
        continue;
      }
      
      console.log(`[API] Requisição bem-sucedida para: ${url}`);
      return response;
    } catch (error) {
      console.warn(`[API] Erro ao acessar ${baseUrl}/${endpoint}:`, error.message);
      lastError = error;
    }
  }
  
  // Se chegamos aqui, todas as tentativas falharam
  throw lastError || new Error('Falha ao acessar a API em todas as URLs disponíveis');
};

export default getEnvironment;
