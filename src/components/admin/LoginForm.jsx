import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';

/**
 * Componente de formulário de login para o painel administrativo
 * @version 1.2.0 - 2025-03-12 - Corrigido envio de credenciais e melhorado tratamento de erros
 */
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  /**
   * Valida os campos do formulário
   * @returns {boolean} Verdadeiro se os campos são válidos
   */
  const validarCampos = () => {
    if (!email.trim()) {
      setErro('Por favor, informe seu email');
      return false;
    }
    
    if (!senha.trim()) {
      setErro('Por favor, informe sua senha');
      return false;
    }
    
    return true;
  };

  /**
   * Manipula o envio do formulário
   * @param {Event} e - Evento de submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpa mensagens de erro anteriores
    setErro('');
    
    // Valida campos antes de enviar
    if (!validarCampos()) {
      return;
    }
    
    setCarregando(true);
    
    try {
      console.log('Enviando requisição de login para:', api.defaults.baseURL);
      
      // Envia requisição com campo password (não senha)
      const response = await api.post('/api/auth/login', { 
        email, 
        password: senha // Importante: o backend espera "password", não "senha"
      });
      
      // Armazena token e informações do usuário
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redireciona para o dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro de login:', error);
      
      // Tratamento específico por tipo de erro
      if (error.response) {
        // Resposta do servidor com erro
        const status = error.response.status;
        
        if (status === 401) {
          setErro('Email ou senha incorretos');
        } else if (status === 403) {
          setErro('Acesso não autorizado');
        } else if (status === 429) {
          setErro('Muitas tentativas. Tente novamente mais tarde');
        } else {
          setErro(`Erro no servidor: ${error.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (error.request) {
        // Requisição enviada mas sem resposta
        setErro('Servidor não respondeu. Verifique sua conexão');
        console.error('Requisição sem resposta:', error.request);
      } else {
        // Erro na configuração da requisição
        setErro('Erro ao conectar com o servidor');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login Administrativo</h2>
      
      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregando}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="senha">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="senha"
              type="password"
              className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex justify-center items-center"
          disabled={carregando}
        >
          {carregando ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
