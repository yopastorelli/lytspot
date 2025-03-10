import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Dados mockados para desenvolvimento local (mantidos como fallback)
const MOCK_SERVICES = [
  {
    id: 1,
    nome: "Ensaio Fotográfico Pessoal",
    descricao: "Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Direção de poses, edição profissional básica e entrega digital em alta resolução.",
    preco_base: 300.00,
    duracao_media_captura: "2 a 3 horas",
    duracao_media_tratamento: "até 7 dias úteis",
    entregaveis: "20 fotos editadas em alta resolução",
    possiveis_adicionais: "Maquiagem e cabelo, troca adicional de figurino, cenário especializado",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    id: 2,
    nome: "Ensaio Externo de Casal ou Família",
    descricao: "Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com tratamento profissional.",
    preco_base: 500.00,
    duracao_media_captura: "2 a 4 horas",
    duracao_media_tratamento: "até 10 dias úteis",
    entregaveis: "30 fotos editadas em alta resolução",
    possiveis_adicionais: "participantes adicionais, maquiagem e produção de figurino, sessão na \"Golden Hour\"",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    id: 3,
    nome: "Cobertura Fotográfica de Evento Social",
    descricao: "Cobertura profissional de fotos em eventos como aniversários, batizados e eventos corporativos.",
    preco_base: 1000.00,
    duracao_media_captura: "4 horas",
    duracao_media_tratamento: "até 10 dias úteis",
    entregaveis: "40 fotos editadas em alta resolução",
    possiveis_adicionais: "horas extras, álbum físico ou fotolivro, segundo fotógrafo",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    id: 4,
    nome: "Filmagem de Evento Social (Solo)",
    descricao: "Filmagem profissional para eventos sociais e corporativos, com edição dinâmica e trilha sonora.",
    preco_base: 1500.00,
    duracao_media_captura: "4 horas",
    duracao_media_tratamento: "até 15 dias úteis",
    entregaveis: "vídeo editado de 3 a 5 minutos",
    possiveis_adicionais: "horas extras, depoimentos, vídeo bruto",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    id: 5,
    nome: "Fotografia Aérea com Drone",
    descricao: "Imagens aéreas profissionais para imóveis, paisagens ou eventos.",
    preco_base: 600.00,
    duracao_media_captura: "2 horas",
    duracao_media_tratamento: "até 7 dias úteis",
    entregaveis: "15 fotos aéreas editadas",
    possiveis_adicionais: "autorizações especiais, pós-produção avançada",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  }
];

// Configuração do axios para apontar para o servidor backend
// Inicialização segura que funciona tanto no servidor quanto no cliente
const getApiBaseUrl = () => {
  // Durante o build do Astro, window não está disponível
  if (typeof window === 'undefined') {
    return 'https://lytspot.onrender.com'; // URL de produção por padrão durante o build
  }
  
  // No cliente, verificamos o hostname para determinar o ambiente
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Determinar URL base de acordo com o ambiente
  const baseUrl = isLocalhost 
    ? 'http://localhost:3000' 
    : 'https://lytspot.onrender.com';
  
  console.log('API Base URL:', baseUrl);
  return baseUrl;
};

// Criamos a instância do axios apenas quando necessário
const createApi = () => {
  const baseURL = getApiBaseUrl();
  console.log('Criando instância do axios com baseURL:', baseURL);
  
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false, // Desabilitar credenciais para evitar problemas de CORS
    timeout: 10000 // Timeout de 10 segundos
  });
  
  // Adicionar interceptors para debug
  api.interceptors.request.use(request => {
    console.log('Request:', request.method, request.url);
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('Response Status:', response.status);
      return response;
    },
    error => {
      console.error('API Error:', error.message);
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
  // Estado para controlar tentativas de reconexão
  const [tentativas, setTentativas] = useState(0);
  // Estado para controlar se estamos usando dados mockados
  const [usandoMock, setUsandoMock] = useState(false);

  // Função para buscar serviços
  const buscarServicos = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      console.log(`Tentativa ${tentativas + 1}: Buscando serviços da API...`);
      
      // Verificar se estamos no cliente
      if (typeof window === 'undefined') {
        console.log('Executando no servidor, usando mock data');
        setServicos(MOCK_SERVICES);
        setUsandoMock(true);
        setLoading(false);
        return;
      }

      // Obter a URL base da API
      const baseUrl = getApiBaseUrl();
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Teste com fetch para buscar os dados da API
      try {
        console.log(`Tentando com fetch nativo: ${baseUrl}/api/pricing`);
        const response = await fetch(`${baseUrl}/api/pricing`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`${data.length} serviços carregados com sucesso via fetch!`, data);
            setServicos(data);
            setUsandoMock(false);
            setLoading(false);
            return;
          }
        }
        console.log('Fetch não obteve sucesso, tentando com axios...');
      } catch (fetchError) {
        console.error('Erro no fetch:', fetchError);
      }
      
      // Se fetch falhou, tentar com axios
      try {
        console.log(`Fazendo requisição para ${baseUrl}/api/pricing com axios...`);
        const api = createApi();
        const response = await api.get('/api/pricing');
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log(`${response.data.length} serviços carregados com sucesso via axios!`, response.data);
          setServicos(response.data);
          setUsandoMock(false);
          setLoading(false);
          return;
        } else {
          console.warn('Resposta da API não contém dados de serviços válidos:', response.data);
          throw new Error('Dados de serviços inválidos');
        }
      } catch (axiosError) {
        console.error('Erro na requisição axios:', axiosError.message);
        
        // Em desenvolvimento, podemos usar dados mockados como fallback
        if (isLocalhost) {
          console.log('Ambiente de desenvolvimento detectado, usando dados mockados como fallback');
          setServicos(MOCK_SERVICES);
          setUsandoMock(true);
          setLoading(false);
          return;
        }
        
        // Em produção, tentar mais algumas vezes antes de desistir
        if (tentativas < 2) {
          console.log(`Falha na tentativa ${tentativas + 1}. Tentando novamente...`);
          setTentativas(prev => prev + 1);
          setLoading(false);
          // Esperar um pouco antes de tentar novamente
          setTimeout(buscarServicos, 2000);
          return;
        }
        
        // Após algumas tentativas, mostrar erro em produção
        throw new Error('Não foi possível conectar ao servidor após múltiplas tentativas');
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      
      // Em produção, após várias tentativas, usar dados mockados como último recurso
      console.log('Usando dados mockados como último recurso após erro');
      setServicos(MOCK_SERVICES);
      setUsandoMock(true);
      setErro(null); // Não mostrar erro para o usuário final, apenas usar o mock
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

  // Renderizar a mensagem de erro
  if (erro) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-300">{erro}</p>
        <button
          onClick={() => {
            setTentativas(prev => prev + 1);
            buscarServicos();
          }}
          className="mt-4 bg-accent text-light font-medium py-2 px-4 rounded-md transition-colors hover:bg-accent-light"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Aviso de dados mockados */}
      {usandoMock && (
        <div className="md:col-span-2 bg-amber-100 border border-amber-300 rounded-lg p-4 mb-4">
          <p className="text-amber-800 text-sm">
            <strong>Nota:</strong> Usando dados de exemplo para desenvolvimento local. Em produção, os dados serão carregados do servidor.
          </p>
        </div>
      )}
      
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
