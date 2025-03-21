/**
 * Serviço centralizado para comunicação com a API
 * @version 1.5.0 - 2025-03-15 - Adicionado suporte para identificação de requisições do simulador
 * @description Fornece métodos para interagir com a API do backend
 */
import axios from 'axios';
import { getEnvironment, apiRequestWithRetry } from '../utils/environment';
import { servicos } from '../data/servicos';

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
    timeout: 15000, // Aumentando o timeout para 15 segundos
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'lytspot-frontend', // Identificador para ajudar no diagnóstico
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    // Garantir que as credenciais sejam enviadas em todas as requisições
    withCredentials: true
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
  /**
   * Lista todos os serviços disponíveis
   * @param {Object} options Opções para a requisição
   * @param {boolean} options.simulador Se true, indica que a requisição vem do simulador de preços
   * @returns {Promise} Promessa com a resposta da API
   */
  listar: async (options = {}) => {
    try {
      // Construir parâmetros de consulta
      const params = new URLSearchParams();
      if (options.simulador) {
        params.append('simulador', 'true');
      }
      
      if (options.page) {
        params.append('page', options.page);
      }
      
      if (options.limit) {
        params.append('limit', options.limit);
      }
      
      if (options.search) {
        params.append('search', options.search);
      }
      
      // Construir URL com parâmetros
      const url = `/pricing${params.toString() ? `?${params.toString()}` : ''}`;
      
      return api.get(url);
    } catch (error) {
      console.error('[API] Erro ao listar serviços:', error);
      throw error;
    }
  },
  /**
   * Lista todos os serviços diretamente do arquivo de definições
   * @returns {Promise} Promessa com a resposta da API contendo as definições de serviços
   */
  listarDefinicoes: async () => {
    try {
      console.log('[API] Buscando definições de serviços...');
      
      // Verificar se estamos em ambiente de desenvolvimento
      const env = getEnvironment();
      const isDev = env.isDev;
      
      // Usar diretamente os dados locais, já que eles raramente mudam
      console.log(`[API] Usando dados locais para definições de serviços: ${servicos.length} itens`);
      return { data: servicos };
      
    } catch (error) {
      console.error('[API] Erro ao obter definições de serviços:', error);
      throw error;
    }
  },
  obter: (id) => api.get(`/pricing/${id}`),
  criar: (dados) => api.post('/pricing', dados),
  atualizar: (id, dados) => api.put(`/pricing/${id}`, dados),
  excluir: (id) => api.delete(`/pricing/${id}`),
  
  /**
   * Envia um orçamento para a API
   * @param {Object} orcamentoData - Dados do orçamento
   * @returns {Promise} - Resultado da requisição
   * @version 1.2.1 - 2025-03-15 - Corrigido erro de referência env
   */
  enviarOrcamento: async (orcamentoData) => {
    console.log('[API] Enviando orçamento:', orcamentoData);
    
    // Obter informações do ambiente
    const env = getEnvironment();
    
    // Função que faz a requisição
    const makeRequest = async (url) => {
      console.log(`[API] Enviando orçamento para ${url}`);
      
      // Configuração avançada para evitar problemas de CORS
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Source': 'lytspot-frontend'
        },
        withCredentials: true // Importante para CORS com credenciais
      };
      
      try {
        const response = await axios.post(url, orcamentoData, config);
        console.log('[API] Resposta do orçamento:', response.data);
        return response.data;
      } catch (error) {
        console.error('[API] Erro ao enviar orçamento:', error.message);
        throw error;
      }
    };
    
    // Usar apiRequestWithRetry para maior robustez
    try {
      const response = await apiRequestWithRetry(
        makeRequest,
        'api/contact',
        {
          forceProd: env.hostname === 'lytspot.com.br' || env.hostname === 'www.lytspot.com.br',
          maxRetries: 3,
          retryDelay: 2000
        }
      );
      
      return response;
    } catch (error) {
      console.error('[API] Todas as tentativas de envio do orçamento falharam:', error.message);
      throw error;
    }
  }
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