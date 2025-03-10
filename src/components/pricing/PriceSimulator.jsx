import React, { useState, useEffect } from 'react';

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
  // Estado para controlar o processo de debug
  const [debugInfo, setDebugInfo] = useState('');

  // Configuração da API baseada no ambiente
  const getApiConfig = () => {
    // Se estamos no servidor durante o build, não temos window
    if (typeof window === 'undefined') {
      console.log('Executando no servidor durante build');
      return { apiUrl: null };
    }

    // Determinar ambiente baseado na URL
    const isDev = window.location.hostname === 'localhost';
    const apiUrl = isDev
      ? 'http://localhost:3000/api/pricing'
      : 'https://api.lytspot.com.br/api/pricing';

    console.log(`Ambiente: ${isDev ? 'Desenvolvimento' : 'Produção'}, URL: ${apiUrl}`);
    return { apiUrl };
  };

  // Função para buscar serviços usando XMLHttpRequest
  // XMLHttpRequest é mais antigo, mas às vezes mais confiável para depuração de problemas de conexão
  const buscarServicosXHR = () => {
    setLoading(true);
    setErro(null);
    setDebugInfo('');

    // Obter configuração da API
    const { apiUrl } = getApiConfig();
    if (!apiUrl) {
      setErro('Erro de configuração: URL da API não disponível');
      setLoading(false);
      return;
    }

    const logInfo = (msg) => {
      console.log(msg);
      setDebugInfo(prev => prev + msg + '\n');
    };

    logInfo(`[${new Date().toISOString()}] Iniciando requisição XHR para ${apiUrl}`);

    const xhr = new XMLHttpRequest();
    
    // Importante: definir timeout explícito
    xhr.timeout = 15000; // 15 segundos
    
    xhr.open('GET', apiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store');
    
    xhr.onreadystatechange = function() {
      logInfo(`[${new Date().toISOString()}] XHR readyState: ${xhr.readyState}, status: ${xhr.status}`);
      
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            logInfo(`[${new Date().toISOString()}] Dados recebidos: ${data.length} serviços`);
            
            if (Array.isArray(data) && data.length > 0) {
              setServicos(data);
              setLoading(false);
            } else {
              setErro('Resposta vazia ou inválida do servidor');
              setLoading(false);
            }
          } catch (error) {
            logInfo(`[${new Date().toISOString()}] Erro ao processar resposta: ${error.message}`);
            setErro(`Erro ao processar resposta: ${error.message}`);
            setLoading(false);
          }
        } else {
          logInfo(`[${new Date().toISOString()}] Erro HTTP: ${xhr.status}`);
          setErro(`Erro HTTP: ${xhr.status} ${xhr.statusText}`);
          setLoading(false);
        }
      }
    };
    
    xhr.ontimeout = function() {
      logInfo(`[${new Date().toISOString()}] Timeout da requisição após 15 segundos`);
      setErro('A requisição excedeu o tempo limite. Servidor pode estar indisponível.');
      setLoading(false);
    };
    
    xhr.onerror = function() {
      logInfo(`[${new Date().toISOString()}] Erro de rede na requisição XHR`);
      setErro('Erro de rede ao conectar com o servidor. Verifique sua conexão.');
      setLoading(false);
    };
    
    // Log antes de enviar a requisição
    logInfo(`[${new Date().toISOString()}] Enviando requisição XHR...`);
    
    // Enviar a requisição
    try {
      xhr.send();
    } catch (error) {
      logInfo(`[${new Date().toISOString()}] Exceção ao enviar requisição: ${error.message}`);
      setErro(`Falha ao enviar requisição: ${error.message}`);
      setLoading(false);
    }
  };

  // Buscar os serviços disponíveis ao carregar o componente
  useEffect(() => {
    // Apenas executar no cliente
    if (typeof window !== 'undefined') {
      buscarServicosXHR();
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
        <button 
          onClick={() => buscarServicosXHR()} 
          className="mt-4 text-sm text-neutral hover:text-primary underline"
        >
          Tentar novamente
        </button>
        {debugInfo && (
          <div className="mt-4 p-4 bg-neutral-dark/10 rounded text-xs text-left w-full max-h-40 overflow-y-auto">
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
        <button
          onClick={() => buscarServicosXHR()}
          className="mt-4 bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
        >
          Tentar novamente
        </button>
        {debugInfo && (
          <div className="mt-4 p-4 bg-neutral-dark/20 rounded text-xs text-left w-full max-h-40 overflow-y-auto">
            <pre className="text-neutral-light">{debugInfo}</pre>
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
          Atualizado em: {new Date().toLocaleDateString('pt-BR')}
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
