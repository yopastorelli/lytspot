import React, { useState, useEffect, useRef } from 'react';
import api, { servicosAPI } from '../../services/api';
import { getEnvironment } from '../../utils/environment';
import ServiceCard from './ServiceCard';
import PricingCalculator from './PricingCalculator';
import { dadosDemonstracao } from './dadosDemonstracao';

/**
 * Componente de simulação de preços
 * @version 3.0.0 - 2025-03-12 - Adicionado suporte para seleção múltipla de serviços
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
      console.log(`Carregando serviços da API: ${env.baseUrl}/pricing`);
      
      // Usa o serviço de API centralizado com o método específico
      const response = await servicosAPI.listar();
      
      // Verifica se a resposta contém dados válidos
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`[PriceSimulator] Serviços carregados: ${JSON.stringify(response.data)}`);
        
        if (response.data.length > 0) {
          console.log(`[PriceSimulator] Serviços carregados com sucesso: ${response.data.length} itens`);
          
          // Definir a ordem específica dos serviços
          const ordemServicos = [
            "VLOG - Aventuras em Família",
            "VLOG - Amigos e Comunidade",
            "Cobertura Fotográfica de Evento Social",
            "Filmagem de Evento Social",
            "Ensaio Fotográfico de Família",
            "Filmagem Aérea com Drone",
            "Fotografia Aérea com Drone"
          ];
          
          // Ordenar os serviços conforme a ordem específica
          const servicosOrdenados = [...response.data].sort((a, b) => {
            const indexA = ordemServicos.indexOf(a.nome);
            const indexB = ordemServicos.indexOf(b.nome);
            
            // Se ambos os serviços estiverem na lista de ordem, usar a ordem definida
            if (indexA >= 0 && indexB >= 0) {
              return indexA - indexB;
            }
            
            // Se apenas um estiver na lista, priorizá-lo
            if (indexA >= 0) return -1;
            if (indexB >= 0) return 1;
            
            // Se nenhum estiver na lista, manter a ordem original
            return 0;
          });
          
          console.log(`[PriceSimulator] Serviços ordenados: ${servicosOrdenados.map(s => s.nome).join(', ')}`);
          setServicos(servicosOrdenados);
          setUsandoDadosDemonstracao(false);
          tentativasRef.current = 0; // Reseta contador de tentativas
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
