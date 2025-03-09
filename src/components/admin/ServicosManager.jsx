import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServicoForm from './ServicoForm';

// Configuração do axios para apontar para o servidor backend
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Componente para gerenciamento de serviços no painel administrativo
 */
const ServicosManager = ({ token }) => {
  // Estado para armazenar os serviços
  const [servicos, setServicos] = useState([]);
  // Estado para armazenar o serviço em edição
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  // Estado para controlar o modal de formulário
  const [modalAberto, setModalAberto] = useState(false);
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar erros
  const [erro, setErro] = useState(null);
  // Estado para armazenar mensagens de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  // Buscar os serviços ao carregar o componente
  useEffect(() => {
    buscarServicos();
  }, []);

  // Função para buscar os serviços da API
  const buscarServicos = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      // Buscar os serviços da API
      const response = await api.get('/api/pricing');
      setServicos(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setErro('Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Função para abrir o modal de criação de serviço
  const abrirModalCriacao = () => {
    setServicoEmEdicao(null);
    setModalAberto(true);
  };

  // Função para abrir o modal de edição de serviço
  const abrirModalEdicao = (servico) => {
    setServicoEmEdicao(servico);
    setModalAberto(true);
  };

  // Função para fechar o modal
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
      
      // Fechar o modal e buscar os serviços atualizados
      fecharModal();
      await buscarServicos();
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      
      setErro(
        error.response?.data?.message || 
        'Não foi possível salvar o serviço. Por favor, tente novamente mais tarde.'
      );
      
      setLoading(false);
    }
  };

  // Função para excluir um serviço
  const excluirServico = async (id) => {
    // Confirmar a exclusão
    if (!window.confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Excluir o serviço
      await api.delete(`/api/pricing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Buscar os serviços atualizados
      await buscarServicos();
      
      setMensagemSucesso('Serviço excluído com sucesso!');
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      
      setErro(
        error.response?.data?.message || 
        'Não foi possível excluir o serviço. Por favor, tente novamente mais tarde.'
      );
      
      setLoading(false);
    }
  };

  // Renderizar o componente de carregamento
  if (loading && servicos.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-primary">Gerenciamento de Serviços</h2>
        
        <button
          onClick={abrirModalCriacao}
          className="bg-primary hover:bg-primary-light text-dark font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Serviço
        </button>
      </div>
      
      {erro && (
        <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300">{erro}</p>
          <button 
            onClick={() => {
              setErro(null);
              buscarServicos();
            }}
            className="mt-2 text-red-300 underline text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-300">{mensagemSucesso}</p>
        </div>
      )}
      
      {servicos.length === 0 ? (
        <div className="bg-dark-lighter rounded-lg border border-gray-700/50 p-8 text-center">
          <p className="text-light mb-4">Nenhum serviço cadastrado.</p>
          <button
            onClick={abrirModalCriacao}
            className="bg-primary hover:bg-primary-light text-dark font-medium py-2 px-4 rounded-md transition-colors"
          >
            Adicionar o primeiro serviço
          </button>
        </div>
      ) : (
        <div className="bg-dark-lighter rounded-lg border border-gray-700/50 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Preço Base
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duração Captura
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {servicos.map(servico => (
                <tr key={servico.id} className="hover:bg-dark/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">
                    {servico.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {servico.descricao.length > 50 
                      ? `${servico.descricao.substring(0, 50)}...` 
                      : servico.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(servico.preco_base)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {servico.duracao_media_captura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModalEdicao(servico)}
                      className="text-primary hover:text-primary-light mr-4 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirServico(servico.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
          <div className="bg-dark-lighter rounded-lg border border-gray-700/50 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-primary">
                {servicoEmEdicao ? 'Editar Serviço' : 'Adicionar Serviço'}
              </h3>
              
              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-light transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ServicoForm 
              servicoInicial={servicoEmEdicao}
              onSubmit={salvarServico}
              onCancel={fecharModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosManager;
