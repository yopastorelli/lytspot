import React, { useState } from 'react';
import api from '../../services/api';

/**
 * Componente de formulário de login para o painel administrativo
 * @version 2.1.0 - Corrigido nome do campo de senha para compatibilidade com o backend
 */
const LoginForm = ({ onLoginSuccess }) => {
  // Estados para controle do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  
  /**
   * Manipula o envio do formulário de login
   * @param {Event} e - Evento de submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    
    try {
      // Validação básica
      if (!email || !senha) {
        setErro('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }
      
      // Envia requisição de login
      console.log(`Tentando login no servidor: ${api.defaults.baseURL}`);
      const response = await api.post('/api/auth/login', { email, password: senha });
      
      // Armazena o token JWT no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Notifica o componente pai sobre o sucesso no login
      onLoginSuccess(response.data);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      console.log('Detalhes do erro:', error.response || error);
      
      // Tratamento de erros específicos
      if (error.response) {
        // O servidor respondeu com um status de erro
        setErro(error.response.data.message || 'Credenciais inválidas. Verifique seu email e senha.');
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        // Algo aconteceu na configuração da requisição
        setErro('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Administrativo
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>
          
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{erro}</span>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
