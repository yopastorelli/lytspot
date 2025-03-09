import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm';
import ServicosManager from './ServicosManager';

// Configuração do axios para apontar para o servidor backend
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Componente principal do painel administrativo
 * Gerencia autenticação e exibe o painel de gerenciamento de serviços
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
        
        // Configurar o cabeçalho de autorização
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenSalvo}`;
        
        // Verificar o token
        const response = await api.get('/api/auth/verify');
        
        // Atualizar os estados
        setToken(tokenSalvo);
        setUsuario(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        
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
      <div className="min-h-screen bg-dark flex justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary">Painel Administrativo</h1>
            <p className="text-light mt-2">Faça login para acessar o painel</p>
          </div>
          
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          
          {erro && (
            <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-300">{erro}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizar o painel de gerenciamento de serviços se o usuário estiver autenticado
  return (
    <div className="min-h-screen bg-dark">
      <header className="bg-dark-lighter border-b border-gray-700/50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">Painel Administrativo</h1>
            <p className="text-light text-sm">Bem-vindo, {usuario.nome}</p>
          </div>
          
          <div>
            <button
              onClick={handleLogout}
              className="bg-transparent hover:bg-gray-700/50 text-light font-medium py-2 px-4 rounded-md transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <ServicosManager token={token} />
      </main>
    </div>
  );
};

export default AdminPanel;
