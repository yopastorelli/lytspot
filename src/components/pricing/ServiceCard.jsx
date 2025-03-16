import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de cartão de serviço para o simulador de preços
 * @version 1.3.0 - 2025-03-15 - Melhorada a resiliência a diferentes estruturas de dados
 */
const ServiceCard = ({ servico, selecionado, onClick }) => {
  // Formata valores monetários
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter o valor de captura, tratando diferentes estruturas de dados
  const getCaptura = () => {
    // Verificar se existe na estrutura aninhada
    if (servico.detalhes?.captura) {
      return servico.detalhes.captura;
    }
    // Verificar se existe na estrutura plana
    if (servico.duracao_media_captura) {
      return servico.duracao_media_captura;
    }
    // Fallback
    return 'Sob consulta';
  };

  // Função para obter o valor de tratamento, tratando diferentes estruturas de dados
  const getTratamento = () => {
    // Verificar se existe na estrutura aninhada
    if (servico.detalhes?.tratamento) {
      return servico.detalhes.tratamento;
    }
    // Verificar se existe na estrutura plana
    if (servico.duracao_media_tratamento) {
      return servico.duracao_media_tratamento;
    }
    // Fallback
    return 'Sob consulta';
  };

  // Log para depuração - será removido após resolução do problema
  useEffect(() => {
    console.log(`[ServiceCard] Renderizando serviço: ${servico.id} - ${servico.nome}`);
    console.log('[ServiceCard] Estrutura do serviço:', {
      detalhes: servico.detalhes,
      duracao_media_captura: servico.duracao_media_captura,
      duracao_media_tratamento: servico.duracao_media_tratamento,
      captura_usada: getCaptura(),
      tratamento_usado: getTratamento()
    });
  }, [servico]);

  return (
    <div 
      className={`
        border rounded-lg overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full
        ${selecionado 
          ? 'border-blue-500 shadow-md bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow bg-white'}
      `}
      onClick={onClick}
    >
      <div className="p-5 flex-grow flex flex-col">
        <h3 className={`text-xl font-semibold mb-2 ${selecionado ? 'text-blue-700' : 'text-gray-800'}`}>
          {servico.nome}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          {servico.descricao}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-500 text-sm">Preço base:</span>
          <span className={`text-xl font-bold ${selecionado ? 'text-blue-700' : 'text-blue-600'}`}>
            {formatMoney(servico.preco_base)}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1 mb-4 flex-grow">
          <div className="flex justify-between">
            <span>Tempo de captura:</span>
            <span className="font-medium">{getCaptura()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tempo de tratamento:</span>
            <span className="font-medium">{getTratamento()}</span>
          </div>
        </div>
        
        <button 
          className={`
            w-full py-2 px-4 rounded text-sm font-medium transition-colors duration-300 mt-auto
            ${selecionado 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
          `}
        >
          {selecionado ? 'Selecionado' : 'Selecionar'}
        </button>
      </div>
    </div>
  );
};

ServiceCard.propTypes = {
  servico: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nome: PropTypes.string.isRequired,
    descricao: PropTypes.string.isRequired,
    preco_base: PropTypes.number.isRequired,
    detalhes: PropTypes.shape({
      captura: PropTypes.string,
      tratamento: PropTypes.string,
      entregaveis: PropTypes.string,
      adicionais: PropTypes.string,
      deslocamento: PropTypes.string
    }),
    duracao_media_captura: PropTypes.string,
    duracao_media_tratamento: PropTypes.string
  }).isRequired,
  selecionado: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

ServiceCard.defaultProps = {
  selecionado: false
};

export default ServiceCard;
