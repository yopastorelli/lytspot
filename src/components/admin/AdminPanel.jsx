import React, { useState, useEffect } from 'react';
import api, { authAPI } from '../../services/api';
import LoginForm from './LoginForm';
import ServicosManager from './ServicosManager';

/**
 * Componente principal do painel administrativo
 * @version 2.0.1 - 2025-03-12 - Atualizado para usar o serviço authAPI centralizado
 */
const AdminPanel = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verifica se o usuário está autenticado ao carregar o componente
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verificar se o token ainda é válido
        const verifyToken = async () => {
          try {
            await authAPI.verificarToken();
            // Token válido, não precisa fazer nada
          } catch (error) {
            console.error('Token inválido ou expirado:', error);
            // Limpar dados de autenticação
            handleLogout();
          }
        };
        
        verifyToken();
      } catch (e) {
        console.error('Erro ao processar dados do usuário:', e);
        // Limpa dados inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Função para lidar com o login bem-sucedido
  const handleLoginSuccess = (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Função para fazer logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Exibe o formulário de login se não estiver autenticado
  if (!token && !loading) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Exibe um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Exibe o painel administrativo quando autenticado
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho do painel */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-serif font-bold text-gray-800">
            Painel Administrativo
          </h1>
          
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                Olá, {user.nome || user.email}
              </span>
            )}
            
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        <ServicosManager token={token} />
      </main>
      
      {/* Rodapé */}
      <footer className="bg-white shadow-sm mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} LytSpot - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
};

export default AdminPanel;
