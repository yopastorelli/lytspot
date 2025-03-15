import React, { useState, useEffect, useRef } from 'react';
import { servicosAPI } from '../../services/api';
import { getEnvironment } from '../../utils/environment';
import ServiceCard from './ServiceCard';
import PricingCalculator from './PricingCalculator';
import { dadosDemonstracao } from './dadosDemonstracao';

/**
 * Componente de simulação de preços
 * @version 3.1.0 - 2025-03-15 - Adicionado suporte para identificação de requisições do simulador
 */
const PriceSimulator = () => {
  const [servicos, setServicos] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [usandoDadosDemonstracao, setUsandoDadosDemonstracao] = useState(false);
  const tentativasRef = useRef(0);
  const maxTentativas = 3;
  const env = getEnvironment();

  /**
   * Carrega os serviços da API
   */
  const carregarServicos = async () => {
    // Se já estamos usando dados de demonstração, não tenta novamente
    if (usandoDadosDemonstracao) return;
    
    setCarregando(true);
    setErro(null);
    
    // Cria um controller para cancelar a requisição se necessário
    const controller = new AbortController();
    
    try {
      console.log(`Carregando serviços da API: ${env.baseUrl}/api/pricing`);
      
      // Usa o serviço de API centralizado com o método específico
      // Passa a opção simulador=true para identificar que a requisição vem do simulador
      const response = await servicosAPI.listar({ simulador: true });
      
      // Verifica se a resposta contém dados válidos
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`[PriceSimulator] Serviços carregados: ${response.data.length} itens`);
        console.log('[PriceSimulator] Primeiro serviço:', response.data[0]);
        
        if (response.data.length > 0) {
          // Verificar se há IDs duplicados e corrigi-los
          const ids = response.data.map(servico => servico.id);
          const idsUnicos = [...new Set(ids)];
          
          if (ids.length !== idsUnicos.length) {
            console.warn('[PriceSimulator] Detectados IDs duplicados nos serviços. Removendo duplicatas...');
            const servicosSemDuplicatas = [];
            const idsProcessados = new Set();
            
            for (const servico of response.data) {
              if (!idsProcessados.has(servico.id)) {
                servicosSemDuplicatas.push(servico);
                idsProcessados.add(servico.id);
              }
            }
            
            console.log(`[PriceSimulator] Após remoção de duplicatas: ${servicosSemDuplicatas.length} serviços.`);
            setServicos(servicosSemDuplicatas);
          } else {
            // Usar diretamente os dados da API, sem verificar nomes específicos
            console.log(`[PriceSimulator] Serviços carregados com sucesso: ${response.data.length} itens`);
            setServicos(response.data);
            setUsandoDadosDemonstracao(false);
          }
        } else {
          console.warn('[PriceSimulator] API retornou array vazio. Usando dados de demonstração.');
          setServicos(dadosDemonstracao);
          setUsandoDadosDemonstracao(true);
          setErro('Nenhum serviço encontrado no servidor. Exibindo dados de demonstração.');
        }
      } else {
        console.warn('[PriceSimulator] API retornou dados vazios ou inválidos:', response?.data);
        throw new Error('API retornou dados inválidos ou vazios');
      }
    } catch (error) {
      // Ignora erros de requisição cancelada
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('[PriceSimulator] Requisição cancelada');
        return;
      }
      
      console.error('[erro] Erro ao carregar serviços:', error.message);
      
      // Incrementa contador de tentativas
      tentativasRef.current += 1;
      
      // Se excedeu o número máximo de tentativas, usa dados de demonstração
      if (tentativasRef.current >= maxTentativas) {
        console.warn(`[PriceSimulator] Máximo de tentativas (${maxTentativas}) excedido. Usando dados de demonstração.`);
        setServicos(dadosDemonstracao);
        setUsandoDadosDemonstracao(true);
        setErro(`Não foi possível carregar os dados do servidor após ${maxTentativas} tentativas. Exibindo dados de demonstração.`);
      } else {
        // Define mensagem de erro específica
        if (error.response) {
          setErro(`Erro ao carregar dados: ${error.response.status} - ${error.response.data?.message || 'Erro no servidor'}`);
        } else if (error.request) {
          setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          setErro(`Erro ao carregar serviços: ${error.message}`);
        }
        
        // Agenda nova tentativa após 3 segundos
        setTimeout(() => {
          console.log(`[PriceSimulator] Tentando novamente (${tentativasRef.current}/${maxTentativas})...`);
          carregarServicos();
        }, 3000);
      }
    } finally {
      setCarregando(false);
    }
    
    // Função de limpeza para cancelar a requisição se o componente for desmontado
    return () => {
      controller.abort();
    };
  };

  // Carrega os serviços quando o componente é montado
  useEffect(() => {
    carregarServicos();
    
    // Função de limpeza
    return () => {
      // Nada a limpar aqui, a função de limpeza é retornada pelo carregarServicos
    };
  }, []);

  // Log para monitorar mudanças no estado de serviços
  useEffect(() => {
    console.log(`[PriceSimulator] Estado de serviços atualizado: ${servicos.length} serviços`);
    if (servicos.length > 0) {
      console.log('[PriceSimulator] Primeiro serviço no estado:', servicos[0]);
    }
  }, [servicos]);

  // Alterna a seleção de um serviço
  const toggleServico = (servico) => {
    setServicosSelecionados(prev => {
      // Verifica se o serviço já está selecionado
      const jaExiste = prev.some(item => item.id === servico.id);
      
      if (jaExiste) {
        // Remove o serviço da lista se já estiver selecionado
        return prev.filter(item => item.id !== servico.id);
      } else {
        // Adiciona o serviço à lista se não estiver selecionado
        return [...prev, servico];
      }
    });
  };

  // Verifica se um serviço está selecionado
  const isServicoSelecionado = (servico) => {
    return servicosSelecionados.some(item => item.id === servico.id);
  };

  // Limpa todas as seleções
  const limparSelecoes = () => {
    setServicosSelecionados([]);
  };

  // Renderiza o componente
  return (
    <div className="container mx-auto px-4 py-8">
      {erro && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>{erro}</p>
          {usandoDadosDemonstracao && (
            <p className="mt-2 text-sm">
              <strong>Nota:</strong> Os dados exibidos são apenas para demonstração e podem não refletir os preços atuais.
            </p>
          )}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de serviços (2/3 em desktop) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Escolha um ou mais serviços para simular</h2>
              
              {servicosSelecionados.length > 0 && (
                <button 
                  onClick={limparSelecoes}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Limpar seleções
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {servicos.map((servico) => (
                <ServiceCard 
                  key={servico.id} 
                  servico={servico} 
                  selecionado={isServicoSelecionado(servico)}
                  onClick={() => toggleServico(servico)}
                />
              ))}
            </div>
            
            {servicos.length === 0 && !carregando && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-6 text-right">
              Última atualização de preços: Março/2025
            </div>
          </div>
          
          {/* Coluna da calculadora (1/3 em desktop) */}
          <div className="lg:col-span-1">
            <div className="flex flex-col h-full">
              <div className="mb-6 invisible lg:visible">
                <h2 className="text-2xl font-bold text-gray-800 opacity-0">Espaçador</h2>
              </div>
              
              <div className="sticky top-6">
                {servicosSelecionados.length > 0 ? (
                  <PricingCalculator servicos={servicosSelecionados} />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Calculadora de Preço</h3>
                    <p className="text-gray-500 mb-6">Selecione um ou mais serviços para calcular o preço.</p>
                    <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceSimulator;
