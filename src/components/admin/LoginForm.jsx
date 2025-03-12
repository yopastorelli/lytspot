import React, { useState } from 'react';
import axios from 'axios';

/**
 * Configuração do axios para usar a URL correta da API
 * @version 1.3.0
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
  
  // No ambiente de desenvolvimento, sempre use localhost:3000
  // Em produção, use a URL base do domínio atual
  return {
    type: 'browser',
    isDev: isLocalhost,
    // Em desenvolvimento, aponte explicitamente para o servidor Express
    baseUrl: isLocalhost ? 'http://localhost:3000' : window.location.origin,
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
  timeout: 15000
});

/**
 * Componente de formulário de login para o painel administrativo
 * @version 1.3.0 - URL de API corrigida para apontar explicitamente para o servidor Express
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

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setErro(null);
      
      console.log('Tentando login no servidor:', getEnvironment().baseUrl);
      
      // Enviar requisição de login
      // O axios já está configurado com a baseURL, então não precisa incluir '/api' novamente
      const response = await api.post('/api/auth/login', formData);
      
      // Chamar a função de callback com os dados de sucesso
      onLoginSuccess(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      // Exibir mensagem de erro
      setErro(
        error.response?.data?.message || 
        'Não foi possível fazer login. Por favor, tente novamente mais tarde.'
      );
      
      setLoading(false);
    }
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
