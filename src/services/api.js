/**
 * Serviço centralizado para requisições API
 * @version 1.2.0 - 2025-03-12 - Melhorado tratamento de erros e logs
 * @description Configura cliente Axios com interceptores para autenticação e tratamento de erros
 */

import axios from 'axios';
import { getEnvironment } from '../utils/environment';

/**
 * Cria e configura uma instância do cliente Axios
 * @returns {AxiosInstance} Cliente Axios configurado
 */
const createApiClient = () => {
  const env = getEnvironment();
  
  // Cria cliente com URL base do ambiente atual
  const client = axios.create({
    baseURL: env.baseUrl,
    timeout: 15000, // 15 segundos
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // Interceptor para adicionar token de autenticação
  client.interceptors.request.use(
    config => {
      // Adiciona token de autenticação se disponível
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Log de depuração em desenvolvimento
      if (env.isDev) {
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    },
    error => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );
  
  // Interceptor para tratamento de respostas
  client.interceptors.response.use(
    response => {
      // Log de depuração em desenvolvimento
      if (env.isDev) {
        console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    async error => {
      // Log detalhado do erro
      console.error('[API Error]', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Se não estiver em produção ou não houver URLs alternativas, rejeita imediatamente
      if (env.isDev || !env.prodApiUrls || env.prodApiUrls.length === 0) {
        return Promise.reject(error);
      }
      
      // Em produção, se o erro for de rede ou 5xx, tenta URL alternativa
      const isNetworkError = error.message.includes('Network Error');
      const isServerError = error.response && error.response.status >= 500;
      
      if ((isNetworkError || isServerError) && error.config && !error.config._retry) {
        error.config._retry = true;
        
        // Tenta apenas a URL principal do Render
        const alternativeUrl = env.prodApiUrls[0];
        if (alternativeUrl && alternativeUrl !== env.baseUrl) {
          console.log(`[API Fallback] Tentando URL alternativa: ${alternativeUrl}`);
          
          // Cria uma nova requisição com a URL alternativa
          const newConfig = { ...error.config };
          newConfig.baseURL = alternativeUrl;
          
          try {
            return await axios(newConfig);
          } catch (fallbackError) {
            console.error('[API Fallback Error]', fallbackError.message);
            return Promise.reject(fallbackError);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Exporta cliente configurado
const api = createApiClient();
export default api;
