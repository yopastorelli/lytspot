import React, { useState, useEffect, useCallback } from 'react';
import api, { servicosAPI } from '../../services/api';
import ServicoForm from './ServicoForm';

/**
 * Componente para gerenciamento de serviços no painel administrativo
 * @version 2.2.0 - 2025-03-13 - Adicionada funcionalidade de atualização em massa
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
  
  // Estados para atualização em massa
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [modoAtualizacaoEmMassa, setModoAtualizacaoEmMassa] = useState(false);
  const [campoAtualizacaoEmMassa, setCampoAtualizacaoEmMassa] = useState('preco_base');
  const [valorAtualizacaoEmMassa, setValorAtualizacaoEmMassa] = useState('');
  const [percentualAtualizacao, setPercentualAtualizacao] = useState('');
  const [modoPercentual, setModoPercentual] = useState(false);
  const [atualizandoEmMassa, setAtualizandoEmMassa] = useState(false);
  
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
  
  // Alterna a seleção de um serviço para atualização em massa
  const toggleSelecaoServico = (id) => {
    setServicosSelecionados(prev => {
      if (prev.includes(id)) {
        return prev.filter(servicoId => servicoId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Seleciona ou desmarca todos os serviços
  const toggleSelecionarTodos = () => {
    if (servicosSelecionados.length === servicos.length) {
      setServicosSelecionados([]);
    } else {
      setServicosSelecionados(servicos.map(servico => servico.id));
    }
  };
  
  // Ativa o modo de atualização em massa
  const ativarModoAtualizacaoEmMassa = () => {
    if (servicosSelecionados.length === 0) {
      setErro('Selecione pelo menos um serviço para atualização em massa.');
      return;
    }
    setModoAtualizacaoEmMassa(true);
  };
  
  // Cancela o modo de atualização em massa
  const cancelarAtualizacaoEmMassa = () => {
    setModoAtualizacaoEmMassa(false);
    setValorAtualizacaoEmMassa('');
    setPercentualAtualizacao('');
    setModoPercentual(false);
  };
  
  // Executa a atualização em massa
  const executarAtualizacaoEmMassa = async () => {
    if (servicosSelecionados.length === 0) {
      setErro('Selecione pelo menos um serviço para atualização em massa.');
      return;
    }
    
    if (!campoAtualizacaoEmMassa) {
      setErro('Selecione um campo para atualizar.');
      return;
    }
    
    if (modoPercentual && (isNaN(percentualAtualizacao) || percentualAtualizacao === '')) {
      setErro('Informe um percentual válido para a atualização.');
      return;
    }
    
    if (!modoPercentual && valorAtualizacaoEmMassa === '') {
      setErro('Informe um valor para a atualização.');
      return;
    }
    
    try {
      setAtualizandoEmMassa(true);
      setErro(null);
      
      // Preparar os serviços para atualização
      const servicosParaAtualizar = servicos
        .filter(servico => servicosSelecionados.includes(servico.id))
        .map(servico => {
          const servicoAtualizado = { ...servico };
          
          if (modoPercentual) {
            // Atualizar com base em percentual
            const percentual = parseFloat(percentualAtualizacao) / 100;
            
            if (campoAtualizacaoEmMassa === 'preco_base' && !isNaN(servico.preco_base)) {
              const valorAtual = parseFloat(servico.preco_base);
              const aumento = valorAtual * percentual;
              servicoAtualizado.preco_base = valorAtual + aumento;
            }
          } else {
            // Atualizar com valor fixo
            if (campoAtualizacaoEmMassa === 'preco_base') {
              servicoAtualizado.preco_base = parseFloat(valorAtualizacaoEmMassa);
            } else if (typeof valorAtualizacaoEmMassa === 'string') {
              servicoAtualizado[campoAtualizacaoEmMassa] = valorAtualizacaoEmMassa;
            }
          }
          
          return servicoAtualizado;
        });
      
      // Enviar para a API
      const response = await servicosAPI.atualizarEmMassa(servicosParaAtualizar);
      
      // Atualizar a lista de serviços
      await carregarServicos();
      
      // Exibir mensagem de sucesso
      setMensagemSucesso(`${response.data.resultados.length} serviços atualizados com sucesso!`);
      
      // Limpar seleção e sair do modo de atualização em massa
      setServicosSelecionados([]);
      setModoAtualizacaoEmMassa(false);
      setValorAtualizacaoEmMassa('');
      setPercentualAtualizacao('');
      
    } catch (error) {
      console.error('Erro ao atualizar serviços em massa:', error);
      setErro('Não foi possível atualizar os serviços. Verifique os dados e tente novamente.');
    } finally {
      setAtualizandoEmMassa(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Serviços</h2>
        <div className="flex space-x-2">
          {servicosSelecionados.length > 0 && !modoAtualizacaoEmMassa && (
            <button
              onClick={ativarModoAtualizacaoEmMassa}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Atualizar Selecionados ({servicosSelecionados.length})
            </button>
          )}
          <button
            onClick={adicionarServico}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Adicionar Serviço
          </button>
        </div>
      </div>
      
      {modoAtualizacaoEmMassa && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Atualização em Massa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campo a atualizar
              </label>
              <select
                value={campoAtualizacaoEmMassa}
                onChange={(e) => setCampoAtualizacaoEmMassa(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="preco_base">Preço Base</option>
                <option value="descricao">Descrição</option>
                <option value="duracao_media_captura">Duração Média (Captura)</option>
                <option value="duracao_media_tratamento">Duração Média (Tratamento)</option>
                <option value="entregaveis">Entregáveis</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de atualização
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!modoPercentual}
                    onChange={() => setModoPercentual(false)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Valor Fixo</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={modoPercentual}
                    onChange={() => setModoPercentual(true)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Percentual</span>
                </label>
              </div>
            </div>
            
            {modoPercentual ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentual de ajuste (%)
                </label>
                <input
                  type="number"
                  value={percentualAtualizacao}
                  onChange={(e) => setPercentualAtualizacao(e.target.value)}
                  placeholder="Ex: 10 para +10%, -5 para -5%"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo valor
                </label>
                <input
                  type={campoAtualizacaoEmMassa === 'preco_base' ? 'number' : 'text'}
                  value={valorAtualizacaoEmMassa}
                  onChange={(e) => setValorAtualizacaoEmMassa(e.target.value)}
                  placeholder={campoAtualizacaoEmMassa === 'preco_base' ? "Ex: 299.90" : "Novo valor"}
                  className="w-full p-2 border border-gray-300 rounded"
                  step={campoAtualizacaoEmMassa === 'preco_base' ? "0.01" : undefined}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={cancelarAtualizacaoEmMassa}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={atualizandoEmMassa}
            >
              Cancelar
            </button>
            <button
              onClick={executarAtualizacaoEmMassa}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              disabled={atualizandoEmMassa}
            >
              {atualizandoEmMassa ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Atualizando...
                </span>
              ) : (
                'Atualizar Serviços'
              )}
            </button>
          </div>
        </div>
      )}
      
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={servicosSelecionados.length === servicos.length && servicos.length > 0}
                      onChange={toggleSelecionarTodos}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </th>
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
                  <tr key={servico.id} className={servicosSelecionados.includes(servico.id) ? "bg-blue-50" : ""}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={servicosSelecionados.includes(servico.id)}
                        onChange={() => toggleSelecaoServico(servico.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </td>
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
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum serviço encontrado.</p>
            </div>
          )}
        </div>
      )}
      
      {modalAberto && (
        <ServicoForm
          servico={servicoEmEdicao}
          onSave={salvarServico}
          onClose={fecharModal}
        />
      )}
    </div>
  );
};

export default ServicosManager;
