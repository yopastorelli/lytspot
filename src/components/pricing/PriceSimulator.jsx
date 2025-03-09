import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuração do axios para apontar para o servidor backend
// Inicialização segura que funciona tanto no servidor quanto no cliente
const getApiBaseUrl = () => {
  // Durante o build do Astro, window não está disponível
  if (typeof window === 'undefined') {
    return 'https://lytspot.onrender.com'; // URL de produção por padrão durante o build
  }
  
  // No cliente, verificamos o hostname
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://lytspot.onrender.com';
};

// Criamos a instância do axios apenas quando necessário
const createApi = () => axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Desabilitar credenciais para evitar problemas de CORS
});

// Data da última atualização dos preços
const dataAtualizacao = '09/03/2025';

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

  // Buscar os serviços disponíveis ao carregar o componente
  useEffect(() => {
    const buscarServicos = async () => {
      try {
        setLoading(true);
        setErro(null);
        
        console.log('Buscando serviços da API...');
        // Criamos a instância do api apenas quando estamos no cliente
        const api = createApi();
        // Buscar os serviços da API
        const response = await api.get('/api/pricing');
        console.log('Serviços recebidos:', response.data);
        setServicos(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        setErro('Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    buscarServicos();
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
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
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
      {/* Coluna de serviços disponíveis */}
      <div>
        <h2 className="text-xl font-serif font-bold text-primary mb-4">Serviços Disponíveis</h2>
        
        {servicos.map(servico => (
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
        ))}
        
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
              {servicosSelecionados.map(servico => (
                <div key={servico.id} className="flex justify-between items-center py-2 border-b border-neutral/10 last:border-0">
                  <span className="text-neutral">{servico.nome}</span>
                  <span className="text-accent font-medium">R$ {servico.preco_base.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="bg-primary/5 p-4 border-t border-neutral/20">
              <div className="flex justify-between items-center">
                <span className="text-neutral font-bold">Total:</span>
                <span className="text-accent font-bold text-xl">R$ {precoTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Botão de contato */}
        <div className="mt-6">
          <a 
            href="/contato" 
            className="block w-full bg-accent hover:bg-accent-light text-white font-medium py-3 px-6 rounded-md transition-colors text-center"
          >
            Entre em contato para um orçamento personalizado
          </a>
        </div>
      </div>
    </div>
  );
};

export default PriceSimulator;
