/**
 * Utilitários para manipulação de dados de serviços
 * @version 1.0.0 - 2025-03-15 - Criado para resolver problemas de inconsistência de dados
 */

import serviceTransformer from '../transformers/serviceTransformer.js';

/**
 * Prepara os dados de um serviço para armazenamento no banco de dados
 * Garante que o campo detalhes seja sempre uma string JSON válida
 * @param {Object} serviceDefinition - Definição do serviço
 * @returns {Object} - Dados formatados para o banco de dados
 */
export function prepareServiceDataForDatabase(serviceDefinition) {
  if (!serviceDefinition) return null;
  
  // Log para depuração
  console.log(`[serviceDataUtils] Preparando dados para o banco de dados: ${serviceDefinition.nome}`);
  
  // Inicializar objeto detalhes
  let detalhesObj = {};
  
  // Processar campo detalhes existente
  if (serviceDefinition.detalhes) {
    try {
      // Se for string, fazer parse
      if (typeof serviceDefinition.detalhes === 'string') {
        console.log(`[serviceDataUtils] Fazendo parse do campo detalhes como string`);
        detalhesObj = JSON.parse(serviceDefinition.detalhes);
      } 
      // Se for objeto, usar diretamente
      else if (typeof serviceDefinition.detalhes === 'object') {
        console.log(`[serviceDataUtils] Campo detalhes já é um objeto`);
        detalhesObj = { ...serviceDefinition.detalhes };
      }
    } catch (error) {
      console.error(`[serviceDataUtils] Erro ao processar campo detalhes: ${error.message}`);
      // Em caso de erro, continuar com objeto vazio
    }
  }
  
  // Garantir que os campos essenciais estejam presentes no objeto detalhes
  detalhesObj.captura = detalhesObj.captura || serviceDefinition.duracao_media_captura || '';
  detalhesObj.tratamento = detalhesObj.tratamento || serviceDefinition.duracao_media_tratamento || '';
  detalhesObj.entregaveis = detalhesObj.entregaveis || serviceDefinition.entregaveis || '';
  detalhesObj.adicionais = detalhesObj.adicionais || serviceDefinition.possiveis_adicionais || '';
  detalhesObj.deslocamento = detalhesObj.deslocamento || serviceDefinition.valor_deslocamento || '';
  
  // Log do objeto detalhes final
  console.log(`[serviceDataUtils] Objeto detalhes final: ${JSON.stringify(detalhesObj)}`);
  
  // Criar objeto de dados para o banco de dados
  // Importante: Sempre serializar o campo detalhes como string JSON
  const dadosServico = {
    nome: serviceDefinition.nome,
    descricao: serviceDefinition.descricao,
    preco_base: serviceDefinition.preco_base,
    duracao_media_captura: serviceDefinition.duracao_media_captura,
    duracao_media_tratamento: serviceDefinition.duracao_media_tratamento,
    entregaveis: serviceDefinition.entregaveis,
    possiveis_adicionais: serviceDefinition.possiveis_adicionais,
    valor_deslocamento: serviceDefinition.valor_deslocamento,
    detalhes: JSON.stringify(detalhesObj) // IMPORTANTE: Sempre serializar como string
  };
  
  // Remover campos undefined ou null
  Object.keys(dadosServico).forEach(key => {
    if (dadosServico[key] === undefined || dadosServico[key] === null) {
      delete dadosServico[key];
    }
  });
  
  return dadosServico;
}

/**
 * Prepara os dados de um serviço para exibição no frontend
 * Usa o transformador existente para garantir consistência
 * @param {Object} servico - Dados do serviço do banco de dados
 * @returns {Object} - Dados formatados para o frontend
 */
export function prepareServiceDataForFrontend(servico) {
  return serviceTransformer.toSimulatorFormat(servico);
}

/**
 * Prepara uma lista de serviços para exibição no frontend
 * @param {Array} servicos - Lista de serviços do banco de dados
 * @returns {Array} - Lista de serviços formatados para o frontend
 */
export function prepareServiceListForFrontend(servicos) {
  if (!Array.isArray(servicos)) return [];
  return servicos.map(servico => prepareServiceDataForFrontend(servico));
}

export default {
  prepareServiceDataForDatabase,
  prepareServiceDataForFrontend,
  prepareServiceListForFrontend
};
