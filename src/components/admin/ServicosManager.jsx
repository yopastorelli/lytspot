import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ServicoForm from './ServicoForm';

/**
 * Componente para gerenciamento de serviços no painel administrativo
 * @version 2.1.0 - Corrigido para usar a rota correta da API e melhorar validação de dados
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
  
  // Carrega a lista de serviços
  const carregarServicos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    
    try {
      console.log(`Buscando serviços do servidor: ${api.defaults.baseURL}`);
      // Corrigido: Usar a rota /api/pricing em vez de /api/servicos
      const response = await api.get('/api/pricing');
      
      // Validar se a resposta contém um array antes de atribuir ao estado
      if (Array.isArray(response.data)) {
        setServicos(response.data);
      } else {
        console.error('Resposta da API não é um array:', response.data);
        setServicos([]);
        setErro('Formato de dados inválido recebido do servidor.');
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      
      if (error.response) {
        setErro(`Erro ${error.response.status}: ${error.response.data.message || 'Falha ao carregar serviços'}`);
      } else if (error.request) {
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        setErro('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
      
      // Garantir que servicos seja sempre um array, mesmo em caso de erro
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Carrega serviços ao montar o componente
  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);
  
  // Abre o modal para adicionar um novo serviço
  const abrirModalAdicao = () => {
    setServicoEmEdicao(null);
    setModalAberto(true);
  };
  
  // Abre o modal para editar um serviço existente
  const abrirModalEdicao = (servico) => {
    setServicoEmEdicao(servico);
    setModalAberto(true);
  };
  
  // Fecha o modal de formulário
  const fecharModal = () => {
    setModalAberto(false);
    setServicoEmEdicao(null);
  };
  
  // Salva um serviço (novo ou editado)
  const salvarServico = async (dadosServico) => {
    try {
      let response;
      
      if (servicoEmEdicao) {
        // Atualizar serviço existente
        response = await api.put(`/api/pricing/${servicoEmEdicao.id}`, dadosServico);
        setMensagemSucesso('Serviço atualizado com sucesso!');
      } else {
        // Criar novo serviço
        response = await api.post('/api/pricing', dadosServico);
        setMensagemSucesso('Serviço criado com sucesso!');
      }
      
      // Recarregar a lista de serviços
      await carregarServicos();
      
      // Fechar o modal
      fecharModal();
      
      // Limpar a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      
      if (error.response) {
        throw new Error(`Erro ${error.response.status}: ${error.response.data.message || 'Falha ao salvar serviço'}`);
      } else if (error.request) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        throw new Error('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
    }
  };
  
  // Confirma a exclusão de um serviço
  const confirmarExclusao = (servico) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?`)) {
      excluirServico(servico.id);
    }
  };
  
  // Exclui um serviço
  const excluirServico = async (id) => {
    try {
      await api.delete(`/api/pricing/${id}`);
      
      // Recarregar a lista de serviços
      await carregarServicos();
      
      // Exibir mensagem de sucesso
      setMensagemSucesso('Serviço excluído com sucesso!');
      
      // Limpar a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      
      if (error.response) {
        setErro(`Erro ${error.response.status}: ${error.response.data.message || 'Falha ao excluir serviço'}`);
      } else if (error.request) {
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        setErro('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
      }
    }
  };
  
  // Renderização do componente
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Serviços</h2>
        <button
          onClick={abrirModalAdicao}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          Adicionar Serviço
        </button>
      </div>
      
      {/* Mensagem de sucesso */}
      {mensagemSucesso && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{mensagemSucesso}</p>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{erro}</p>
          <button 
            onClick={carregarServicos} 
            className="mt-2 text-sm underline hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Tabela de serviços - Renderização condicional para garantir que servicos é um array */
        Array.isArray(servicos) && servicos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => abrirModalEdicao(servico)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(servico)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nenhum serviço encontrado.</p>
            <button 
              onClick={carregarServicos}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Recarregar
            </button>
          </div>
        )
      )}
      
      {/* Modal de formulário */}
      {modalAberto && (
        <ServicoForm
          servico={servicoEmEdicao}
          onSave={salvarServico}
          onCancel={fecharModal}
        />
      )}
    </div>
  );
};

export default ServicosManager;
