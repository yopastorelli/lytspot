import React, { useState, useEffect, useRef } from 'react';
import { servicosAPI } from '../../services/api';
import { getEnvironment, getApiUrl } from '../../utils/environment';
import ServiceCard from './ServiceCard';
import PricingCalculator from './PricingCalculator';
import { dadosDemonstracao } from './dadosDemonstracao';

/**
 * Componente de simulação de preços
 * @version 3.3.0 - 2025-03-16 - Corrigido problema de CORS e melhorado tratamento de erros
 */
const PriceSimulator = () => {
  const [servicos, setServicos] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [usandoDadosDemonstracao, setUsandoDadosDemonstracao] = useState(false);
  const tentativasRef = useRef(0);
  const maxTentativas = 3;

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
      // Usar a nova função getApiUrl para obter a URL correta
      const apiUrl = getApiUrl('pricing/definitions');
      console.log(`Carregando definições de serviços da API: ${apiUrl}`);
      
      // Incrementa o contador de tentativas
      tentativasRef.current += 1;
      
      // Usa o novo método para buscar diretamente das definições
      const response = await servicosAPI.listarDefinicoes();
      
      // Verifica se a resposta contém dados válidos
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`[PriceSimulator] Serviços carregados das definições: ${response.data.length} itens`);
        
        if (response.data.length > 0) {
          console.log('[PriceSimulator] Primeiro serviço:', response.data[0]);
          
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
          console.warn('[PriceSimulator] API retornou uma lista vazia de serviços. Usando dados de demonstração.');
          setServicos(dadosDemonstracao);
          setUsandoDadosDemonstracao(true);
        }
      } else {
        console.error('[PriceSimulator] Formato de resposta inválido:', response);
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('[PriceSimulator] Erro ao carregar serviços:', error);
      
      // Tratamento de erro mais detalhado
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.error(`[PriceSimulator] Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        setErro(`Erro ao carregar serviços: ${error.response.status} - ${error.response.data?.message || 'Erro desconhecido'}`);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        console.error('[PriceSimulator] Sem resposta do servidor:', error.request);
        setErro('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        // Erro na configuração da requisição
        console.error('[PriceSimulator] Erro de configuração:', error.message);
        setErro(`Erro ao preparar a requisição: ${error.message}`);
      }
      
      // Se excedeu o número máximo de tentativas, usar dados de demonstração
      if (tentativasRef.current >= maxTentativas) {
        console.warn(`[PriceSimulator] Excedido número máximo de tentativas (${maxTentativas}). Usando dados de demonstração.`);
        setServicos(dadosDemonstracao);
        setUsandoDadosDemonstracao(true);
        setErro('Não foi possível carregar os serviços da API. Usando dados de demonstração.');
      } else {
        // Tentar novamente após um breve intervalo (exponential backoff)
        const tempoEspera = Math.pow(2, tentativasRef.current) * 1000; // 2s, 4s, 8s
        console.log(`[PriceSimulator] Tentando novamente em ${tempoEspera/1000} segundos...`);
        
        setTimeout(() => {
          carregarServicos();
        }, tempoEspera);
      }
    } finally {
      setCarregando(false);
      
      // Limpar o controller
      if (controller) {
        controller.abort();
      }
    }
  };

  // Carrega os serviços quando o componente é montado
  useEffect(() => {
    carregarServicos();
    
    // Limpa o estado quando o componente é desmontado
    return () => {
      setServicos([]);
      setServicosSelecionados([]);
      setCarregando(false);
      setErro(null);
    };
  }, []);

  // Manipula a seleção de um serviço
  const toggleServico = (servico) => {
    setServicosSelecionados(prev => {
      // Verifica se o serviço já está selecionado
      const jaExiste = prev.some(s => s.id === servico.id);
      
      if (jaExiste) {
        // Remove o serviço da lista
        return prev.filter(s => s.id !== servico.id);
      } else {
        // Adiciona o serviço à lista
        return [...prev, servico];
      }
    });
  };

  // Renderiza o componente
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Simulador de Preços</h1>
      
      {carregando && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando serviços...</span>
        </div>
      )}
      
      {erro && !usandoDadosDemonstracao && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {erro}</span>
        </div>
      )}
      
      {usandoDadosDemonstracao && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Atenção!</strong>
          <span className="block sm:inline"> Usando dados de demonstração. Os valores apresentados são apenas ilustrativos.</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Nossos Serviços</h2>
          
          {!carregando && servicos.length === 0 && (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-700">Nenhum serviço disponível no momento.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servicos.map(servico => (
              <ServiceCard
                key={servico.id}
                servico={servico}
                selecionado={servicosSelecionados.some(s => s.id === servico.id)}
                onToggle={() => toggleServico(servico)}
              />
            ))}
          </div>
        </div>
        
        <div className="md:col-span-1">
          {servicosSelecionados.length > 0 ? (
            <PricingCalculator servicos={servicosSelecionados} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Calculadora de Preço</h3>
              <p className="text-gray-600 mb-4">
                Selecione um ou mais serviços para visualizar o orçamento estimado.
              </p>
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceSimulator;
