/**
 * Serviço centralizado para comunicação com a API
 * @version 1.0.5 - 2025-03-14 - Implementado sistema de fallback para URLs alternativas
 * @description Fornece métodos para interagir com a API do backend
 */
import axios from 'axios';
import { getEnvironment, fetchWithFallback } from '../utils/environment';

/**
 * Cria uma instância do axios configurada com a URL base correta
 * @returns {Object} Instância do axios configurada
 */
const createApiInstance = () => {
  const env = getEnvironment();
  
  console.log('[API] Inicializando serviço de API com URL base:', env.baseUrl);
  
  // Criar instância do axios com a URL base correta
  const instance = axios.create({
    baseURL: env.baseUrl,
    timeout: 15000, // Aumentado para 15 segundos para lidar com latência em produção
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para adicionar token de autenticação
  instance.interceptors.request.use(
    (config) => {
      // Verificar se estamos no browser
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      console.log(`[API] Requisição ${config.method?.toUpperCase() || 'GET'} para: ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para tratar erros de resposta
  instance.interceptors.response.use(
    (response) => {
      console.log(`[API] Resposta ${response.status} de: ${response.config.url}`);
      
      // Verificar se a resposta contém dados vazios quando não deveria
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.warn('[API] Atenção: Resposta contém array vazio');
      }
      
      return response;
    },
    async (error) => {
      // Tratar erros específicos aqui
      if (error.response) {
        // Erro do servidor (status code fora do range 2xx)
        console.error('Erro na resposta da API:', error.response.status, error.response.data);
        
        // Se for erro 401 (não autorizado), podemos limpar o token
        if (error.response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        console.error('Sem resposta da API:', error.request);
      } else {
        // Erro na configuração da requisição
        console.error('Erro na configuração da requisição:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Criar instância padrão da API
const api = createApiInstance();

// Adicionar método de fallback à instância da API
api.fetchWithFallback = async (endpoint, options = {}) => {
  try {
    console.log(`[API] Iniciando requisição com fallback para: ${endpoint}`);
    const response = await fetchWithFallback(endpoint, options);
    
    // Converter a resposta fetch para formato compatível com axios
    const data = await response.json();
    return { data, status: response.status, statusText: response.statusText };
  } catch (error) {
    console.error(`[API] Erro na requisição com fallback para: ${endpoint}`, error);
    throw error;
  }
};

// Métodos específicos para diferentes recursos
const servicosAPI = {
  listar: () => api.get('/pricing'),
  obter: (id) => api.get(`/pricing/${id}`),
  criar: (dados) => api.post('/pricing', dados),
  atualizar: (id, dados) => api.put(`/pricing/${id}`, dados),
  excluir: (id) => api.delete(`/pricing/${id}`)
};

const authAPI = {
  login: (credenciais) => api.post('/auth/login', credenciais),
  registro: (dados) => api.post('/auth/register', dados),
  verificarToken: () => api.get('/auth/verify')
};

// Exportar tanto a instância padrão quanto métodos específicos
export { servicosAPI, authAPI };

export default api;