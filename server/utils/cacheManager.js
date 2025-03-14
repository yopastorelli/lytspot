/**
 * Módulo para gerenciamento de cache da API
 * @version 1.0.1 - 2025-03-14 - Melhorado tratamento de erros para ambiente de desenvolvimento
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função para registrar logs com timestamp
 * @param {string} level - Nível do log (INFO, ERROR, etc)
 * @param {string} message - Mensagem do log
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  
  // Se a função de log externa for fornecida, usá-la também
  if (typeof global.logFunction === 'function') {
    global.logFunction(level, message);
  }
}

/**
 * Limpa o cache da API
 * @param {Object} options - Opções para limpeza do cache
 * @param {string} options.baseUrl - URL base da API
 * @param {string} options.cacheSecret - Chave secreta para autenticação
 * @param {Function} options.logFunction - Função de log opcional
 * @returns {Promise<boolean>} true se o cache foi limpo com sucesso, false caso contrário
 */
export async function clearApiCache(options = {}) {
  // Se uma função de log for fornecida, armazená-la globalmente
  if (typeof options.logFunction === 'function') {
    global.logFunction = options.logFunction;
  }
  
  const baseUrl = options.baseUrl || process.env.BASE_URL || 'http://localhost:3000';
  const cacheSecret = options.cacheSecret || process.env.CACHE_SECRET || 'cache-secret-key';
  const logFunction = options.logFunction || log;
  
  const cacheUrl = `${baseUrl}/api/cache/clear`;
  
  try {
    logFunction('INFO', `Tentando limpar cache da API em: ${cacheUrl}`);
    
    const response = await axios.get(cacheUrl, {
      headers: {
        'Authorization': `Bearer ${cacheSecret}`
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    if (response.status === 200) {
      logFunction('INFO', 'Cache da API limpo com sucesso');
      return true;
    } else {
      logFunction('WARN', `Resposta inesperada ao limpar cache: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    // Verificar se é um erro de conexão (servidor não está rodando)
    if (error.code === 'ECONNREFUSED') {
      logFunction('WARN', `Não foi possível conectar ao servidor da API. Verifique se o servidor está em execução.`);
      
      // Em ambiente de desenvolvimento, podemos simular sucesso
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        logFunction('INFO', 'Ambiente de desenvolvimento detectado. Simulando limpeza de cache bem-sucedida.');
        return true;
      }
    } else {
      logFunction('ERROR', `Erro ao limpar cache da API: ${error.message}`);
    }
    
    return false;
  }
}

/**
 * Verifica o status do cache da API
 * @param {Object} options - Opções para verificação do cache
 * @param {string} options.baseUrl - URL base da API
 * @param {string} options.cacheSecret - Chave secreta para autenticação
 * @param {Function} options.logFunction - Função de log opcional
 * @returns {Promise<Object|null>} Status do cache ou null em caso de erro
 */
export async function checkCacheStatus(options = {}) {
  // Se uma função de log for fornecida, armazená-la globalmente
  if (typeof options.logFunction === 'function') {
    global.logFunction = options.logFunction;
  }
  
  const baseUrl = options.baseUrl || process.env.BASE_URL || 'http://localhost:3000';
  const cacheSecret = options.cacheSecret || process.env.CACHE_SECRET || 'cache-secret-key';
  const logFunction = options.logFunction || log;
  
  const statusUrl = `${baseUrl}/api/cache/status`;
  
  try {
    logFunction('INFO', `Verificando status do cache da API em: ${statusUrl}`);
    
    const response = await axios.get(statusUrl, {
      headers: {
        'Authorization': `Bearer ${cacheSecret}`
      },
      timeout: 5000 // 5 segundos de timeout
    });
    
    if (response.status === 200 && response.data) {
      logFunction('INFO', 'Status do cache obtido com sucesso');
      return response.data;
    } else {
      logFunction('WARN', `Resposta inesperada ao verificar status do cache: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    // Verificar se é um erro de conexão (servidor não está rodando)
    if (error.code === 'ECONNREFUSED') {
      logFunction('WARN', `Não foi possível conectar ao servidor da API. Verifique se o servidor está em execução.`);
      
      // Em ambiente de desenvolvimento, podemos simular um status
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        logFunction('INFO', 'Ambiente de desenvolvimento detectado. Retornando status simulado do cache.');
        return {
          status: 'simulated',
          hits: 0,
          misses: 0,
          keys: 0,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      logFunction('ERROR', `Erro ao verificar status do cache: ${error.message}`);
    }
    
    return null;
  }
}

// Exportar funções para uso em outros módulos
export default {
  clearApiCache,
  checkCacheStatus
};
