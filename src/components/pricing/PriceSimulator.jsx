import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Componente Simulador de Preços
 * Permite ao usuário selecionar serviços e visualizar o preço total em tempo real
 * 
 * Versão 1.3.2 - Otimização de endpoints e melhor tratamento de erros
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
  const [erro, setError] = useState(null);
  // Estado para controlar a origem dos dados (api ou demonstração)
  const [dadosDemonstracao, setDadosDemonstracao] = useState(false);
  // Estado para armazenar logs de debug
  const [debugLogs, setDebugLogs] = useState([]);
  // Estado para mostrar/esconder painel de debug
  const [mostrarDebug, setMostrarDebug] = useState(false);
  // Estado para armazenar informações detalhadas de requisições
  const [requisicoes, setRequisicoes] = useState([]);
  // Referência para controlar se o componente foi montado
  const mounted = useRef(false);
  // Referência para controlar o número de tentativas de API
  const tentativasAPI = useRef(0);

  // Mock de serviços para demonstração (utilizado apenas como fallback)
  const servicosMock = [
    {
      id: 1,
      nome: "Fotografia de Eventos",
      descricao: "Cobertura fotográfica profissional para eventos empresariais, festas e cerimônias.",
      preco_base: 1500.00,
      duracao_media: 4
    },
    {
      id: 2,
      nome: "Ensaio Fotográfico",
      descricao: "Sessão fotográfica em estúdio ou externa, com entrega de 20 fotos editadas.",
      preco_base: 800.00,
      duracao_media: 2
    },
    {
      id: 3,
      nome: "Vídeo Institucional",
      descricao: "Produção completa de vídeo promocional para sua empresa, incluindo edição e trilha sonora.",
      preco_base: 3500.00,
      duracao_media: 8
    }
  ];

  // Função para adicionar log de debug
  const addDebugLog = useCallback((mensagem, tipo = 'info') => {
    const timestamp = new Date().toISOString();
    const log = { timestamp, mensagem, tipo };
    
    console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
    setDebugLogs(logs => [...logs, log]);
  }, []);

  // Função para adicionar informações de requisição
  const addRequisicao = useCallback((info) => {
    setRequisicoes(reqs => [...reqs, {
      ...info,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  // Determina se estamos em ambiente de desenvolvimento
  const isDev = useCallback(() => {
    const dev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.port.startsWith('3') ||
                window.location.port.startsWith('4') ||
                window.location.port.startsWith('5') ||
                window.location.port.startsWith('8');
    
    addDebugLog(`Ambiente detectado: ${dev ? 'desenvolvimento' : 'produção'}`);
    return dev;
  }, [addDebugLog]);

  // Função para obter informações do ambiente atual
  const getEnvironmentInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      pathname: window.location.pathname,
      isDev: isDev()
    };
  }, [isDev]);

  // Função para tentar carregar dados da API com diferentes URLs
  const tentarAPI = useCallback(async (urlAPI, tentativa) => {
    addDebugLog(`Tentativa #${tentativa}: Carregando da API: ${urlAPI}`);
    
    // Informações do ambiente para diagnóstico
    const env = getEnvironmentInfo();
    
    // Configuração para timeout de 5 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      addDebugLog(`Timeout na requisição para ${urlAPI}`, 'erro');
    }, 5000);
    
    const infoRequisicao = {
      url: urlAPI,
      tentativa,
      ambiente: env.isDev ? 'dev' : 'prod',
      startTime: new Date().toISOString(),
      status: 'pendente'
    };
    
    addRequisicao(infoRequisicao);
    
    try {
      // Configurações avançadas para diagnosticar problemas de CORS
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal,
        mode: urlAPI.includes('://') ? 'cors' : undefined,
        credentials: urlAPI.includes('://') ? 'omit' : 'same-origin',
        cache: 'no-store'
      };
      
      addDebugLog(`Enviando requisição com opções: ${JSON.stringify(fetchOptions)}`, 'debug');
      
      const startTime = Date.now();
      const response = await fetch(urlAPI, fetchOptions);
      const endTime = Date.now();
      
      clearTimeout(timeoutId);
      
      // Atualiza informações da requisição
      addRequisicao({
        ...infoRequisicao,
        status: response.status,
        statusText: response.statusText,
        duracaoMs: endTime - startTime,
        endTime: new Date().toISOString(),
        headers: Object.fromEntries([...response.headers])
      });
      
      if (!response.ok) {
        addDebugLog(`Erro HTTP ${response.status}: ${response.statusText}`, 'erro');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      // Log de cabeçalhos da resposta para debug
      const headerInfo = {};
      response.headers.forEach((valor, chave) => {
        headerInfo[chave] = valor;
      });
      addDebugLog(`Cabeçalhos da resposta: ${JSON.stringify(headerInfo)}`, 'debug');
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        addDebugLog('API retornou resposta vazia', 'erro');
        throw new Error('API retornou uma resposta vazia');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Log dos primeiros 200 caracteres para diagnóstico
        addDebugLog(`Erro ao processar JSON. Resposta: ${responseText.substring(0, 200)}...`, 'erro');
        throw new Error(`Formato de resposta inválido: ${e.message}`);
      }
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Validar dados recebidos
          const servicosValidos = data.filter(servico => 
            servico && 
            servico.id && 
            servico.nome && 
            typeof servico.preco_base === 'number'
          );
          
          addDebugLog(`API retornou ${servicosValidos.length} de ${data.length} serviços válidos`);
          
          if (servicosValidos.length > 0) {
            return servicosValidos;
          } else {
            addDebugLog('API retornou dados sem serviços válidos', 'erro');
            throw new Error('API retornou dados sem serviços válidos');
          }
        } else {
          addDebugLog('API retornou array vazio', 'aviso');
          throw new Error('API retornou dados vazios (array vazio)');
        }
      } else {
        addDebugLog(`Resposta não é um array: ${typeof data}`, 'erro');
        throw new Error(`Formato de resposta inválido: esperava array, recebeu ${typeof data}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Atualiza informações da requisição em caso de erro
      addRequisicao({
        ...infoRequisicao,
        status: 'erro',
        mensagemErro: error.message,
        endTime: new Date().toISOString()
      });
      
      // Tratamento especial para erros de CORS
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        addDebugLog(`Possível erro de CORS ao acessar ${urlAPI}`, 'erro');
      } else if (error.name === 'AbortError') {
        addDebugLog(`Requisição para ${urlAPI} abortada por timeout`, 'erro');
      } else {
        addDebugLog(`Erro ao acessar ${urlAPI}: ${error.message}`, 'erro');
      }
      
      throw error;
    }
  }, [addDebugLog, addRequisicao, getEnvironmentInfo]);

  // Função principal para obter serviços
  const obterServicos = useCallback(async (reset = false) => {
    // Reset da tentativa se solicitado (para tentar novamente)
    if (reset) {
      tentativasAPI.current = 0;
      setDadosDemonstracao(false);
      setDebugLogs([]);
      setRequisicoes([]);
      addDebugLog('Reiniciando processo de carregamento');
    }
    
    // Prevenção contra múltiplas chamadas durante carregamento
    if (loading && tentativasAPI.current > 0) {
      addDebugLog('Ignorando chamada duplicada durante carregamento', 'aviso');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Define as URLs a serem tentadas em sequência
    const urlsParaTentar = [];
    
    if (isDev()) {
      // Em desenvolvimento, tenta primeiro local, depois proxy
      urlsParaTentar.push('http://localhost:3000/api/pricing');
      urlsParaTentar.push('/api/pricing');
    } else {
      // Em produção, simplificado para usar apenas endpoints que funcionam
      // Prioriza o endpoint relativo que funciona quando frontend e backend estão no mesmo domínio
      urlsParaTentar.push('/api/pricing'); 
      
      // Tenta Render como segunda opção - mas com retry reduzido pois sabemos que pode estar offline
      if (window.location.hostname !== 'lytspot.onrender.com') {
        urlsParaTentar.push('https://lytspot.onrender.com/api/pricing');
      }
    }
    
    tentativasAPI.current += 1;
    addDebugLog(`Iniciando tentativa #${tentativasAPI.current} de carregar serviços`);
    
    try {
      // Informações do ambiente no início da tentativa
      const env = getEnvironmentInfo();
      addDebugLog(`Informações do ambiente: ${JSON.stringify(env)}`, 'debug');
      
      // Tenta cada URL em sequência até que uma funcione
      let dadosCarregados = null;
      let erroFinal = null;
      let mensagensErros = [];
      
      for (let i = 0; i < urlsParaTentar.length; i++) {
        const url = urlsParaTentar[i];
        try {
          dadosCarregados = await tentarAPI(url, i + 1);
          if (dadosCarregados) {
            addDebugLog(`Sucesso ao carregar dados de ${url}`);
            break;
          }
        } catch (e) {
          erroFinal = e;
          // Coleta mensagens de erro específicas para diferentes URLs
          mensagensErros.push(`${url}: ${e.message}`);
          addDebugLog(`Falha na URL ${url}: ${e.message}`, 'erro');
          // Continue para a próxima URL
        }
      }
      
      if (dadosCarregados) {
        // Sucesso! Defina os serviços e marque como dados reais
        setServicos(dadosCarregados);
        setDadosDemonstracao(false);
        setLoading(false);
        addDebugLog('Carregamento de serviços concluído com sucesso');
        return;
      }
      
      // Se chegamos aqui, todas as URLs falharam
      if (tentativasAPI.current === 1) {
        // Mensagem de erro mais específica com base nos problemas encontrados
        const statusRender = mensagensErros.some(msg => msg.includes('503')) 
          ? 'O servidor Render parece estar offline (erro 503)' 
          : '';
        
        const mensagemFinal = statusRender 
          ? `Servidores indisponíveis neste momento. ${statusRender}. Tente novamente mais tarde ou use dados de demonstração.` 
          : `Não foi possível carregar dados de nenhuma API. Verifique sua conexão ou tente novamente mais tarde.`;
        
        addDebugLog('Todas as URLs falharam na primeira tentativa', 'erro');
        throw new Error(mensagemFinal);
      } else {
        // Na segunda tentativa ou posterior, use dados de demonstração
        addDebugLog('Usando dados de demonstração após todas as tentativas falharem', 'aviso');
        setServicos(servicosMock);
        setDadosDemonstracao(true);
        setLoading(false);
      }
    } catch (error) {
      addDebugLog(`Erro geral: ${error.message}`, 'erro');
      
      // Primeira tentativa falhou, mostre erro com opção de tentar novamente
      if (tentativasAPI.current === 1) {
        setError(`Falha ao carregar serviços: ${error.message}`);
        setLoading(false);
      } else {
        // Segunda tentativa ou posterior, use dados de demonstração como fallback
        addDebugLog('Usando dados de demonstração após falha', 'aviso');
        setServicos(servicosMock);
        setDadosDemonstracao(true);
        setLoading(false);
      }
    }
  }, [isDev, tentarAPI, addDebugLog, getEnvironmentInfo]);

  // Inicialização - executa apenas uma vez na montagem do componente
  useEffect(() => {
    // Marca o componente como montado
    mounted.current = true;
    addDebugLog('Componente PriceSimulator inicializado');
    
    // Executa a primeira requisição
    obterServicos();
    
    // Limpeza ao desmontar
    return () => {
      mounted.current = false;
      addDebugLog('Componente PriceSimulator desmontado');
    };
  }, [obterServicos, addDebugLog]);

  // Atualizar a lista de serviços selecionados
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

  // Renderizar o painel de debug (visível quando mostrarDebug for true)
  const renderDebugPanel = () => {
    if (!mostrarDebug) return null;

    return (
      <div className="mt-8 p-4 bg-neutral-dark/10 rounded-lg border border-neutral/30 text-xs">
        <h3 className="font-bold text-neutral mb-2">Painel de Diagnóstico</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Ambiente:</h4>
          <pre className="bg-neutral-dark/20 p-2 rounded overflow-auto text-xs">
            {JSON.stringify(getEnvironmentInfo(), null, 2)}
          </pre>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Requisições:</h4>
          <div className="max-h-40 overflow-y-auto">
            {requisicoes.length === 0 ? (
              <p>Nenhuma requisição registrada</p>
            ) : (
              requisicoes.map((req, index) => (
                <div key={index} className="mb-2 p-2 bg-neutral-dark/20 rounded">
                  <div><b>URL:</b> {req.url}</div>
                  <div><b>Status:</b> {req.status}</div>
                  <div><b>Tempo:</b> {req.duracaoMs ? `${req.duracaoMs}ms` : 'N/A'}</div>
                  {req.mensagemErro && <div><b>Erro:</b> {req.mensagemErro}</div>}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-1">Logs:</h4>
          <div className="max-h-40 overflow-y-auto bg-neutral-dark/20 p-2 rounded">
            {debugLogs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 pb-1 border-b border-neutral/10 ${
                  log.tipo === 'erro' ? 'text-red-500' : 
                  log.tipo === 'aviso' ? 'text-yellow-500' : 
                  log.tipo === 'debug' ? 'text-blue-400' : 'text-neutral-light'
                }`}
              >
                <span className="opacity-60">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.mensagem}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-light">Carregando serviços...</p>
      </div>
    );
  }

  // Renderiza mensagem de erro com opção de tentar novamente
  if (erro) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-300">{erro}</p>
        <div className="flex flex-wrap justify-center mt-4 gap-2">
          <button
            onClick={() => obterServicos(true)}
            className="bg-primary text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-primary-light"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => {
              setServicos(servicosMock);
              setDadosDemonstracao(true);
              setError(null);
            }}
            className="bg-neutral text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-neutral-light"
          >
            Ver Demonstração
          </button>
          <button
            onClick={() => setMostrarDebug(!mostrarDebug)}
            className="bg-neutral-dark text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-neutral"
          >
            {mostrarDebug ? 'Ocultar Diagnóstico' : 'Mostrar Diagnóstico'}
          </button>
        </div>
        
        {renderDebugPanel()}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Coluna de serviços disponíveis */}
        <div>
          <h2 className="text-xl font-serif font-bold text-primary mb-4">Serviços Disponíveis</h2>
          
          {servicos.length === 0 ? (
            <div className="p-6 bg-light rounded-lg border border-neutral/20 text-center">
              <p className="text-neutral-light">Nenhum serviço disponível no momento.</p>
              <button
                onClick={() => obterServicos(true)}
                className="mt-4 text-sm text-primary underline"
              >
                Tentar Novamente
              </button>
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
                          <span>{servico.duracao_media || servico.duracao_media_captura || '2'} horas</span>
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
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-neutral-light">
              {dadosDemonstracao ? 'Dados de demonstração' : `Atualizado em: ${new Date().toLocaleDateString('pt-BR')}`}
            </p>
            <div className="flex gap-2">
              {dadosDemonstracao && (
                <button
                  onClick={() => obterServicos(true)}
                  className="text-xs text-primary underline"
                >
                  Tentar Carregar da API
                </button>
              )}
              <button
                onClick={() => setMostrarDebug(!mostrarDebug)}
                className="text-xs text-neutral hover:text-primary"
              >
                {mostrarDebug ? 'Ocultar Diagnóstico' : 'Diagnóstico'}
              </button>
            </div>
          </div>
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
      
      {renderDebugPanel()}
    </div>
  );
};

export default PriceSimulator;
