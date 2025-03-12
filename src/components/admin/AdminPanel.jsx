import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm';
import ServicosManager from './ServicosManager';

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
 * Componente principal do painel administrativo
 * Gerencia autenticação e exibe o painel de gerenciamento de serviços
 * @version 1.3.0 - URL de API corrigida para apontar explicitamente para o servidor Express
 */
const AdminPanel = () => {
  // Estado para armazenar o token JWT
  const [token, setToken] = useState('');
  // Estado para armazenar os dados do usuário autenticado
  const [usuario, setUsuario] = useState(null);
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar erros
  const [erro, setErro] = useState(null);

  // Verificar se o usuário já está autenticado ao carregar o componente
  useEffect(() => {
    const verificarAutenticacao = async () => {
      // Obter o token do localStorage
      const tokenSalvo = localStorage.getItem('lytspot_admin_token');
      
      if (!tokenSalvo) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('Verificando autenticação no servidor:', getEnvironment().baseUrl);
        
        // Configurar o cabeçalho de autorização
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
        
        // Verificar o token (sem '/api' pois já está na baseURL)
        const response = await api.get('/auth/verify');
        
        // Atualizar os estados
        setToken(tokenSalvo);
        setUsuario(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        // Limpar o token inválido
        localStorage.removeItem('lytspot_admin_token');
        delete api.defaults.headers.common['Authorization'];
        
        setToken('');
        setUsuario(null);
        setLoading(false);
      }
    };
    
    verificarAutenticacao();
  }, []);

  // Função para lidar com o login bem-sucedido
  const handleLoginSuccess = (data) => {
    // Salvar o token no localStorage
    localStorage.setItem('lytspot_admin_token', data.token);
    
    // Configurar o cabeçalho de autorização
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    // Atualizar os estados
    setToken(data.token);
    setUsuario(data.user);
    setErro(null);
  };

  // Função para fazer logout
  const handleLogout = () => {
    // Limpar o token do localStorage
    localStorage.removeItem('lytspot_admin_token');
    
    // Remover o cabeçalho de autorização
    delete api.defaults.headers.common['Authorization'];
    
    // Atualizar os estados
    setToken('');
    setUsuario(null);
  };

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Renderizar o formulário de login se o usuário não estiver autenticado
  if (!token || !usuario) {
    return (
      <div className="min-h-screen bg-white rounded-lg border border-gray-200 shadow-lg p-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">
          Login Administrativo
        </h1>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        
        {erro && (
          <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
            <p className="text-red-700">{erro}</p>
          </div>
        )}
      </div>
    );
  }

  // Renderizar o painel de gerenciamento de serviços se o usuário estiver autenticado
  return (
    <div className="min-h-screen bg-white rounded-lg border border-gray-200 shadow-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">
            Painel Administrativo
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo, {usuario.nome}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Sair
        </button>
      </div>
      
      <div className="mt-8">
        <ServicosManager token={token} />
      </div>
    </div>
  );
};

export default AdminPanel;
