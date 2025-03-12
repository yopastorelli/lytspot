import React, { useState } from 'react';
import api from '../../services/api';

/**
 * Componente de formulário de login para o painel administrativo
 * @version 1.0.0 - 2025-03-12
 */
const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        // Login bem-sucedido
        onLoginSuccess(response.data.user, response.data.token);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      if (error.response) {
        // Erro do servidor
        setError(error.response.data?.message || 'Credenciais inválidas. Verifique seu email e senha.');
      } else if (error.request) {
        // Sem resposta do servidor
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        // Erro na configuração da requisição
        setError('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Login Administrativo</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sua senha"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;