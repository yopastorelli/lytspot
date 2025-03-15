import NodeCache from 'node-cache';

// Criar uma instância do cache com TTL padrão de 30 segundos (reduzido de 60)
const cache = new NodeCache({ stdTTL: 30 });

// Versão do cache para invalidação rápida
let cacheVersion = Date.now();

/**
 * Middleware para cache de respostas
 * Armazena respostas em cache para melhorar a performance
 * @param {number} duration - Duração do cache em segundos (opcional)
 * @version 1.1.0 - 2025-03-14 - Adicionado mecanismo de versão para invalidação rápida
 */
export const cacheMiddleware = (duration = 30) => {
  return (req, res, next) => {
    // Apenas GET requests são cacheados
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar se o cliente está solicitando uma atualização forçada
    if (req.query.forceRefresh === 'true') {
      console.log(`[Cache] Ignorando cache para ${req.originalUrl} devido ao parâmetro forceRefresh`);
      return next();
    }

    // Criar uma chave única para o cache baseada na URL e na versão atual
    const key = `${cacheVersion}:${req.originalUrl}`;
    
    // Verificar se a resposta já está em cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      // Retornar a resposta em cache
      console.log(`[Cache] Hit para ${req.originalUrl}`);
      return res.json(cachedResponse);
    }

    console.log(`[Cache] Miss para ${req.originalUrl}`);

    // Armazenar a resposta original para uso posterior
    const originalSend = res.json;
    
    // Sobrescrever o método json para interceptar a resposta
    res.json = function(body) {
      // Restaurar o método original
      res.json = originalSend;
      
      // Armazenar a resposta em cache
      cache.set(key, body, duration);
      console.log(`[Cache] Armazenado ${req.originalUrl} (TTL: ${duration}s, Versão: ${cacheVersion})`);
      
      // Enviar a resposta normalmente
      return originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Função para limpar o cache
 * Útil quando dados são modificados e o cache precisa ser atualizado
 * @param {string} key - Chave específica para limpar (opcional)
 * @version 1.1.0 - 2025-03-14 - Adicionado incremento de versão para invalidação rápida
 */
export const clearCache = (key = null) => {
  if (key) {
    // Encontrar todas as chaves que correspondem ao padrão (independente da versão)
    const keys = cache.keys().filter(k => k.includes(`:${key}`));
    console.log(`[Cache] Limpando ${keys.length} entradas para padrão: ${key}`);
    keys.forEach(k => cache.del(k));
  } else {
    console.log('[Cache] Limpando todo o cache e incrementando versão');
    cache.flushAll();
    // Incrementar a versão do cache para invalidar todas as entradas futuras
    cacheVersion = Date.now();
    console.log(`[Cache] Nova versão do cache: ${cacheVersion}`);
  }
  
  return true;
};

/**
 * Função para verificar o status do cache
 * @returns {Object} Informações sobre o status do cache
 */
export const getCacheStatus = () => {
  return {
    version: cacheVersion,
    keys: cache.keys(),
    stats: cache.getStats(),
    size: cache.keys().length
  };
};
