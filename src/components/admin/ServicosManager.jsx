import React, { useState, useEffect, useCallback } from 'react';
import api, { servicosAPI } from '../../services/api';
import ServicoForm from './ServicoForm';

/**
 * Componente para gerenciamento de serviços no painel administrativo
 * @version 2.1.2 - 2025-03-12 - Corrigido problema de exibição do preço base
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
      // Usa o serviço de API centralizado
      const response = await servicosAPI.listar();
      console.log('Serviços carregados:', response.data);
      setServicos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setErro('Não foi possível carregar a lista de serviços. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Carrega os serviços quando o componente é montado
  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);
  
  // Abre o modal para adicionar um novo serviço
  const adicionarServico = () => {
    setServicoEmEdicao(null);
    setModalAberto(true);
  };
  
  // Abre o modal para editar um serviço existente
  const editarServico = (servico) => {
    console.log('Editando serviço:', servico);
    setServicoEmEdicao(servico);
    setModalAberto(true);
  };
  
  // Fecha o modal
  const fecharModal = () => {
    setModalAberto(false);
    setServicoEmEdicao(null);
    
    // Limpa a mensagem de sucesso após 3 segundos
    if (mensagemSucesso) {
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
    }
  };
  
  // Salva um serviço (novo ou editado)
  const salvarServico = async (servico) => {
    try {
      console.log('Salvando serviço:', servico);
      if (servico.id) {
        // Atualiza um serviço existente
        await servicosAPI.atualizar(servico.id, servico);
        setMensagemSucesso('Serviço atualizado com sucesso!');
      } else {
        // Cria um novo serviço
        await servicosAPI.criar(servico);
        setMensagemSucesso('Serviço criado com sucesso!');
      }
      
      // Recarrega a lista de serviços
      await carregarServicos();
      
      // Fecha o modal
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setErro('Não foi possível salvar o serviço. Verifique os dados e tente novamente.');
    }
  };
  
  // Exclui um serviço
  const excluirServico = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }
    
    try {
      await servicosAPI.excluir(id);
      setMensagemSucesso('Serviço excluído com sucesso!');
      
      // Recarrega a lista de serviços
      await carregarServicos();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      setErro('Não foi possível excluir o serviço. Tente novamente mais tarde.');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Serviços</h2>
        <button
          onClick={adicionarServico}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Adicionar Serviço
        </button>
      </div>
      
      {mensagemSucesso && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{mensagemSucesso}</p>
        </div>
      )}
      
      {erro && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{erro}</p>
          <button 
            onClick={carregarServicos}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando serviços...</span>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {servicos.length > 0 ? (
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
              <tbody className="bg-white divide-y divide-gray-200">
                {servicos.map((servico) => (
                  <tr key={servico.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{servico.nome}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{servico.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(servico.preco_base)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => editarServico(servico)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirServico(servico.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum serviço cadastrado.</p>
              <button
                onClick={adicionarServico}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Adicionar Primeiro Serviço
              </button>
            </div>
          )}
        </div>
      )}
      
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {servicoEmEdicao ? 'Editar Serviço' : 'Adicionar Serviço'}
            </h3>
            <ServicoForm
              servico={servicoEmEdicao}
              onSave={salvarServico}
              onCancel={fecharModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicosManager;
