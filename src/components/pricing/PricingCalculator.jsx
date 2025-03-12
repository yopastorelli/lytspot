import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de calculadora de preços para o simulador
 * @version 1.0.0 - 2025-03-12
 */
const PricingCalculator = ({ servico }) => {
  const [quantidade, setQuantidade] = useState(1);
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

  // Calcula o preço total quando as opções mudam
  useEffect(() => {
    if (!servico) return;

    let total = servico.preco_base * quantidade;
    
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
  }, [servico, quantidade, adicionais, deslocamento]);

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

  if (!servico) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculadora de Preço</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          {servico.nome}
        </h3>
        <p className="text-gray-600 mb-2">{servico.descricao}</p>
        <p className="text-blue-600 font-medium">
          Preço base: {formatMoney(servico.preco_base)}
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Quantidade */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Quantidade
          </label>
          <div className="flex items-center">
            <button 
              onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
            >
              -
            </button>
            <input 
              type="number" 
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 py-2 px-3 text-center border-t border-b border-gray-300"
            />
            <button 
              onClick={() => setQuantidade(prev => prev + 1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
            >
              +
            </button>
          </div>
        </div>
        
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
            Tempo estimado de entrega: {servico.duracao_media} dias
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
  servico: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nome: PropTypes.string.isRequired,
    descricao: PropTypes.string.isRequired,
    preco_base: PropTypes.number.isRequired,
    duracao_media: PropTypes.number.isRequired
  })
};

export default PricingCalculator;
