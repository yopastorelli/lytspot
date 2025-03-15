/**
 * Serviço centralizado para comunicação com a API
 * @version 1.5.0 - 2025-03-15 - Adicionado suporte para identificação de requisições do simulador
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
      console.log('[API] Buscando definições de serviços da API...');
      
      // Verificar se estamos em ambiente de desenvolvimento
      const env = getEnvironment();
      const isDev = env.isDev;
      
      // Em desenvolvimento, tentar acessar diretamente a API local
      if (isDev) {
        console.log('[API] Ambiente de desenvolvimento detectado, usando URL local');
        try {
          // Removendo os cabeçalhos problemáticos para desenvolvimento
          const response = await api.get('/pricing/definitions');
          
          if (response && response.data && Array.isArray(response.data)) {
            console.log(`[API] Dados obtidos com sucesso da API local: ${response.data.length} itens`);
            return response;
          }
        } catch (devError) {
          console.warn('[API] Erro ao acessar API local:', devError);
          // Continuar para o fallback
        }
      }
      
      // Tentativa padrão ou fallback para desenvolvimento
      return api.get('/pricing/definitions');
    } catch (error) {
      console.error('[API] Erro ao listar definições de serviços:', error);
      
      // Se o erro for de conexão ou timeout, tentar usar dados de fallback
      if (!error.response || error.code === 'ECONNABORTED') {
        console.warn('[API] Usando dados de fallback para definições de serviços');
        
        // Dados de fallback para serviços (cópia dos dados do backend)
        const fallbackData = [
          {
            id: 1,
            nome: 'VLOG - Aventuras em Família',
            descricao: 'Documentação em vídeo e foto da sua viagem em família. Um dia na praia, no campo, na montanha ou em pontos turísticos nos arredores da Grande Curitiba.',
            preco_base: 1500.00,
            duracao_media: 14,
            detalhes: {
              captura: '6 a 8 horas',
              tratamento: 'até 30 dias',
              entregaveis: 'Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
              deslocamento: 'Sob consulta, dependendo da localidade'
            }
          },
          {
            id: 2,
            nome: 'VLOG - Amigos e Comunidade',
            descricao: 'Documentação em vídeo e foto de eventos comunitários, encontros de amigos, festas de rua e celebrações locais.',
            preco_base: 900.00,
            duracao_media: 7,
            detalhes: {
              captura: '3 a 4 horas',
              tratamento: 'até 15 dias',
              entregaveis: 'Vídeo editado de até 5 minutos + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais, Versão Estendida, Versão para Redes Sociais',
              deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            }
          },
          {
            id: 3,
            nome: 'Cobertura Fotográfica de Evento Social',
            descricao: 'Registro fotográfico profissional para aniversários, confraternizações, formaturas e eventos corporativos.',
            preco_base: 600.00,
            duracao_media: 5,
            detalhes: {
              captura: '3 a 4 horas',
              tratamento: 'até 10 dias',
              entregaveis: '100 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais, Álbum Impresso, Pendrive personalizado',
              deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            }
          },
          {
            id: 4,
            nome: 'Filmagem de Evento Social',
            descricao: 'Registro em vídeo profissional para aniversários, confraternizações, formaturas e eventos corporativos.',
            preco_base: 800.00,
            duracao_media: 10,
            detalhes: {
              captura: '3 a 4 horas',
              tratamento: 'até 20 dias',
              entregaveis: 'Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone',
              deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            }
          },
          {
            id: 5,
            nome: 'Ensaio Fotográfico de Família',
            descricao: 'Sessão fotográfica em ambiente externo para famílias. Foco em momentos espontâneos e com luz natural. Inclui direção de poses de fotos em grupo ou individuais.',
            preco_base: 450.00,
            duracao_media: 5,
            detalhes: {
              captura: '1 a 2 horas',
              tratamento: 'até 10 dias',
              entregaveis: '70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
              deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            }
          },
          {
            id: 6,
            nome: 'Fotografia e Filmagem Aérea',
            descricao: 'Registro profissional de imagens e vídeos aéreos para eventos, imóveis, arquitetura e paisagens.',
            preco_base: 750.00,
            duracao_media: 5,
            detalhes: {
              captura: '1 a 2 horas',
              tratamento: 'até 10 dias',
              entregaveis: '30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K. Entrega digital via link seguro e exclusivo.',
              adicionais: 'Horas Adicionais, Versão Estendida, Edição Avançada',
              deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            }
          }
        ];
        
        // Retornar os dados de fallback no mesmo formato que a API retornaria
        return { data: fallbackData };
      }
      
      throw error;
    }
  },
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