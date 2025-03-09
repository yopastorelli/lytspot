import NodeCache from 'node-cache';

// Criar uma instância do cache com TTL padrão de 5 minutos (300 segundos)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Middleware para cache de respostas
 * Armazena respostas em cache para melhorar a performance
 * @param {number} duration - Duração do cache em segundos (opcional)
 */
export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Apenas GET requests são cacheados
    if (req.method !== 'GET') {
      return next();
    }

    // Criar uma chave única para o cache baseada na URL
    const key = req.originalUrl;
    
    // Verificar se a resposta já está em cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      // Retornar a resposta em cache
      return res.json(cachedResponse);
    }

    // Armazenar a resposta original para uso posterior
    const originalSend = res.json;
    
    // Sobrescrever o método json para interceptar a resposta
    res.json = function(body) {
      // Restaurar o método original
      res.json = originalSend;
      
      // Armazenar a resposta em cache
      cache.set(key, body, duration);
      
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
 */
export const clearCache = (key = null) => {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
};
