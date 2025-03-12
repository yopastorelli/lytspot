import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de calculadora de preços para o simulador
 * @version 2.0.0 - 2025-03-12 - Adicionado suporte para múltiplos serviços
 */
const PricingCalculator = ({ servicos }) => {
  const [quantidades, setQuantidades] = useState({});
  const [adicionais, setAdicionais] = useState([]);
  const [deslocamento, setDeslocamento] = useState(false);
  const [precoTotal, setPrecoTotal] = useState(0);

  // Lista de adicionais disponíveis
  const opcoesAdicionais = [
    { id: 1, nome: 'Fotos adicionais', valor: 50 },
    { id: 2, nome: 'Entrega expressa', valor: 100 },
    { id: 3, nome: 'Edição avançada', valor: 150 },
    { id: 4, nome: 'Versão para redes sociais', valor: 80 }
  ];

  // Inicializa as quantidades quando os serviços mudam
  useEffect(() => {
    const novasQuantidades = {};
    servicos.forEach(servico => {
      // Se já existe uma quantidade para este serviço, mantém. Senão, inicializa com 1
      novasQuantidades[servico.id] = quantidades[servico.id] || 1;
    });
    setQuantidades(novasQuantidades);
  }, [servicos]);

  // Calcula o preço total quando as opções mudam
  useEffect(() => {
    if (!servicos || servicos.length === 0) return;

    let total = 0;
    
    // Soma o preço de cada serviço multiplicado pela quantidade
    servicos.forEach(servico => {
      total += servico.preco_base * (quantidades[servico.id] || 1);
    });
    
    // Adiciona valores dos adicionais selecionados
    adicionais.forEach(adicionalId => {
      const adicional = opcoesAdicionais.find(a => a.id === adicionalId);
      if (adicional) {
        total += adicional.valor;
      }
    });
    
    // Adiciona taxa de deslocamento se selecionada
    if (deslocamento) {
      total += 120; // Valor fixo para simplificar
    }
    
    setPrecoTotal(total);
  }, [servicos, quantidades, adicionais, deslocamento]);

  // Formata valores monetários
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Manipula a seleção de adicionais
  const toggleAdicional = (id) => {
    setAdicionais(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Atualiza a quantidade de um serviço
  const atualizarQuantidade = (servicoId, novaQuantidade) => {
    setQuantidades(prev => ({
      ...prev,
      [servicoId]: Math.max(1, novaQuantidade)
    }));
  };

  // Calcula o tempo médio de entrega (o maior entre todos os serviços)
  const calcularTempoEntrega = () => {
    if (!servicos || servicos.length === 0) return 0;
    
    return Math.max(...servicos.map(servico => servico.duracao_media || 0));
  };

  if (!servicos || servicos.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculadora de Preço</h2>
      
      {/* Lista de serviços selecionados */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Serviços Selecionados
        </h3>
        
        {servicos.map(servico => (
          <div key={servico.id} className="border-b border-gray-100 pb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium text-gray-800">{servico.nome}</h4>
              <span className="text-blue-600 font-medium">
                {formatMoney(servico.preco_base)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{servico.descricao}</p>
            
            {/* Controle de quantidade */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3">Quantidade:</span>
              <div className="flex items-center">
                <button 
                  onClick={() => atualizarQuantidade(servico.id, (quantidades[servico.id] || 1) - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l text-sm"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1"
                  value={quantidades[servico.id] || 1}
                  onChange={(e) => atualizarQuantidade(servico.id, parseInt(e.target.value) || 1)}
                  className="w-12 py-1 px-2 text-center border-t border-b border-gray-300 text-sm"
                />
                <button 
                  onClick={() => atualizarQuantidade(servico.id, (quantidades[servico.id] || 1) + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r text-sm"
                >
                  +
                </button>
              </div>
              <span className="ml-auto font-medium text-gray-700">
                {formatMoney(servico.preco_base * (quantidades[servico.id] || 1))}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-6">
        {/* Adicionais */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Adicionais
          </label>
          <div className="space-y-2">
            {opcoesAdicionais.map(opcao => (
              <div key={opcao.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`adicional-${opcao.id}`}
                  checked={adicionais.includes(opcao.id)}
                  onChange={() => toggleAdicional(opcao.id)}
                  className="mr-2"
                />
                <label htmlFor={`adicional-${opcao.id}`} className="flex justify-between w-full text-gray-700">
                  <span>{opcao.nome}</span>
                  <span className="font-medium">{formatMoney(opcao.valor)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Deslocamento */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={deslocamento}
              onChange={() => setDeslocamento(prev => !prev)}
              className="mr-2"
            />
            <span className="text-gray-700">Incluir taxa de deslocamento</span>
            <span className="ml-auto font-medium">{formatMoney(120)}</span>
          </label>
        </div>
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-blue-600">{formatMoney(precoTotal)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Tempo estimado de entrega: {calcularTempoEntrega()} dias
          </p>
        </div>
        
        {/* Botão de contato */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
          Solicitar Orçamento Detalhado
        </button>
      </div>
    </div>
  );
};

PricingCalculator.propTypes = {
  servicos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
      descricao: PropTypes.string.isRequired,
      preco_base: PropTypes.number.isRequired,
      duracao_media: PropTypes.number.isRequired
    })
  ).isRequired
};

export default PricingCalculator;
