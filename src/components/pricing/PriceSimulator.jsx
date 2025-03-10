import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Possíveis endpoints da API para tentar
const API_ENDPOINTS = [
  // Opção 1: URL relativa (mesmo domínio) - funciona bem quando API e frontend estão no mesmo domínio
  '/api/pricing',
  
  // Opção 2: API local para desenvolvimento
  'http://localhost:3000/api/pricing',
  
  // Opção 3: API em produção (com www)
  'https://www.lytspot.com.br/api/pricing',
  
  // Opção 4: API em produção (sem www)
  'https://lytspot.com.br/api/pricing',
  
  // Opção 5: Subdomínio dedicado para API
  'https://api.lytspot.com.br/api/pricing'
];

/**
 * Componente Simulador de Preços
 * Permite ao usuário selecionar serviços e visualizar o preço total em tempo real
 */
const PriceSimulator = () => {
  // Estado para armazenar os serviços disponíveis
  const [servicos, setServicos] = useState([]);
  // Estado para armazenar serviços selecionados
  const [selecionados, setSelecionados] = useState([]);
  // Estado para controlar se está carregando
  const [loading, setLoading] = useState(true);
  // Estado para armazenar erros
  const [erro, setErro] = useState(null);
  // Endpoint que funcionou (para registro)
  const [endpointUtilizado, setEndpointUtilizado] = useState(null);

  // Função para tentar todos os endpoints disponíveis
  const buscarServicos = async () => {
    setLoading(true);
    setErro(null);
    
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      console.log('Executando no servidor, sem acesso à API');
      setLoading(false);
      setErro('Não foi possível carregar os serviços.');
      return;
    }
    
    // Detectar ambiente
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Escolher endpoints apropriados para o ambiente
    let endpointsParaTentar = isLocalhost 
      ? API_ENDPOINTS.slice(0, 2) // Em dev, apenas primeiros 2 endpoints
      : API_ENDPOINTS; // Em prod, todos os endpoints
      
    console.log(`Ambiente: ${isLocalhost ? 'desenvolvimento' : 'produção'}`);
    console.log('Tentando endpoints:', endpointsParaTentar);
    
    // Tentar cada endpoint até encontrar um que funcione
    for (const endpoint of endpointsParaTentar) {
      try {
        console.log(`Tentando endpoint: ${endpoint}`);
        
        // Tentar com fetch primeiro
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          // Modo de CORS diferente para local vs produção
          mode: endpoint.includes('localhost') ? 'cors' : 'cors',
          credentials: 'omit' // Não enviar cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`Endpoint ${endpoint} funcionou! ${data.length} serviços carregados.`);
            setServicos(data);
            setEndpointUtilizado(endpoint);
            setLoading(false);
            return;
          } else {
            console.warn(`Endpoint ${endpoint} respondeu, mas sem dados válidos:`, data);
          }
        } else {
          console.warn(`Endpoint ${endpoint} falhou: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Erro ao tentar endpoint ${endpoint}:`, error);
      }
    }
    
    // Se chegou aqui, todos os endpoints falharam
    console.error('Todos os endpoints falharam');
    setErro('Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.');
    setLoading(false);
  };

  // Buscar serviços quando o componente montar
  useEffect(() => {
    buscarServicos();
  }, []);

  // Função para lidar com a seleção de serviços
  const handleSelecaoServico = (id) => {
    setSelecionados((prevSelecionados) => {
      // Se já está selecionado, remover da lista
      if (prevSelecionados.includes(id)) {
        return prevSelecionados.filter((servicoId) => servicoId !== id);
      }
      // Se não está selecionado, adicionar à lista
      return [...prevSelecionados, id];
    });
  };

  // Calcular preço total dos serviços selecionados
  const calcularTotal = () => {
    return selecionados.reduce((total, id) => {
      const servico = servicos.find((s) => s.id === id);
      return total + (servico ? servico.preco_base : 0);
    }, 0);
  };

  // Formatar preço para exibição
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  // Renderiza loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-light">Carregando serviços disponíveis...</p>
      </div>
    );
  }

  // Renderiza mensagem de erro com opção de retry manual
  if (erro) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-300">{erro}</p>
        <button
          onClick={() => buscarServicos()}
          className="mt-4 bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  // Caso não haja serviços
  if (servicos.length === 0) {
    return (
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 text-center">
        <p className="text-blue-300">Não há serviços disponíveis no momento.</p>
        <button
          onClick={() => buscarServicos()}
          className="mt-4 bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Coluna de serviços disponíveis */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Serviços Disponíveis</h2>
        <div className="space-y-4">
          {servicos.map((servico) => (
            <div
              key={servico.id}
              className={`border rounded-lg p-4 transition-all ${
                selecionados.includes(servico.id)
                  ? 'bg-accent/10 border-accent/50'
                  : 'bg-dark-lighter border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-accent"
                  checked={selecionados.includes(servico.id)}
                  onChange={() => handleSelecaoServico(servico.id)}
                />
                <div className="ml-3 flex-1">
                  <h3 className="font-bold text-primary">{servico.nome}</h3>
                  <p className="text-sm text-light mt-1">{servico.descricao}</p>
                  <p className="text-accent font-bold mt-2">
                    {formatarPreco(servico.preco_base)}
                  </p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna de resumo e total */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Resumo do Orçamento</h2>
        
        <div className="bg-dark-lighter rounded-lg border border-gray-700/50 p-6">
          {selecionados.length === 0 ? (
            <p className="text-gray-400 italic">
              Selecione os serviços desejados para visualizar o orçamento.
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {selecionados.map((id) => {
                  const servico = servicos.find((s) => s.id === id);
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-light">{servico.nome}</span>
                      <span className="text-accent font-medium">
                        {formatarPreco(servico.preco_base)}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-light">Total:</span>
                  <span className="text-primary">{formatarPreco(calcularTotal())}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-dark rounded-lg p-4 text-center">
                  <p className="text-light text-sm mb-4">
                    Gostou do orçamento? Entre em contato conosco para agendar seu serviço.
                  </p>
                  <a
                    href="/contato"
                    className="inline-block bg-primary text-light font-medium py-2 px-6 rounded-md transition-colors hover:bg-primary-light"
                  >
                    Entrar em contato
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Os valores apresentados são estimativas iniciais baseadas nas opções selecionadas.<br />
            O valor final pode variar de acordo com requisitos específicos do projeto.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceSimulator;
