/**
 * Serviço centralizado para configuração e gerenciamento de requisições API
 * @version 1.0.0 - 2025-03-12
 * @description Fornece uma instância configurada do axios e utilitários para comunicação com o backend
 */

import axios from 'axios';
import getEnvironment from '../utils/environment';

/**
 * Cria e configura um cliente axios com interceptores e configurações apropriadas
 * @param {Object} options - Opções adicionais para configuração
 * @returns {AxiosInstance} Cliente axios configurado
 */
export const createApiClient = (options = {}) => {
  const env = getEnvironment();
  
  // Configuração base do cliente
  const client = axios.create({
    baseURL: env.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers
    },
    timeout: 15000,
    // Não usamos withCredentials por padrão para evitar problemas de CORS
    // JWT é enviado via Authorization header, não requer withCredentials
    withCredentials: false
  });
  
  // Interceptor para adicionar token JWT automaticamente
  client.interceptors.request.use(
    config => {
      // Adiciona o token ao cabeçalho se estiver disponível no localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Interceptor para lidar com erros e implementar fallback de URLs
  client.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Se não estamos em modo de desenvolvimento e não é uma retentativa
      if (!env.isDev && !originalRequest._retry && env.prodApiUrls && env.prodApiUrls.length > 1) {
        // Marca como retentativa para evitar loop infinito
        originalRequest._retry = true;
        
        // Tenta cada URL alternativa na lista
        for (let i = 1; i < env.prodApiUrls.length; i++) {
          const alternativeUrl = env.prodApiUrls[i];
          console.log(`Tentando URL alternativa: ${alternativeUrl}`);
          
          try {
            // Atualiza a URL base para a alternativa
            originalRequest.baseURL = alternativeUrl;
            return await axios(originalRequest);
          } catch (retryError) {
            console.error(`Falha ao usar URL alternativa ${alternativeUrl}:`, retryError.message);
            // Continua para a próxima URL
          }
        }
      }
      
      // Se todas as tentativas falharem ou não houver alternativas, rejeita com o erro original
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Exporta uma instância padrão do cliente API
const api = createApiClient();
export default api;
