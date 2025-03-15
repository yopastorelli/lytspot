/**
 * Serviço centralizado para comunicação com a API
 * @version 1.7.0 - 2025-03-16 - Implementada função getApiUrl para melhorar a consistência das URLs
 * @description Fornece métodos para interagir com a API do backend
 */
import axios from 'axios';
import { getEnvironment, getApiUrl } from '../utils/environment';
import { servicos } from '../data/servicos';

/**
 * Cria uma instância do axios configurada com a URL base correta
 * @returns {Object} Instância do axios configurada
 */
const createApiInstance = () => {
  const env = getEnvironment();
  
  // Determinar a URL base correta para a API
  // Em produção, sempre usar a URL da API no Render
  let baseURL = env.isDev ? env.baseUrl : 'https://lytspot-api.onrender.com';
  
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
      const params = {};
      if (options.simulador) {
        params.simulador = true;
      }
      
      // Usar a nova função getApiUrl para obter a URL correta
      const apiUrl = getApiUrl('pricing');
      console.log(`[API] Listando serviços de: ${apiUrl}`);
      
      const response = await api.get('/api/pricing', { params });
      return response;
    } catch (error) {
      console.error('[API] Erro ao listar serviços:', error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        console.error(`[API] Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('[API] Sem resposta do servidor:', error.request);
      } else {
        console.error('[API] Erro de configuração:', error.message);
      }
      
      console.warn('[API] Usando dados locais como fallback');
      
      // Se falhar, usar os dados locais como fallback
      if (options.simulador) {
        return { data: servicos.filter(s => s.disponivel_simulador) };
      } else {
        return { data: servicos };
      }
    }
  },
  
  /**
   * Lista todos os serviços diretamente do arquivo de definições
   * @returns {Promise} Promessa com a resposta da API contendo as definições de serviços
   */
  listarDefinicoes: async () => {
    try {
      // Usar a nova função getApiUrl para obter a URL correta
      const apiUrl = getApiUrl('pricing/definitions');
      console.log(`[API] Listando definições de serviços de: ${apiUrl}`);
      
      const response = await api.get('/api/pricing/definitions');
      return response;
    } catch (error) {
      console.error('[API] Erro ao listar definições de serviços:', error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        console.error(`[API] Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('[API] Sem resposta do servidor:', error.request);
      } else {
        console.error('[API] Erro de configuração:', error.message);
      }
      
      throw error;
    }
  },
  
  obter: async (id) => {
    try {
      const apiUrl = getApiUrl(`pricing/${id}`);
      console.log(`[API] Obtendo serviço ${id} de: ${apiUrl}`);
      return await api.get(`/api/pricing/${id}`);
    } catch (error) {
      console.error(`[API] Erro ao obter serviço ${id}:`, error);
      throw error;
    }
  },
  
  criar: async (dados) => {
    try {
      const apiUrl = getApiUrl('pricing');
      console.log(`[API] Criando serviço em: ${apiUrl}`);
      return await api.post('/api/pricing', dados);
    } catch (error) {
      console.error('[API] Erro ao criar serviço:', error);
      throw error;
    }
  },
  
  atualizar: async (id, dados) => {
    try {
      const apiUrl = getApiUrl(`pricing/${id}`);
      console.log(`[API] Atualizando serviço ${id} em: ${apiUrl}`);
      return await api.put(`/api/pricing/${id}`, dados);
    } catch (error) {
      console.error(`[API] Erro ao atualizar serviço ${id}:`, error);
      throw error;
    }
  },
  
  excluir: async (id) => {
    try {
      const apiUrl = getApiUrl(`pricing/${id}`);
      console.log(`[API] Excluindo serviço ${id} de: ${apiUrl}`);
      return await api.delete(`/api/pricing/${id}`);
    } catch (error) {
      console.error(`[API] Erro ao excluir serviço ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Envia um orçamento para o endpoint de contato
   * @param {Object} dadosOrcamento Dados do orçamento a ser enviado
   * @returns {Promise} Promessa com a resposta da API
   */
  enviarOrcamento: async (dadosOrcamento) => {
    try {
      // Usar a nova função getApiUrl para obter a URL correta
      const apiUrl = getApiUrl('contact');
      console.log(`[API] Enviando orçamento para: ${apiUrl}`);
      
      // Fazer a requisição usando a instância padrão da API
      // Isso garante que todas as configurações CORS e interceptors sejam aplicados
      return await api.post('/api/contact', dadosOrcamento);
    } catch (error) {
      console.error('[API] Erro ao enviar orçamento:', error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        console.error(`[API] Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('[API] Sem resposta do servidor:', error.request);
      } else {
        console.error('[API] Erro de configuração:', error.message);
      }
      
      throw error;
    }
  }
};

const authAPI = {
  login: async (credenciais) => {
    try {
      const apiUrl = getApiUrl('auth/login');
      console.log(`[API] Realizando login em: ${apiUrl}`);
      return await api.post('/api/auth/login', credenciais);
    } catch (error) {
      console.error('[API] Erro ao realizar login:', error);
      throw error;
    }
  },
  
  registro: async (dados) => {
    try {
      const apiUrl = getApiUrl('auth/register');
      console.log(`[API] Realizando registro em: ${apiUrl}`);
      return await api.post('/api/auth/register', dados);
    } catch (error) {
      console.error('[API] Erro ao realizar registro:', error);
      throw error;
    }
  },
  
  verificarToken: async () => {
    try {
      const apiUrl = getApiUrl('auth/verify');
      console.log(`[API] Verificando token em: ${apiUrl}`);
      return await api.get('/api/auth/verify');
    } catch (error) {
      console.error('[API] Erro ao verificar token:', error);
      throw error;
    }
  }
};

// Exportar tanto a instância padrão quanto métodos específicos
export { servicosAPI, authAPI };
export default api;