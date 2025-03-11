import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { servicos as servicosDados } from '../../data/servicos.js';

/**
 * Componente Simulador de Preços - Versão estável 
 * @version 2.8.0
 */
const PriceSimulator = memo(() => {
  // Estados principais do componente
  const [servicos, setServicos] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [precoTotal, setPrecoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setError] = useState(null);
  const [dadosDemonstracao, setDadosDemonstracao] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [mostrarDebug, setMostrarDebug] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(2000); // 2 segundos de delay entre tentativas
  
  // Referências
  const mounted = useRef(false);
  const testMode = useRef(false); // Para testes automatizados
  const testRunning = useRef(false); // Previne loops infinitos durante testes
  const timeoutRef = useRef(null); // Armazena referência ao timeout para limpeza adequada
  const initAttempts = useRef(0);

  // Data da última atualização dos preços
  const lastUpdated = new Date('2025-03-01');
  const lastUpdatedText = `Última atualização: ${lastUpdated.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`;

  // Efeito para detectar cliente - executado apenas uma vez
  useEffect(() => {
    setIsBrowser(true);
    mounted.current = true;
    
    // Função de limpeza
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      mounted.current = false;
    };
  }, []);

  // Função para logging
  const log = useCallback((mensagem, tipo = 'info') => {
    if (!isBrowser) return;
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    if (typeof console !== 'undefined') {
      if (tipo === 'erro') console.error(`[${tipo}] ${mensagem}`);
      else if (tipo === 'aviso') console.warn(`[${tipo}] ${mensagem}`);
      else console.log(`[${tipo}] ${mensagem}`);
    }
    
    setDebugLogs(prevLogs => [...prevLogs, { timestamp, mensagem, tipo }]);
    
    if (tipo === 'erro' && !mostrarDebug) {
      setTimeout(() => setMostrarDebug(true), 0);
    }
    
    // Exponha logs para testes automatizados
    if (typeof window !== 'undefined') {
      if (!window._debugLogs) window._debugLogs = [];
      window._debugLogs.push({ timestamp, mensagem, tipo });
    }
  }, [isBrowser, mostrarDebug]);

  // Detecta ambiente
  const getEnvironment = useCallback(() => {
    // Verificação segura para SSR
    if (!isBrowser) {
      return { 
        type: 'server', 
        isDev: true,
        baseUrl: '/api'
      };
    }
    
    // Detecta ambiente de desenvolvimento tanto pelo localhost quanto por IPs locais
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.startsWith('192.168.') ||
                        window.location.hostname.startsWith('10.');
    
    // A base URL agora sempre usa a origem atual da janela
    return {
      type: 'browser',
      isDev: isLocalhost,
      baseUrl: window.location.origin,
      hostname: window.location.hostname,
      href: window.location.href
    };
  }, [isBrowser]);

  // Carrega serviços da API
  const carregarServicos = useCallback(async (forceReload = false) => {
    // Impede requisições durante SSR ou se o componente não estiver montado
    if (!isBrowser || !mounted.current) {
      return;
    }
    
    // Evita múltiplas solicitações
    if (loading && !forceReload) return;
    
    setLoading(true);
    setError(null);
    
    if (forceReload) {
      log('Forçando recarregamento de serviços');
    }
    
    const env = getEnvironment();
    log(`Ambiente: ${JSON.stringify(env)}`);
    
    // Determina URL a ser usada - sempre usa a URL relativa ao domínio atual
    const apiUrl = `${env.baseUrl}/api/pricing`;
    log(`Tentando carregar dados de: ${apiUrl}`);
    
    try {
      // Timeout para evitar requisições infinitas - aumentado para 15 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      // Teste automatizado - registra resposta
      if (typeof window !== 'undefined' && mounted.current) {
        window._apiResponse = {
          url: apiUrl,
          status: response.status,
          ok: response.ok
        };
      }
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!mounted.current) return; // Evita atualização de estado se componente já foi desmontado
      
      if (Array.isArray(data) && data.length > 0) {
        log(`Dados carregados com sucesso: ${data.length} serviços`);
        setServicos(data);
        setDadosDemonstracao(false);
        setLoading(false);
        setRetryCount(0); // Reseta o contador de tentativas
        
        // Teste automatizado
        if (typeof window !== 'undefined') {
          window._testResults = {
            success: true,
            servicesCount: data.length,
            source: 'api'
          };
        }
      } else {
        throw new Error('API retornou dados inválidos');
      }
    } catch (error) {
      if (!mounted.current) return; // Evita atualização de estado se componente já foi desmontado
      
      log(`Erro ao carregar serviços: ${error.message}`, 'erro');
      
      // Se estiver em retry automático, não carregue os dados de demonstração ainda
      if (retryCount < maxRetries) {
        return; // Não faz nada, deixa o efeito de retry lidar com isso
      }
      
      // Usa dados importados de demonstração como fallback
      log('Usando dados de demonstração', 'aviso');
      setServicos(servicosDados);
      setDadosDemonstracao(true);
      setLoading(false);
      setRetryCount(0); // Reseta o contador de tentativas
      
      // Mostra erro apenas na primeira carga
      if (mounted.current) {
        setError(`Não foi possível carregar os serviços: ${error.message}`);
      }
      
      // Teste automatizado
      if (typeof window !== 'undefined') {
        window._testResults = {
          success: false,
          error: error.message,
          source: 'mock'
        };
      }
    }
  }, [loading, log, getEnvironment, isBrowser, retryCount, maxRetries]);

  // Efeito para iniciar timer de fallback para dados de demonstração quando estiver carregando
  useEffect(() => {
    if (!isBrowser || !mounted.current) return;
    
    if (loading && !dadosDemonstracao && servicos.length === 0) {
      // Configura timeout para usar dados de demonstração
      // Aumentamos o timeout para dar mais tempo para API responder
      timeoutRef.current = setTimeout(() => {
        if (mounted.current && loading) {
          // Verifica se deve tentar novamente antes de recorrer aos dados de demonstração
          if (retryCount < maxRetries) {
            log(`Tentativa ${retryCount + 1}/${maxRetries} de carregar serviços`, 'info');
            setRetryCount(prev => prev + 1);
            carregarServicos(true);
          } else {
            log('Número máximo de tentativas atingido, carregando dados de demonstração', 'aviso');
            setServicos(servicosDados);
            setDadosDemonstracao(true);
            setLoading(false);
            setRetryCount(0); // Reseta o contador de tentativas
          }
        }
      }, retryCount === 0 ? 8000 : retryDelay); // Primeira tentativa com 8s, retentativas com 2s
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [loading, dadosDemonstracao, servicos.length, log, isBrowser, retryCount, maxRetries, retryDelay, carregarServicos]);

  // Atualiza preço total quando serviços selecionados mudam
  useEffect(() => {
    if (!isBrowser || !mounted.current) return;
    
    if (!servicosSelecionados || servicosSelecionados.length === 0) {
      setPrecoTotal(0);
      return;
    }
    
    // Calcula o preço total
    const total = servicosSelecionados.reduce((soma, id) => {
      const servico = servicos.find(s => s.id === id);
      return soma + (servico ? servico.preco_base : 0);
    }, 0);
    
    setPrecoTotal(total);
  }, [servicosSelecionados, servicos, isBrowser]);

  // Inicialização e carregamento de dados - executado apenas uma vez
  useEffect(() => {
    if (!isBrowser || isInitialized || initAttempts.current > 0) return;
    
    initAttempts.current += 1;
    log('Componente inicializado');
    
    // Carrega serviços na inicialização com uma leve demora para garantir
    // que componente esteja totalmente montado
    const timeoutId = setTimeout(() => {
      if (mounted.current) {
        carregarServicos();
        setIsInitialized(true);
      }
    }, 100);
    
    // Função de limpeza
    return () => {
      clearTimeout(timeoutId);
      log('Componente desmontado');
    };
  }, [carregarServicos, log, isBrowser, isInitialized]);

  // Seleciona ou desseleciona um serviço
  const toggleServico = useCallback((id) => {
    if (!isBrowser || !mounted.current) return;
    
    setServicosSelecionados(prev => {
      const novosSelecionados = [...prev];
      
      // Se já existe, remove
      const index = novosSelecionados.indexOf(id);
      if (index > -1) {
        novosSelecionados.splice(index, 1);
        return novosSelecionados;
      }
      
      // Se não existe, adiciona
      novosSelecionados.push(id);
      return novosSelecionados;
    });
  }, [isBrowser]);

  // Testa a conexão com a API e o carregamento de dados
  const testarAPI = useCallback(async () => {
    if (!isBrowser || !mounted.current) return;
    
    // Evita loops infinitos de teste
    if (testRunning.current) {
      log('Teste já em execução, aguarde...', 'aviso');
      return;
    }
    
    log('Iniciando teste automatizado');
    testRunning.current = true;
    testMode.current = true;
    
    try {
      // Limpa resultados anteriores
      if (typeof window !== 'undefined') {
        window._apiResponse = null;
        window._testResults = null;
      }
      
      // Reseta contagem de tentativas para o teste
      setRetryCount(0);
      
      // Força recarregamento de serviços
      await carregarServicos(true);
      
      // Verifica resultados
      if (typeof window !== 'undefined' && window._testResults) {
        if (window._testResults.success) {
          log(`Teste concluído com sucesso! Origem dados: ${window._testResults.source}`, 'info');
        } else {
          log(`Teste concluído com falha: ${window._testResults.error}`, 'erro');
        }
      } else {
        log('Teste inconclusivo: não foi possível determinar resultado', 'aviso');
      }
    } catch (error) {
      log(`Erro durante teste: ${error.message}`, 'erro');
    } finally {
      // Encerra o modo de teste
      testRunning.current = false;
      // O modo de teste continua true para que os resultados possam ser vistos
      setTimeout(() => {
        testMode.current = false;
      }, 3000);
    }
  }, [carregarServicos, log, isBrowser]);

  // Inicializa a função de teste global para acesso via console
  useEffect(() => {
    if (!isBrowser || !mounted.current) return;
    
    window.runPriceSimulatorTest = testarAPI;
    
    return () => {
      delete window.runPriceSimulatorTest;
    };
  }, [testarAPI, isBrowser]);

  // Carrega dados de demonstração imediatamente
  const usarDadosDemonstracao = useCallback(() => {
    if (!isBrowser || !mounted.current) return;
    
    setServicos(servicosDados);
    setDadosDemonstracao(true);
    setError(null);
    setLoading(false);
    setRetryCount(0); // Reseta o contador de tentativas
    log('Usando dados de demonstração (manual)', 'info');
  }, [log, isBrowser]);

  // Função para lidar com o clique no botão de solicitar orçamento
  const handleSolicitarOrcamento = useCallback(() => {
    // Preparar os dados do orçamento
    const servicosSelecionadosDetalhes = servicosSelecionados.map(id => {
      const servico = servicos.find(s => s.id === id);
      return {
        id: servico.id,
        nome: servico.nome,
        preco: servico.preco_base
      };
    });

    // Criar dados para o envio
    const dadosOrcamento = {
      servicos: servicosSelecionadosDetalhes,
      total: precoTotal,
      data: new Date().toISOString()
    };

    // Salvar os dados no localStorage para persistência
    if (isBrowser) {
      try {
        localStorage.setItem('orcamento_atual', JSON.stringify(dadosOrcamento));
        
        // Redirecionar para a página de contato
        window.location.href = '/contato?orcamento=true';
      } catch (error) {
        console.error('Erro ao salvar dados do orçamento:', error);
        // Fallback: apenas redirecionar
        window.location.href = '/contato';
      }
    }
  }, [servicosSelecionados, servicos, precoTotal, isBrowser]);

  // Formata valores monetários
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Renderiza uma estrutura idêntica tanto no servidor quanto no cliente
  return (
    <div className="price-simulator rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
      {(!isBrowser || (loading && servicos.length === 0)) ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="animate-pulse mb-4">
            <svg className="w-12 h-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 text-lg font-medium mb-2">Carregando serviços...</p>
          
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mb-6">
              Tentativa {retryCount}/{maxRetries}
            </p>
          )}
          
          {isBrowser && (
            <button 
              onClick={() => setMostrarDebug(!mostrarDebug)}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition duration-200"
            >
              {mostrarDebug ? 'Ocultar Diagnóstico' : 'Mostrar Diagnóstico'}
            </button>
          )}
          
          {isBrowser && mostrarDebug && (
            <div className="debug-panel mt-6 w-full max-w-lg p-4 bg-gray-100 rounded-lg border border-gray-300 text-left">
              <h3 className="text-blue-700 font-medium text-lg mb-3">Diagnóstico</h3>
              <div className="mb-4">
                <h4 className="text-gray-800 font-medium mb-2">Ambiente:</h4>
                <pre className="bg-white p-2 rounded text-xs text-gray-700 overflow-auto max-h-[150px] border border-gray-300">
                  {JSON.stringify(getEnvironment(), null, 2)}
                </pre>
              </div>
              <div className="mb-4">
                <h4 className="text-gray-800 font-medium mb-2">Logs:</h4>
                <div className="bg-white p-2 rounded overflow-auto max-h-[200px] text-xs border border-gray-300">
                  {debugLogs.map((log, index) => (
                    <div key={index} className={`py-1 ${
                      log.tipo === 'erro' ? 'text-red-600' : 
                      log.tipo === 'aviso' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      [{log.timestamp}] {log.mensagem}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => carregarServicos(true)}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-200"
                >
                  Recarregar Dados
                </button>
                <button 
                  onClick={usarDadosDemonstracao}
                  className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition duration-200"
                >
                  Usar Demo
                </button>
                <button 
                  onClick={testarAPI} 
                  disabled={testRunning.current}
                  className={`px-3 py-1 text-xs ${
                    testRunning.current ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white font-medium rounded transition duration-200`}
                >
                  Executar Teste
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          {/* Aviso de dados de demonstração */}
          {dadosDemonstracao && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm">Usando dados de demonstração. Os preços podem variar.</p>
              </div>
              <button 
                onClick={() => carregarServicos(true)}
                className="ml-2 text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-800 transition duration-200"
              >
                Tentar recarregar
              </button>
            </div>
          )}

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {erro}
              </p>
            </div>
          )}

          {/* Layout de duas colunas */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna da esquerda: Lista de serviços */}
            <div className="w-full md:w-2/3">
              <h2 className="text-gray-800 text-xl font-medium mb-6">Serviços Disponíveis</h2>
              <div className="divide-y divide-gray-200">
                {servicos.map(servico => (
                  <div key={servico.id} className="py-4 hover:bg-gray-50 transition-all duration-200">
                    <label className="flex items-start cursor-pointer gap-3">
                      <div className="relative pt-1 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={servicosSelecionados.includes(servico.id)}
                          onChange={() => toggleServico(servico.id)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium">{servico.nome}</span>
                        <p className="text-sm text-gray-500 mt-1">{servico.descricao}</p>
                        
                        {servico.detalhes && (
                          <div className="mt-2 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            <div>
                              <span className="font-medium">Duração:</span> {servico.detalhes.captura}
                            </div>
                            <div>
                              <span className="font-medium">Entrega:</span> {servico.detalhes.tratamento}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-blue-600 font-medium text-lg whitespace-nowrap">
                          {formatMoney(servico.preco_base)}
                        </span>
                        <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                          Duração média: {servico.duracao_media}h
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Dados de demonstração {dadosDemonstracao ? "ativos" : "não ativos"}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                {lastUpdatedText}
              </p>
            </div>

            {/* Coluna da direita: Resumo e Total */}
            <div className="w-full md:w-1/3">
              <div className="bg-gray-100 rounded-lg p-5 sticky top-24">
                <h2 className="text-gray-800 text-xl font-medium mb-6">Resumo</h2>
                
                <div className="mb-6">
                  <h3 className="text-gray-700 font-medium mb-3">Serviços Selecionados</h3>
                  {servicosSelecionados.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Nenhum serviço selecionado</p>
                  ) : (
                    <div className="space-y-2">
                      {servicosSelecionados.map(id => {
                        const servico = servicos.find(s => s.id === id);
                        return servico ? (
                          <div key={id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{servico.nome}</span>
                            <span className="text-gray-700 font-medium">{formatMoney(servico.preco_base)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-800 font-medium">Total:</h3>
                    <span className="text-blue-600 text-2xl font-bold">
                      {formatMoney(precoTotal)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Este simulador fornece uma estimativa inicial baseada em nossos preços padrão. Para um orçamento personalizado detalhado, entre em contato conosco.</p>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleSolicitarOrcamento}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition duration-200 font-medium"
                  >
                    Solicitar Orçamento Personalizado
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de diagnóstico */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setMostrarDebug(!mostrarDebug)}
              className="text-xs text-gray-500 hover:text-blue-600 underline transition duration-200"
            >
              {mostrarDebug ? 'Ocultar Diagnóstico' : 'Mostrar Diagnóstico'}
            </button>
            
            {mostrarDebug && (
              <div className="mt-4 w-full p-4 bg-gray-100 rounded-lg border border-gray-300 text-left">
                <h3 className="text-blue-700 font-medium text-lg mb-3">Diagnóstico</h3>
                <div className="mb-4">
                  <h4 className="text-gray-800 font-medium mb-2">Ambiente:</h4>
                  <pre className="bg-white p-2 rounded text-xs text-gray-700 overflow-auto max-h-[150px] border border-gray-300">
                    {JSON.stringify(getEnvironment(), null, 2)}
                  </pre>
                </div>
                <div className="mb-4">
                  <h4 className="text-gray-800 font-medium mb-2">Logs:</h4>
                  <div className="bg-white p-2 rounded overflow-auto max-h-[200px] text-xs border border-gray-300">
                    {debugLogs.map((log, index) => (
                      <div key={index} className={`py-1 ${
                        log.tipo === 'erro' ? 'text-red-600' : 
                        log.tipo === 'aviso' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        [{log.timestamp}] {log.mensagem}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => carregarServicos(true)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-200"
                  >
                    Recarregar Dados
                  </button>
                  <button 
                    onClick={usarDadosDemonstracao}
                    className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition duration-200"
                  >
                    Usar Demo
                  </button>
                  <button 
                    onClick={testarAPI} 
                    disabled={testRunning.current}
                    className={`px-3 py-1 text-xs ${
                      testRunning.current ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white font-medium rounded transition duration-200`}
                  >
                    Executar Teste
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default PriceSimulator;
