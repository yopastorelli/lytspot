/**
 * Componente para exibir a lista de serviços e adicionais
 * @version 1.0.0 - 2025-03-12
 */
import React, { useState, useEffect } from 'react';
import { servicosAPI } from '../services/api';
import { adicionais, getAdicionaisPorCategoria } from '../data/adicionais';

const ServicosLista = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adicionaisFiltrados, setAdicionaisFiltrados] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Carregar serviços da API
  useEffect(() => {
    const carregarServicos = async () => {
      try {
        setLoading(true);
        const response = await servicosAPI.listar();
        setServicos(response.data);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        setError('Não foi possível carregar os serviços. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarServicos();
  }, []);

  // Filtrar adicionais por categoria
  useEffect(() => {
    if (categoriaFiltro === 'todos') {
      setAdicionaisFiltrados(adicionais);
    } else {
      setAdicionaisFiltrados(adicionais.filter(adicional => adicional.categoria === categoriaFiltro));
    }
  }, [categoriaFiltro]);

  // Formatar valor em reais
  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
        <strong className="font-bold">Erro!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Nossos Serviços</h1>
      
      {/* Lista de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {servicos.map((servico) => (
          <div key={servico.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-600 text-white py-4 px-6">
              <h2 className="text-xl font-bold">{servico.nome}</h2>
              <p className="text-2xl font-bold mt-2">{formatarValor(servico.preco_base)}</p>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">{servico.descricao}</p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Serviço:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Duração de Captura:</strong> {servico.duracao_media_captura}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Prazo de Entrega:</strong> {servico.duracao_media_tratamento}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Entregáveis:</strong> {servico.entregaveis}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Deslocamento:</strong> {servico.valor_deslocamento}</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300">
                  Solicitar Orçamento
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Seção de Adicionais */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Adicionais Disponíveis</h2>
        
        {/* Filtros de categoria */}
        <div className="flex flex-wrap justify-center mb-8">
          <button 
            onClick={() => setCategoriaFiltro('todos')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setCategoriaFiltro('foto')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'foto' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Fotografia
          </button>
          <button 
            onClick={() => setCategoriaFiltro('video')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Vídeo
          </button>
          <button 
            onClick={() => setCategoriaFiltro('combo')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'combo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Pacotes
          </button>
          <button 
            onClick={() => setCategoriaFiltro('tempo')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'tempo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Tempo
          </button>
          <button 
            onClick={() => setCategoriaFiltro('produto')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'produto' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Produtos
          </button>
          <button 
            onClick={() => setCategoriaFiltro('deslocamento')}
            className={`m-1 px-4 py-2 rounded-full ${categoriaFiltro === 'deslocamento' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Deslocamento
          </button>
        </div>
        
        {/* Lista de Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adicionaisFiltrados.map((adicional) => (
            <div key={adicional.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{adicional.nome}</h3>
              <p className="text-gray-600 mb-4">{adicional.descricao}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold">
                  {adicional.valor_base ? formatarValor(adicional.valor_base) : 'Valor sob consulta'}
                </span>
                <span className="text-sm text-gray-500">{adicional.observacao}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Observações Gerais */}
      <div className="mt-16 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Observações Gerais</h2>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>O prazo de entrega pode variar de 7 a 20 dias úteis, dependendo do serviço contratado e do nível de edição solicitado.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Para eventos ou sessões em locais especiais (como Ilha do Mel), despesas de transporte, hospedagem e alimentação podem ser adicionadas ao valor total.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Contratações múltiplas (por exemplo, foto + vídeo no mesmo evento) podem ter desconto. Consulte para obter um orçamento personalizado.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ServicosLista;
