import React, { useState } from 'react';
import axios from 'axios';

/**
 * Configuração do axios para usar a URL correta da API
 * @version 1.5.0 - Implementada estratégia de fallback com múltiplas URLs
 */
const getEnvironment = () => {
  // Verificação segura para SSR
  if (typeof window === 'undefined') {
    return { 
      type: 'server', 
      isDev: true,
      baseUrl: 'http://localhost:3000'
    };
  }
  
  // Detecta ambiente de desenvolvimento tanto pelo localhost quanto por IPs locais
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.') ||
                      window.location.hostname.startsWith('10.');
  
  // Lista de URLs para produção em ordem de prioridade
  const prodApiUrls = [
    'https://lytspot.onrender.com',  // URL principal do Render
    'https://api.lytspot.com.br',    // URL personalizada (quando estiver configurada)
    window.location.origin           // URL atual como fallback
  ];
  
  return {
    type: 'browser',
    isDev: isLocalhost,
    // Em desenvolvimento, use localhost:3000
    // Em produção, use a primeira URL da lista (será testada com fallback)
    baseUrl: isLocalhost ? 'http://localhost:3000' : prodApiUrls[0],
    prodApiUrls: isLocalhost ? [] : prodApiUrls, // Lista de URLs alternativas para fallback
    hostname: window.location.hostname,
    href: window.location.href
  };
};

// Configuração do axios para apontar para o servidor backend
const api = axios.create({
  baseURL: getEnvironment().baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000,
  withCredentials: true // Habilita cookies para CORS em todos os ambientes
});

// Adiciona interceptor para lidar com erros de CORS e tentar URLs alternativas
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Se não estamos em modo de desenvolvimento e não é uma retentativa
    if (!getEnvironment().isDev && !originalRequest._retry) {
      const env = getEnvironment();
      
      // Se temos URLs alternativas para tentar
      if (env.prodApiUrls && env.prodApiUrls.length > 1) {
        // Marca como retentativa para evitar loop infinito
        originalRequest._retry = true;
        
        // Começa do segundo item da lista (o primeiro já foi tentado)
        for (let i = 1; i < env.prodApiUrls.length; i++) {
          const alternativeUrl = env.prodApiUrls[i];
          console.log(`Tentando login no servidor: ${alternativeUrl}`);
          
          try {
            // Atualiza a URL base para a alternativa
            originalRequest.baseURL = alternativeUrl;
            return await axios(originalRequest);
          } catch (retryError) {
            console.error(`Falha ao fazer login usando ${alternativeUrl}: ${retryError.message}`);
            // Continua para a próxima URL
          }
        }
      }
    }
    
    // Se todas as tentativas falharem ou não houver alternativas, rejeita com o erro original
    return Promise.reject(error);
  }
);

/**
 * Componente de formulário de login para o painel administrativo
 * @version 1.4.0 - Corrigida a URL da API e rotas de autenticação
 */
const LoginForm = ({ onLoginSuccess }) => {
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Estado para armazenar erros
  const [erro, setErro] = useState(null);
  
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(false);

  // Função para atualizar os dados do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  /**
   * Função para fazer login no sistema
   * @version 1.1.0 - Implementada estratégia de fallback com múltiplas URLs
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    const env = getEnvironment();
    
    // Em desenvolvimento, usa a instância padrão do axios
    if (env.isDev) {
      try {
        console.log('Tentando login no servidor:', api.defaults.baseURL);
        const response = await api.post('/api/auth/login', formData);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onLoginSuccess(response.data);
        } else {
          setErro('Resposta inválida do servidor.');
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        setErro(error.response?.data?.message || 'Erro ao conectar com o servidor.');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Em produção, tenta cada URL da lista até conseguir
    let loginSucesso = false;
    
    for (const baseURL of env.prodApiUrls) {
      if (loginSucesso) break;
      
      try {
        console.log(`Tentando login no servidor: ${baseURL}`);
        
        const response = await axios.post(`${baseURL}/api/auth/login`, 
          formData,
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000, // Timeout mais curto para tentar a próxima URL mais rapidamente
            withCredentials: true
          }
        );
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          loginSucesso = true;
          onLoginSuccess(response.data);
          console.log(`Login bem-sucedido usando: ${baseURL}`);
        }
      } catch (error) {
        console.warn(`Falha ao fazer login usando ${baseURL}:`, error.message);
        // Continua para a próxima URL
      }
    }
    
    if (!loginSucesso) {
      console.error('Não foi possível fazer login com nenhuma URL.');
      setErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-800 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="seu@email.com"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-800 font-medium mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="••••••••"
          />
        </div>
        
        {erro && (
          <div className="mb-4 bg-red-100 border border-red-400 rounded-lg p-3 text-center">
            <p className="text-red-700 text-sm">{erro}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-md transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Entrando...
            </span>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
