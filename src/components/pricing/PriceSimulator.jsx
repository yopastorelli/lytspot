import React, { useState, useEffect, useRef } from 'react';
import api, { servicosAPI } from '../../services/api';
import { getEnvironment } from '../../utils/environment';
import ServiceCard from './ServiceCard';
import PricingCalculator from './PricingCalculator';
import { dadosDemonstracao } from './dadosDemonstracao';

/**
 * Componente de simulação de preços
 * @version 2.8.4 - 2025-03-12 - Corrigido problema de URL da API em produção
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
      console.log(`Carregando serviços da API: ${env.baseUrl}/api/pricing`);
      
      // Usa o serviço de API centralizado com o método específico
      const response = await servicosAPI.listar();
      
      // Verifica se a resposta contém dados válidos
      if (response && response.data && Array.isArray(response.data)) {
        console.log(`[PriceSimulator] Serviços carregados: ${JSON.stringify(response.data)}`);
        
        if (response.data.length > 0) {
          console.log(`[PriceSimulator] Serviços carregados com sucesso: ${response.data.length} itens`);
          setServicos(response.data);
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

  // Seleciona um serviço
  const selecionarServico = (servico) => {
    setServicoSelecionado(servico);
  };

  // Volta para a lista de serviços
  const voltarParaLista = () => {
    setServicoSelecionado(null);
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
      ) : servicoSelecionado ? (
        <div>
          <button 
            onClick={voltarParaLista}
            className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
          >
            <span>← Voltar para lista</span>
          </button>
          <PricingCalculator servico={servicoSelecionado} />
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Escolha um serviço para simular</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <ServiceCard 
                key={servico.id} 
                servico={servico} 
                onClick={() => selecionarServico(servico)}
              />
            ))}
          </div>
          
          {servicos.length === 0 && !carregando && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceSimulator;
