import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Função para criar logs detalhados de depuração
const debugLog = (message, data) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🔍 ${message}`, data || '');
};

// Configuração correta das URLs da API com base no ambiente
const getApiConfig = () => {
  // Durante o build do Astro, window não está disponível
  if (typeof window === 'undefined') {
    return {
      baseUrl: 'https://api.lytspot.com.br',
      pricingPath: '/api/pricing'
    };
  }
  
  // No cliente, verificamos o hostname para determinar o ambiente
  const hostname = window.location.hostname;
  const port = window.location.port;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  debugLog(`Detectado ambiente: hostname=${hostname}, port=${port}, isLocalhost=${isLocalhost}`);
  
  if (isLocalhost) {
    // Em desenvolvimento local, precisamos usar a URL completa do servidor Express
    debugLog('Usando configuração de desenvolvimento');
    return {
      baseUrl: 'http://localhost:3000',
      pricingPath: '/api/pricing'
    };
  } else {
    // Em produção
    debugLog('Usando configuração de produção');
    return {
      baseUrl: 'https://api.lytspot.com.br',
      pricingPath: '/api/pricing'
    };
  }
};

// Criamos a instância do axios quando necessário
const createApi = () => {
  const { baseUrl } = getApiConfig();
  debugLog('Criando instância do axios com baseURL:', baseUrl);
  
  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    },
    withCredentials: false, // Desabilitar credenciais para evitar problemas de CORS
    timeout: 15000 // Timeout aumentado para 15 segundos
  });
  
  // Adicionar interceptors para debug
  api.interceptors.request.use(request => {
    debugLog('Requisição axios:', `${request.method?.toUpperCase()} ${request.url}`);
    return request;
  }, error => {
    debugLog('Erro na requisição axios:', error.message);
    return Promise.reject(error);
  });
  
  api.interceptors.response.use(response => {
    debugLog('Resposta axios:', `${response.status} ${response.statusText}`);
    return response;
  }, error => {
    if (error.response) {
      debugLog('Erro na resposta axios:', 
        `${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      debugLog('Sem resposta do servidor axios:', error.message);
    } else {
      debugLog('Erro de configuração axios:', error.message);
    }
    return Promise.reject(error);
  });
  
  return api;
};

// Data da última atualização dos preços
const dataAtualizacao = '10/03/2025';

/**
 * Componente Simulador de Preços
 * Permite ao usuário selecionar serviços e visualizar o preço total em tempo real
 */
const PriceSimulator = () => {
  // Estado para armazenar os serviços disponíveis
  const [servicos, setServicos] = useState([]);
  // Estado para armazenar os serviços selecionados
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  // Estado para armazenar o preço total
  const [precoTotal, setPrecoTotal] = useState(0);
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar erros
  const [erro, setErro] = useState(null);
  // Estado para controlar tentativas de conexão
  const [tentativas, setTentativas] = useState(0);

  // Função para buscar serviços
  const buscarServicos = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      debugLog('Iniciando busca de serviços');
      
      // Verificar se estamos no cliente
      if (typeof window === 'undefined') {
        debugLog('Executando no servidor, sem acesso à API');
        setLoading(false);
        setErro('Não foi possível carregar os serviços.');
        return;
      }

      // Determinar URL da API - usar URL absoluta direta sem ambiguidade
      const apiUrl = 'http://localhost:3000/api/pricing';
      debugLog(`Tentando acessar API diretamente: ${apiUrl}`);
      
      try {
        // Utilizando o método fetch nativo com todas as configurações explícitas
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
          credentials: 'omit',
          redirect: 'follow',
          referrerPolicy: 'no-referrer'
        });
        
        debugLog(`Resposta da API: status=${response.status}, ok=${response.ok}`);
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          debugLog(`Tipo de conteúdo recebido: ${contentType}`);
          
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            debugLog(`Dados recebidos: ${Array.isArray(data) ? data.length : 'não é array'} itens`);
            
            if (Array.isArray(data) && data.length > 0) {
              setServicos(data);
              setLoading(false);
              return;
            } else {
              throw new Error("Resposta não contém serviços válidos");
            }
          } else {
            throw new Error(`Tipo de conteúdo inválido: ${contentType}`);
          }
        } else {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        debugLog(`Erro no fetch: ${fetchError.message}`);
        
        // Último recurso: tentar com XMLHttpRequest
        debugLog('Tentando com XMLHttpRequest como último recurso');
        
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', apiUrl, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Accept', 'application/json');
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                debugLog(`XHR bem-sucedido: ${data.length} serviços`);
                setServicos(data);
                setLoading(false);
              } catch (parseError) {
                debugLog(`Erro ao processar resposta XHR: ${parseError.message}`);
                setErro('Erro ao processar a resposta do servidor.');
                setLoading(false);
              }
            } else {
              debugLog(`XHR falhou com status ${xhr.status}`);
              setErro('Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.');
              setLoading(false);
            }
          };
          
          xhr.onerror = function() {
            debugLog('Erro de rede no XHR');
            setErro('Erro de rede ao tentar conectar ao servidor.');
            setLoading(false);
          };
          
          xhr.send();
        } catch (xhrError) {
          debugLog(`Erro ao configurar XHR: ${xhrError.message}`);
          setErro('Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.');
          setLoading(false);
        }
      }
    } catch (error) {
      debugLog(`Erro geral na busca de serviços: ${error.message}`);
      setErro('Falha ao tentar carregar os serviços. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Buscar os serviços disponíveis ao carregar o componente
  useEffect(() => {
    // Apenas executar no cliente
    if (typeof window !== 'undefined') {
      buscarServicos();
    }
  }, []);

  // Atualizar a lista de serviços selecionados e o preço total
  const handleServicoChange = (servico, isChecked) => {
    if (isChecked) {
      // Adicionar o serviço à lista de selecionados
      setServicosSelecionados(prev => [...prev, servico]);
    } else {
      // Remover o serviço da lista de selecionados
      setServicosSelecionados(prev => prev.filter(s => s.id !== servico.id));
    }
  };

  // Calcular o preço total sempre que a lista de serviços selecionados mudar
  useEffect(() => {
    const total = servicosSelecionados.reduce((sum, servico) => sum + servico.preco_base, 0);
    setPrecoTotal(total);
  }, [servicosSelecionados]);

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-light">Carregando serviços...</p>
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

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Coluna de serviços disponíveis */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Serviços Disponíveis</h2>
        
        {servicos.length === 0 ? (
          <div className="p-6 bg-light rounded-lg border border-neutral/20 text-center">
            <p className="text-neutral-light">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {servicos.map(servico => (
              <div key={servico.id} className="p-4 bg-light rounded-lg border border-neutral/20">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`servico-${servico.id}`}
                    onChange={(e) => handleServicoChange(servico, e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`servico-${servico.id}`}
                      className="block font-medium text-primary mb-1 cursor-pointer"
                    >
                      {servico.nome}
                    </label>
                    <p className="text-sm text-neutral mb-2">{servico.descricao}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-neutral-light">
                        <span className="mr-2">Duração média:</span>
                        <span>{servico.duracao_media} horas</span>
                      </p>
                      <p className="font-bold text-primary">
                        R$ {servico.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-neutral-light mt-2 text-right">
          Atualizado em: {dataAtualizacao}
        </p>
      </div>
      
      {/* Coluna de resumo */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Resumo</h2>
        
        <div className="bg-primary/10 rounded-lg p-6 border border-primary/30">
          <h3 className="font-medium text-primary mb-4">Serviços Selecionados</h3>
          
          {servicosSelecionados.length === 0 ? (
            <p className="text-neutral-light">Nenhum serviço selecionado</p>
          ) : (
            <ul className="space-y-3 mb-6">
              {servicosSelecionados.map(servico => (
                <li key={servico.id} className="flex justify-between">
                  <span className="text-neutral">{servico.nome}</span>
                  <span className="font-medium text-primary">
                    R$ {servico.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          
          <div className="border-t border-primary/30 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-primary">Total:</span>
              <span className="font-bold text-xl text-primary">
                R$ {precoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-neutral-light mb-2">
            Este simulador fornece uma estimativa inicial baseada em nossos preços padrão.
            Para um orçamento personalizado detalhado, entre em contato conosco.
          </p>
          
          <a
            href="/contato"
            className="block w-full bg-accent hover:bg-accent-light text-light text-center font-medium py-3 px-6 rounded-md transition-colors"
          >
            Solicitar Orçamento Personalizado
          </a>
        </div>
      </div>
    </div>
  );
};

export default PriceSimulator;
