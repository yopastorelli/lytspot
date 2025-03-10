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
  // Estado para controlar qual estratégia de API usar
  const [apiStrategy, setApiStrategy] = useState('proxy');

  // Função para fazer logs
  const logInfo = (msg) => {
    console.log(msg);
    setDebugInfo(prev => prev + msg + '\n');
  };

  // Função para testar conexão com API usando diferentes estratégias
  const testarConexaoAPI = async (estrategia = 'proxy') => {
    setLoading(true);
    setErro(null);
    setDebugInfo('');
    setApiStrategy(estrategia);

    // Determinando ambiente (dev vs prod)
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    logInfo(`[${new Date().toISOString()}] Ambiente detectado: ${isDev ? 'Desenvolvimento' : 'Produção'}`);

    let apiUrl;
    switch (estrategia) {
      case 'proxy':
        apiUrl = '/api/pricing';
        logInfo(`[${new Date().toISOString()}] Usando estratégia de proxy: ${apiUrl}`);
        break;
      case 'direct':
        apiUrl = isDev ? 'http://localhost:3000/api/pricing' : 'https://lytspot.onrender.com/api/pricing';
        logInfo(`[${new Date().toISOString()}] Usando conexão direta: ${apiUrl}`);
        break;
      case 'servico-mock':
        // Usamos dados "mockados" temporariamente apenas para diagnóstico
        logInfo(`[${new Date().toISOString()}] Usando dados de serviço de teste para diagnóstico`);
        setServicos([
          {
            id: 1,
            nome: "Serviço de Teste",
            descricao: "Este é um serviço de teste usado apenas para diagnóstico.",
            preco_base: 100.00,
            duracao_media: 2
          }
        ]);
        setLoading(false);
        return;
      default:
        apiUrl = '/api/pricing';
    }

    try {
      logInfo(`[${new Date().toISOString()}] Iniciando requisição para ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        ...(estrategia === 'direct' ? { mode: 'cors' } : {})
      });

      logInfo(`[${new Date().toISOString()}] Resposta recebida: status=${response.status}`);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logInfo(`[${new Date().toISOString()}] Resposta convertida para JSON`);

      if (Array.isArray(data) && data.length > 0) {
        logInfo(`[${new Date().toISOString()}] Dados válidos recebidos: ${data.length} serviços`);
        setServicos(data);
      } else {
        throw new Error('Resposta não contém dados válidos de serviços');
      }
    } catch (error) {
      logInfo(`[${new Date().toISOString()}] Erro ao buscar serviços: ${error.message}`);
      setErro(`Erro ao buscar serviços: ${error.message}`);
      
      // Se a estratégia principal falhar, tente a próxima
      if (estrategia === 'proxy' && apiStrategy !== 'direct') {
        logInfo(`[${new Date().toISOString()}] Estratégia de proxy falhou, tentando conexão direta...`);
        // Não definimos erro ainda para não mostrar mensagem - vamos tentar a próxima estratégia
        testarConexaoAPI('direct');
        return;
      }
    } finally {
      if (estrategia !== 'proxy' || apiStrategy === 'proxy') {
        setLoading(false);
      }
    }
  };

  // Inicializar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      testarConexaoAPI('proxy');
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
          onClick={() => testarConexaoAPI('proxy')} 
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
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => testarConexaoAPI('proxy')}
            className="bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
          >
            Tentar via Proxy
          </button>
          <button
            onClick={() => testarConexaoAPI('direct')}
            className="bg-primary text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-primary-light"
          >
            Conectar Diretamente
          </button>
          <button
            onClick={() => testarConexaoAPI('servico-mock')}
            className="bg-neutral text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-neutral-light"
          >
            Usar Modo de Diagnóstico
          </button>
        </div>
        <div className="mt-6 p-4 bg-neutral-dark/20 rounded text-xs text-left w-full max-h-60 overflow-y-auto">
          <h3 className="font-bold mb-2">Informações de diagnóstico:</h3>
          <pre className="text-neutral-light">{debugInfo}</pre>
        </div>
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
                        <span>{servico.duracao_media || '2'} horas</span>
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
            {apiStrategy === 'servico-mock' ? 
              'Modo de diagnóstico ativado' : 
              `Atualizado em: ${new Date().toLocaleDateString('pt-BR')}`
            }
          </p>
          <button
            onClick={() => testarConexaoAPI('proxy')}
            className="text-xs text-primary underline"
          >
            Atualizar
          </button>
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
