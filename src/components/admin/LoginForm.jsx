import React, { useState } from 'react';
import axios from 'axios';

// Configuração do axios para apontar para o servidor backend
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Componente de formulário de login para o painel administrativo
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
      
      // Enviar requisição de login
      const response = await api.post('/api/auth/login', formData);
      
      // Chamar a função de callback com os dados de sucesso
      onLoginSuccess(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Exibir mensagem de erro
      setErro(
        error.response?.data?.message || 
        'Não foi possível fazer login. Por favor, tente novamente mais tarde.'
      );
      
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-lighter rounded-lg border border-gray-700/50 p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-light font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-dark border border-gray-700 rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors"
            placeholder="seu@email.com"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-light font-medium mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-dark border border-gray-700 rounded-md py-2 px-3 text-light focus:outline-none focus:border-primary transition-colors"
            placeholder="••••••••"
          />
        </div>
        
        {erro && (
          <div className="mb-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-center">
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-primary hover:bg-primary-light text-dark font-medium py-3 px-6 rounded-md transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></span>
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
