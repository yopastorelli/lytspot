import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ServicoForm from './ServicoForm';

/**
 * Configuração do axios para usar a URL correta da API
 * @version 1.4.0 - Corrigida a detecção de ambiente e URLs da API
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
  // Em produção, use a URL da API dedicada
  const prodApiUrl = 'https://api.lytspot.com.br'; // URL da API em produção
  
  return {
    type: 'browser',
    isDev: isLocalhost,
    // Em produção, use a URL da API dedicada
    baseUrl: isLocalhost ? 'http://localhost:3000' : prodApiUrl,
    hostname: window.location.hostname,
    href: window.location.href
  };
};

// Configuração do axios para apontar para o servidor backend
const api = axios.create({
  baseURL: getEnvironment().baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  timeout: 15000, // 15 segundos, igual ao PriceSimulator
  withCredentials: !getEnvironment().isDev // Habilita cookies em produção para CORS
});

/**
 * Componente para gerenciamento de serviços no painel administrativo
 * @version 1.3.0 - Corrigido problema de cores e sincronização com dados de demonstração
 */
const ServicosManager = ({ token }) => {
  // Estados para controle dos serviços
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Estados para controle do modal de formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  
  // Estados para controle de retentativas
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 segundos
  
  // Efeito para carregar os serviços ao montar o componente
  useEffect(() => {
    buscarServicos();
  }, []);
  
  // useCallback para buscar os serviços da API
  const buscarServicos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      
      const env = getEnvironment();
      const apiUrl = `${env.baseUrl}/api/pricing`;
      
      console.log('Buscando serviços do servidor:', apiUrl);
      
      // Usar fetch para buscar os serviços da API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        },
        credentials: !env.isDev ? 'include' : 'same-origin' // Incluir cookies em produção
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar serviços: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Serviços recebidos da API:', data);
      
      setServicos(data);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setErro('Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.');
      setLoading(false);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em ${retryDelay / 1000} segundos... (Tentativa ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          buscarServicos(); // Recursive call
        }, retryDelay);
      } else {
        console.error('Número máximo de tentativas atingido. Falha ao carregar os serviços.');
        setErro('Não foi possível carregar os serviços após várias tentativas. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    }
  }, [retryCount, token]);
  
  // Funções para abrir e fechar o modal
  const abrirModalCriacao = () => {
    setServicoEmEdicao(null);
    setModalAberto(true);
  };
  
  const abrirModalEdicao = (servico) => {
    setServicoEmEdicao(servico);
    setModalAberto(true);
  };
  
  const fecharModal = () => {
    setModalAberto(false);
    setServicoEmEdicao(null);
  };
  
  // Função para salvar um serviço (criar ou atualizar)
  const salvarServico = async (dadosServico) => {
    try {
      setLoading(true);
      
      if (servicoEmEdicao) {
        // Atualizar serviço existente
        await api.put(`/api/pricing/${servicoEmEdicao.id}`, dadosServico, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMensagemSucesso('Serviço atualizado com sucesso!');
      } else {
        // Criar novo serviço
        await api.post('/api/pricing', dadosServico, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMensagemSucesso('Serviço criado com sucesso!');
      }
      
      // Recarregar a lista de serviços
      await buscarServicos();
      
      // Sincronizar dados de demonstração
      await sincronizarDadosDemonstracao();
      
      // Fechar o modal
      fecharModal();
      
      // Limpar a mensagem de sucesso após alguns segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setErro(
        error.response?.data?.message || 
        'Erro ao salvar o serviço. Por favor, tente novamente.'
      );
      setLoading(false);
    }
  };
  
  // Função para excluir um serviço
  const excluirServico = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Excluir o serviço
      await api.delete(`/api/pricing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recarregar a lista de serviços
      await buscarServicos();
      
      // Sincronizar dados de demonstração
      await sincronizarDadosDemonstracao();
      
      setMensagemSucesso('Serviço excluído com sucesso!');
      
      // Limpar a mensagem de sucesso após alguns segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      setErro(
        error.response?.data?.message || 
        'Erro ao excluir o serviço. Por favor, tente novamente.'
      );
      setLoading(false);
    }
  };
  
  // Função para sincronizar dados de demonstração
  const sincronizarDadosDemonstracao = async () => {
    try {
      // Chamar a API para sincronizar os dados de demonstração
      await api.post('/api/sync/demo-data', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Dados de demonstração sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados de demonstração:', error);
      // Não exibimos erro para o usuário, pois isso é uma operação em segundo plano
    }
  };
  
  // Mostrar indicador de carregamento apenas se não houver serviços carregados ainda
  const semServicos = !loading && servicos.length === 0;
  
  if (loading && servicos.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-800"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-gray-800">
          Gerenciamento de Serviços
        </h2>
        
        {!semServicos && (
          <button
            onClick={abrirModalCriacao}
            className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Adicionar Serviço
          </button>
        )}
      </div>
      
      {erro && (
        <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
          <p className="text-red-700">{erro}</p>
          <button 
            onClick={() => {
              setErro(null);
              buscarServicos();
            }}
            className="mt-2 text-red-700 underline text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6">
          <p className="text-green-700">{mensagemSucesso}</p>
        </div>
      )}
      
      {servicos.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-100 text-blue-800 inline-block rounded-lg px-4 py-2 mb-4">
            Nenhum serviço cadastrado.
          </div>
          <div>
            <button
              onClick={() => abrirModalCriacao()}
              className="inline-flex items-center bg-blue-800 hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Adicionar o primeiro serviço
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Preço Base
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Duração Captura
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {servicos.map(servico => (
                <tr key={servico.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {servico.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {servico.descricao.length > 50 
                      ? `${servico.descricao.substring(0, 50)}...` 
                      : servico.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-dark">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(servico.preco_base)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {servico.duracao_media_captura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModalEdicao(servico)}
                      className="text-blue-700 hover:text-blue-900 mr-4 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirServico(servico.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal de formulário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-gray-800">
                {servicoEmEdicao ? 'Editar Serviço' : 'Adicionar Serviço'}
              </h3>
              <button 
                onClick={fecharModal} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ServicoForm 
              servicoInicial={servicoEmEdicao} 
              onSubmit={salvarServico} 
              onCancel={fecharModal}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosManager;
