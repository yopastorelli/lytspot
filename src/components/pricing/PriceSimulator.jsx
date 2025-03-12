import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { getEnvironment } from '../../utils/environment';
import ServiceCard from './ServiceCard';
import PricingCalculator from './PricingCalculator';
import { dadosDemonstracao } from './dadosDemonstracao';

/**
 * Componente de simulação de preços
 * @version 2.8.1 - 2025-03-12 - Refatorado para usar serviço de API centralizado e melhorado tratamento de erros
 */
const PriceSimulator = () => {
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
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
      console.log(`Carregando serviços da API: ${api.defaults.baseURL}/api/pricing`);
      
      // Usa o serviço de API centralizado
      const response = await api.get('/api/pricing', { 
        signal: controller.signal,
        timeout: 10000 // 10 segundos
      });
      
      // Verifica se a resposta contém dados válidos
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`[PriceSimulator] Serviços carregados com sucesso: ${response.data.length} itens`);
        setServicos(response.data);
        setUsandoDadosDemonstracao(false);
        tentativasRef.current = 0; // Reseta contador de tentativas
      } else {
        throw new Error('API retornou dados inválidos');
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
      console.log('[PriceSimulator] Componente desmontado');
    };
  }, []);

  /**
   * Seleciona um serviço
   * @param {Object} servico - Serviço selecionado
   */
  const selecionarServico = (servico) => {
    setServicoSelecionado(servico);
    
    // Scroll para a calculadora
    setTimeout(() => {
      const calculadora = document.getElementById('calculadora');
      if (calculadora) {
        calculadora.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-2">Simulador de Preços</h2>
        <p className="text-center text-gray-600 mb-4">
          Selecione um serviço para simular o valor do seu projeto
        </p>
        
        {usandoDadosDemonstracao && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Modo de demonstração</p>
            <p>Os preços exibidos são apenas para demonstração e podem não refletir os valores atuais.</p>
          </div>
        )}
        
        {erro && !usandoDadosDemonstracao && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Erro ao carregar dados</p>
            <p>{erro}</p>
            <button 
              onClick={carregarServicos}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
      
      {carregando ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando serviços...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicos.map((servico) => (
            <ServiceCard
              key={servico.id}
              servico={servico}
              selecionado={servicoSelecionado?.id === servico.id}
              onClick={() => selecionarServico(servico)}
            />
          ))}
        </div>
      )}
      
      {servicoSelecionado && (
        <div id="calculadora" className="mt-16 pt-4 border-t border-gray-200">
          <PricingCalculator servico={servicoSelecionado} />
        </div>
      )}
      
      {env.isDev && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <p>Ambiente: {env.isDev ? 'Desenvolvimento' : 'Produção'}</p>
          <p>API Base URL: {api.defaults.baseURL}</p>
          <p>Origem: {window.location.origin}</p>
          <p>Modo de demonstração: {usandoDadosDemonstracao ? 'Sim' : 'Não'}</p>
        </div>
      )}
    </div>
  );
};

export default PriceSimulator;
