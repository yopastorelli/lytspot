/**
 * Módulo centralizado para detecção e configuração de ambiente
 * @version 1.8.0 - 2025-03-15 - Melhorada a detecção de ambiente e URLs da API para lytspot.com.br
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
  } else if (window.location.hostname === 'lytspot.com.br' || window.location.hostname === 'www.lytspot.com.br') {
    // Em produção no domínio principal, usar a primeira URL da lista de APIs
    baseUrl = prodApiUrls[0];
    console.log('[Environment] Ambiente de produção (lytspot.com.br) detectado. Usando API remota:', baseUrl);
  } else {
    // Em outros ambientes de produção, usar a primeira URL da lista de APIs
    baseUrl = prodApiUrls[0];
    console.log('[Environment] Outro ambiente de produção detectado. Usando API remota:', baseUrl);
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
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.forceProd - Força o uso da URL de produção mesmo em desenvolvimento
 * @returns {string} URL completa para o endpoint
 */
export const getApiUrl = (endpoint, options = {}) => {
  const env = getEnvironment();
  
  // Normalizar o endpoint (remover barras iniciais)
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Se estamos em produção ou se forceProd está ativado
  if (!env.isDev || options.forceProd) {
    // Verificar se estamos em lytspot.com.br e usar a URL da API diretamente
    if (env.hostname === 'lytspot.com.br' || env.hostname === 'www.lytspot.com.br') {
      console.log(`[Environment] Usando URL de API específica para ${env.hostname}: ${env.prodApiUrls[0]}`);
      return `${env.prodApiUrls[0]}/${normalizedEndpoint}`;
    }
    
    // Caso contrário, usar a URL base
    return `${env.baseUrl}/${normalizedEndpoint}`;
  }
  
  // Em desenvolvimento, sempre usar a URL base
  return `${env.baseUrl}/${normalizedEndpoint}`;
};

/**
 * Tenta enviar uma requisição com retry e fallback para diferentes URLs de API
 * @param {Function} requestFn - Função que faz a requisição (recebe a URL como parâmetro)
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções adicionais
 * @returns {Promise} Resultado da requisição
 * @version 1.2.0 - 2025-03-15 - Melhorado tratamento de erros CORS
 */
export const apiRequestWithRetry = async (requestFn, endpoint, options = {}) => {
  const env = getEnvironment();
  const maxRetries = options.maxRetries || 2;
  const retryDelay = options.retryDelay || 2000;
  
  // Verificar se estamos no domínio lytspot.com.br
  const isMainDomain = env.hostname === 'lytspot.com.br' || env.hostname === 'www.lytspot.com.br';
  
  // Log para diagnóstico
  console.log(`[API] Iniciando requisição para ${endpoint} de ${env.hostname}`, {
    isMainDomain,
    isDev: env.isDev,
    forceProd: options.forceProd
  });
  
  // Primeira tentativa com a URL principal
  try {
    const primaryUrl = getApiUrl(endpoint, options);
    console.log(`[API] Tentativa principal para ${primaryUrl}`);
    return await requestFn(primaryUrl);
  } catch (error) {
    console.error(`[API] Erro na tentativa principal: ${error.message}`);
    
    // Verificar se é um erro de CORS
    const isCorsError = error.message && (
      error.message.includes('Network Error') || 
      error.message.includes('CORS') ||
      error.message.includes('cross-origin')
    );
    
    if (isCorsError) {
      console.warn('[API] Erro de CORS detectado, tentando URLs alternativas');
    }
    
    // Se estamos em produção e temos URLs alternativas, tentar com elas
    if ((!env.isDev || options.forceProd) && env.prodApiUrls.length > 1) {
      for (let i = 1; i < env.prodApiUrls.length; i++) {
        try {
          const fallbackUrl = `${env.prodApiUrls[i]}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
          console.log(`[API] Tentativa fallback ${i} para ${fallbackUrl}`);
          return await requestFn(fallbackUrl);
        } catch (fallbackError) {
          console.error(`[API] Erro na tentativa fallback ${i}: ${fallbackError.message}`);
        }
      }
    }
    
    // Se ainda não conseguimos, tentar com retry na URL principal
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Esperar antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)));
        
        const retryUrl = getApiUrl(endpoint, {
          ...options,
          // Forçar URL de produção se estamos no domínio principal
          forceProd: options.forceProd || isMainDomain
        });
        
        console.log(`[API] Retry ${i+1} para ${retryUrl}`);
        return await requestFn(retryUrl);
      } catch (retryError) {
        console.error(`[API] Erro no retry ${i+1}: ${retryError.message}`);
        
        // Se é a última tentativa, propagar o erro
        if (i === maxRetries - 1) {
          throw retryError;
        }
      }
    }
    
    // Se chegamos aqui, todas as tentativas falharam
    throw error;
  }
};

export default getEnvironment;
