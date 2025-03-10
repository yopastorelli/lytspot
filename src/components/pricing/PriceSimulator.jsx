import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuração do axios para apontar para o servidor backend
// Inicialização segura que funciona tanto no servidor quanto no cliente
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'https://api.lytspot.com.br'; // URL de produção por padrão durante o build
  }
  
  // No cliente, verificamos o hostname para determinar o ambiente
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Determinar URL base de acordo com o ambiente
  const baseUrl = isLocalhost 
    ? 'http://localhost:3000' 
    : 'https://api.lytspot.com.br';
  
  console.log('API Base URL:', baseUrl);
  return baseUrl;
};

// Definir o path correto da API baseado no ambiente
const getApiPath = () => {
  if (typeof window === 'undefined') {
    return '/api/pricing'; // Path padrão durante o build
  }
  
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Em local usamos /api/pricing, em produção apenas /pricing
  // Isso é para se adequar à estrutura do servidor de produção
  return isLocalhost ? '/api/pricing' : '/pricing';
};

// Criamos a instância do axios apenas quando necessário
const createApi = () => {
  const baseURL = getApiBaseUrl();
  console.log('Criando instância do axios com baseURL:', baseURL);
  
  const api = axios.create({
    baseURL,
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
    console.log('Request:', request.method, request.url);
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      return response;
    },
    error => {
      console.error('API Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      return Promise.reject(error);
    }
  );
  
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
      
      console.log('Buscando serviços da API...');
      
      // Verificar se estamos no cliente
      if (typeof window === 'undefined') {
        console.log('Executando no servidor, sem acesso à API');
        setLoading(false);
        setErro('Não foi possível carregar os serviços.');
        return;
      }

      // Obter a URL base e o path da API
      const baseUrl = getApiBaseUrl();
      const apiPath = getApiPath();
      
      // Registrar tentativa de conexão
      setTentativas(prev => prev + 1);
      
      // Log detalhado da tentativa atual
      console.log(`Tentativa #${tentativas + 1} de conectar à API`);
      console.log(`URL completa: ${baseUrl}${apiPath}`);
      
      // Teste com fetch para buscar os dados da API
      try {
        console.log(`Tentando com fetch nativo: ${baseUrl}${apiPath}`);
        
        const response = await fetch(`${baseUrl}${apiPath}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        
        // Log detalhado da resposta
        console.log('Resposta do fetch:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers])
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Dados recebidos da API:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            console.log(`${data.length} serviços carregados com sucesso via fetch!`, data);
            setServicos(data);
            setLoading(false);
            return;
          } else {
            console.warn('Resposta da API fetch não contém serviços:', data);
            throw new Error('A API retornou dados em formato inesperado');
          }
        } else {
          console.warn(`Falha na requisição fetch: ${response.status} ${response.statusText}`);
          throw new Error(`Erro HTTP: ${response.status}`);
        }
      } catch (fetchError) {
        console.error('Erro no fetch:', fetchError);
        
        // Tentar uma URL alternativa em caso de falha no fetch
        try {
          // Tentar uma URL alternativa sem o prefixo /api
          const alternativeUrl = isLocalhost ? 
            `${baseUrl}/pricing` : // Em localhost, tenta sem o prefixo /api
            `${baseUrl}/api/pricing`; // Em produção, tenta com o prefixo /api
            
          console.log(`Tentando URL alternativa: ${alternativeUrl}`);
          
          const altResponse = await fetch(alternativeUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
          });
          
          if (altResponse.ok) {
            const data = await altResponse.json();
            if (Array.isArray(data) && data.length > 0) {
              console.log(`${data.length} serviços carregados com sucesso via URL alternativa!`, data);
              setServicos(data);
              setLoading(false);
              return;
            }
          }
        } catch (altError) {
          console.error('Erro na tentativa alternativa:', altError);
        }
      }
      
      // Se fetch falhou, tentar com axios como último recurso
      try {
        console.log(`Fazendo requisição para ${apiPath} com axios...`);
        const api = createApi();
        const response = await api.get(apiPath);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log(`${response.data.length} serviços carregados com sucesso via axios!`, response.data);
          setServicos(response.data);
          setLoading(false);
          return;
        } else {
          console.warn('Resposta da API axios não contém serviços válidos:', response.data);
          // Tentar uma URL alternativa
          try {
            const altPath = apiPath === '/api/pricing' ? '/pricing' : '/api/pricing';
            console.log(`Tentando com caminho alternativo: ${altPath}`);
            const altResponse = await api.get(altPath);
            
            if (Array.isArray(altResponse.data) && altResponse.data.length > 0) {
              console.log(`${altResponse.data.length} serviços carregados com sucesso via axios com path alternativo!`, altResponse.data);
              setServicos(altResponse.data);
              setLoading(false);
              return;
            }
          } catch (altError) {
            console.error('Erro na requisição axios alternativa:', altError.message);
          }
          
          // Se não temos serviços, mostrar mensagem e parar tentativas
          setErro('Não foi possível encontrar serviços disponíveis no momento.');
          setLoading(false);
          return;
        }
      } catch (axiosError) {
        console.error('Erro na requisição axios:', axiosError.message);
        // Mostrar erro ao usuário e parar tentativas
        setErro('Ocorreu um erro ao conectar ao servidor. Por favor, tente novamente mais tarde.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Erro geral ao buscar serviços:', error);
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
          servicos.map(servico => (
            <div 
              key={servico.id} 
              className="mb-4 p-4 bg-light rounded-lg border border-neutral/20 hover:border-primary/50 transition-colors"
            >
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-primary"
                  onChange={(e) => handleServicoChange(servico, e.target.checked)}
                />
                <div className="ml-3">
                  <h3 className="font-medium text-primary">{servico.nome}</h3>
                  <p className="text-neutral text-sm mt-1">{servico.descricao}</p>
                  <p className="text-accent font-bold mt-2">R$ {servico.preco_base.toFixed(2)}</p>
                </div>
              </label>
            </div>
          ))
        )}
        
        {/* Data da última atualização */}
        <div className="mt-4 text-sm text-neutral-light italic">
          Última atualização: {dataAtualizacao}
        </div>
      </div>
      
      {/* Coluna de resumo do orçamento */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Resumo do Orçamento</h2>
        
        {servicosSelecionados.length === 0 ? (
          <div className="p-6 bg-light rounded-lg border border-neutral/20 text-center">
            <p className="text-neutral-light">Selecione os serviços desejados para visualizar o orçamento.</p>
          </div>
        ) : (
          <div className="bg-light rounded-lg border border-neutral/20 overflow-hidden">
            {/* Lista de serviços selecionados */}
            <div className="p-4">
              <h3 className="font-medium text-primary mb-3">Serviços Selecionados</h3>
              {servicosSelecionados.map(servico => (
                <div key={servico.id} className="flex justify-between items-center py-2 border-b border-neutral/10 last:border-0">
                  <span className="text-neutral">{servico.nome}</span>
                  <span className="font-medium">R$ {servico.preco_base.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="bg-primary/10 p-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">Total</span>
                <span className="font-bold text-xl text-primary">R$ {precoTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-light mt-2">
                * Este é um valor base estimado. Para um orçamento personalizado, entre em contato conosco.
              </p>
            </div>
            
            {/* Botão de contato */}
            <div className="p-4">
              <a 
                href="/contato" 
                className="block w-full bg-accent text-center text-light font-medium py-3 rounded-md transition-colors hover:bg-accent-light"
              >
                Solicitar Orçamento Personalizado
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSimulator;
