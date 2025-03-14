/**
 * Serviço centralizado para comunicação com a API
 * @version 1.0.7 - 2025-03-14 - Corrigida a configuração da URL base e adição do prefixo /api
 * @description Fornece métodos para interagir com a API do backend
 */
import axios from 'axios';
import { getEnvironment } from '../utils/environment';

/**
 * Cria uma instância do axios configurada com a URL base correta
 * @returns {Object} Instância do axios configurada
 */
const createApiInstance = () => {
  const env = getEnvironment();
  
  // Determinar a URL base correta para a API
  // Garantir que a URL base tenha o prefixo /api apenas uma vez
  let baseURL = env.baseUrl;
  
  // Se a baseURL não termina com /api e não inclui /api, adicionar /api
  if (!baseURL.endsWith('/api') && !baseURL.includes('/api')) {
    baseURL = `${baseURL}/api`;
  }
  
  console.log(`[API] Configurando instância do axios com baseURL: ${baseURL}`);
  
  // Criar instância do axios com a URL base correta
  const instance = axios.create({
    baseURL,
    timeout: 10000,
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
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para tratar erros de resposta
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Tratar erros específicos aqui
      if (error.response) {
        // Erro do servidor (status code fora do range 2xx)
        console.error('Erro na resposta da API:', error.response.status, error.response.data);
        
        // Se for erro 401 (não autorizado), podemos limpar o token
        if (error.response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', error.request);
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

// Exportar a instância padrão como default
export default api;