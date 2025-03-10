import React, { useState, useEffect, useCallback } from 'react';

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
  const [erro, setError] = useState(null);
  // Estado para controlar o processo de debug
  const [debugInfo, setDebugInfo] = useState('');
  // Estado para controlar qual estratégia de API usar
  const [apiStrategy, setApiStrategy] = useState('proxy');
  // Estado para armazenar a resposta bruta da API (para diagnóstico)
  const [apiResponse, setApiResponse] = useState(null);

  // Mock de serviços para diagnóstico
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

  // Função para fazer logs
  const logInfo = (msg) => {
    console.log(msg);
    setDebugInfo(prev => prev + msg + '\n');
  };

  // Determina se estamos em ambiente de desenvolvimento
  const isDev = useCallback(() => {
    // Verificação mais precisa de ambiente de desenvolvimento
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port.startsWith('3') ||
           window.location.port.startsWith('4') ||
           window.location.port.startsWith('5') ||
           window.location.port.startsWith('8');
  }, []);

  // Função para obter serviços da API
  const obterServicos = useCallback(async (estrategia = 'proxy', forcarMock = false) => {
    setApiStrategy(estrategia);
    setLoading(true);
    setError(null);
    setDebugInfo([]);  // Limpa logs anteriores
    
    // Se forçar modo mock, usa dados mockados imediatamente
    if (forcarMock || estrategia === 'servico-mock' || estrategia === 'diagnostic-mode' || estrategia === 'development-mock') {
      logInfo(`[${new Date().toISOString()}] Usando dados mockados para demonstração`);
      setServicos(servicosMock);
      setLoading(false);
      return;
    }
    
    // Determinar URL baseada na estratégia e ambiente
    let apiUrl;
    const dev = isDev();
    
    // SOLUÇÃO GARANTIDA: Determina a URL correta com base no ambiente
    if (estrategia === 'direct') {
      if (dev) {
        // Em desenvolvimento, conecta diretamente ao servidor local
        apiUrl = 'http://localhost:3000/api/pricing';
      } else {
        // Em produção, tenta a URL completa da API
        apiUrl = 'https://api.lytspot.com.br/api/pricing';
      }
      logInfo(`[${new Date().toISOString()}] Conexão direta: ${apiUrl} (${dev ? 'desenvolvimento' : 'produção'})`);
    } else {
      // Estratégia de proxy - usa caminho relativo
      apiUrl = '/api/pricing';
      logInfo(`[${new Date().toISOString()}] Usando estratégia de proxy: ${apiUrl}`);
    }

    // Configure um timeout para garantir que a interface não fique presa
    const timeoutId = setTimeout(() => {
      logInfo(`[${new Date().toISOString()}] TIMEOUT: A requisição demorou mais de 5 segundos`);
      setApiStrategy('timeout-fallback');
      setServicos(servicosMock);
      setLoading(false);
    }, 5000);

    try {
      logInfo(`[${new Date().toISOString()}] Iniciando requisição para ${apiUrl}`);

      // SOLUÇÃO GARANTIDA: Configurações otimizadas para cada ambiente
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Configurações específicas de CORS para garantir requisição bem-sucedida
        mode: estrategia === 'direct' ? 'cors' : undefined,
        credentials: estrategia === 'direct' ? 'omit' : 'same-origin',
        cache: 'no-store'
      };

      // Diagnóstico das opções de fetch
      logInfo(`[${new Date().toISOString()}] Opções: ${JSON.stringify({
        url: apiUrl,
        mode: fetchOptions.mode,
        credentials: fetchOptions.credentials,
        cache: fetchOptions.cache
      })}`);

      // SOLUÇÃO GARANTIDA: Tentativa de conexão com retry automatizado em caso de falha
      let response;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          response = await fetch(apiUrl, fetchOptions);
          break; // Sai do loop se a requisição for bem-sucedida
        } catch (fetchError) {
          retries++;
          logInfo(`[${new Date().toISOString()}] Tentativa ${retries}/${maxRetries} falhou: ${fetchError.message}`);
          
          if (retries <= maxRetries) {
            // Espera um curto período antes de tentar novamente (backoff exponencial)
            await new Promise(r => setTimeout(r, retries * 500));
            // Alterna entre proxy e conexão direta nas tentativas
            if (estrategia === 'proxy') {
              apiUrl = dev ? 'http://localhost:3000/api/pricing' : 'https://api.lytspot.com.br/api/pricing';
              fetchOptions.mode = 'cors';
              fetchOptions.credentials = 'omit';
            } else {
              apiUrl = '/api/pricing';
              fetchOptions.mode = undefined;
              fetchOptions.credentials = 'same-origin';
            }
            logInfo(`[${new Date().toISOString()}] Tentando novamente com: ${apiUrl}`);
          } else {
            throw fetchError; // Propaga o erro após todas as tentativas
          }
        }
      }

      // Verifica e processa a resposta
      logInfo(`[${new Date().toISOString()}] Resposta: status=${response.status}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // SOLUÇÃO GARANTIDA: Processamento robusto da resposta
      const responseText = await response.text();
      
      // Verifica se recebemos uma resposta válida antes de processar
      if (!responseText || responseText.trim() === '') {
        logInfo(`[${new Date().toISOString()}] Resposta vazia recebida`);
        throw new Error('A API retornou uma resposta vazia');
      }
      
      // Analisa a resposta como JSON
      let data;
      try {
        data = JSON.parse(responseText);
        setApiResponse(data);
      } catch (jsonError) {
        logInfo(`[${new Date().toISOString()}] Erro ao processar JSON: ${jsonError.message}`);
        logInfo(`[${new Date().toISOString()}] Texto recebido: ${responseText.substring(0, 100)}...`);
        throw new Error(`Erro ao processar resposta: ${jsonError.message}`);
      }

      // SOLUÇÃO GARANTIDA: Validação de dados completa
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Verifica se cada serviço tem os campos necessários
          const servicosValidos = data.filter(servico => 
            servico && 
            servico.id && 
            servico.nome && 
            typeof servico.preco_base === 'number'
          );
          
          logInfo(`[${new Date().toISOString()}] Serviços válidos: ${servicosValidos.length}/${data.length}`);
          
          if (servicosValidos.length > 0) {
            setServicos(servicosValidos);
          } else {
            // Se recebemos dados, mas nenhum válido, caímos para o fallback
            logInfo(`[${new Date().toISOString()}] Dados recebidos não têm serviços válidos, usando fallback`);
            setApiStrategy('fallback-mode');
            setServicos(servicosMock);
          }
        } else {
          // Se recebemos um array vazio, não há serviços no banco
          logInfo(`[${new Date().toISOString()}] API retornou array vazio (0 serviços)`);
          setServicos([]);
        }
      } else {
        // Se não recebemos um array, o formato está incorreto
        logInfo(`[${new Date().toISOString()}] Resposta não é um array: ${typeof data}`);
        throw new Error('Formato de resposta inválido');
      }

      clearTimeout(timeoutId);
      setLoading(false);
    } catch (error) {
      logInfo(`[${new Date().toISOString()}] Erro: ${error.message}`);
      setError(`Erro ao carregar serviços: ${error.message}`);
      
      // SOLUÇÃO GARANTIDA: Tentativa automática com estratégia alternativa
      if (estrategia === 'proxy') {
        logInfo(`[${new Date().toISOString()}] Tentando estratégia alternativa (conexão direta)...`);
        // Tenta a estratégia direta automaticamente
        setTimeout(() => {
          obterServicos('direct');
        }, 100);
      } else if (estrategia === 'direct') {
        logInfo(`[${new Date().toISOString()}] Todas as estratégias falharam, usando dados de demonstração`);
        // Se ambas as estratégias falharam, cai para o fallback
        setApiStrategy('fallback-mode');
        setServicos(servicosMock);
        setLoading(false);
      }
      
      clearTimeout(timeoutId);
    }
  }, [isDev, logInfo]);

  // Inicializar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Iniciar carregamento automático
      obterServicos('proxy');
    }
  }, []);

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

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-light">Carregando serviços...</p>
        <button 
          onClick={() => obterServicos('proxy')} 
          className="mt-4 text-sm text-neutral hover:text-primary underline"
        >
          Tentar novamente
        </button>
        {debugInfo && (
          <div className="mt-4 p-4 bg-neutral-dark/10 rounded text-xs text-left w-full max-h-60 overflow-y-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}
      </div>
    );
  }

  // Renderiza mensagem de erro com opção de retry manual
  if (erro) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-300">{erro}</p>
        <div className="flex flex-wrap justify-center mt-4 gap-2">
          <button
            onClick={() => obterServicos('proxy')}
            className="bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
          >
            Tentar via Proxy
          </button>
          <button
            onClick={() => obterServicos('direct')}
            className="bg-primary text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-primary-light"
          >
            Conectar Diretamente
          </button>
          <button
            onClick={() => obterServicos('servico-mock')}
            className="bg-neutral text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-neutral-light"
          >
            Usar Modo de Diagnóstico
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-neutral-dark/20 rounded text-xs text-left w-full max-h-60 overflow-y-auto">
          <h3 className="font-bold mb-2">Informações de diagnóstico:</h3>
          <pre className="text-neutral-light">{debugInfo}</pre>
        </div>
        
        {apiResponse && (
          <div className="mt-4 p-4 bg-neutral-dark/20 rounded text-xs text-left w-full max-h-60 overflow-y-auto">
            <h3 className="font-bold mb-2">Resposta API (para diagnóstico):</h3>
            <pre className="text-neutral-light">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
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
            <button
              onClick={() => obterServicos('servico-mock')}
              className="mt-4 text-sm text-primary underline"
            >
              Exibir demonstração
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
            {apiStrategy === 'servico-mock' || apiStrategy === 'diagnostic-mode' || apiStrategy === 'timeout-fallback' || apiStrategy === 'fallback-mode' || apiStrategy === 'development-mock' ? 
              'Modo de demonstração ativado' : 
              `Atualizado em: ${new Date().toLocaleDateString('pt-BR')}`
            }
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => obterServicos('proxy')}
              className="text-xs text-primary underline"
            >
              Atualizar
            </button>
            {(apiStrategy === 'servico-mock' || apiStrategy === 'diagnostic-mode' || 
              apiStrategy === 'timeout-fallback' || apiStrategy === 'fallback-mode' || 
              apiStrategy === 'development-mock') && (
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 rounded-md">
                Dados de demonstração
              </span>
            )}
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
  );
};

export default PriceSimulator;
