/**
 * Utilitários para manipulação de dados de serviços
 * @version 1.3.0 - 2025-03-15 - Melhorada robustez na manipulação do campo detalhes
 */

/**
 * Prepara os dados de serviço para armazenamento no banco de dados
 * @param {Object} serviceData - Dados do serviço
 * @returns {Object} Dados formatados para o banco de dados
 */
export function prepareServiceDataForDatabase(serviceData) {
  // Garantir que o objeto tenha todos os campos necessários
  const preparedData = {
    nome: serviceData.nome || '',
    descricao: serviceData.descricao || '',
    preco_base: parseFloat(serviceData.preco_base) || 0,
    duracao_media_captura: serviceData.duracao_media_captura || 'Sob consulta',
    duracao_media_tratamento: serviceData.duracao_media_tratamento || 'Sob consulta',
    entregaveis: serviceData.entregaveis || '',
    possiveis_adicionais: serviceData.possiveis_adicionais || '',
    valor_deslocamento: serviceData.valor_deslocamento || 'Sob consulta',
    ativo: serviceData.ativo !== undefined ? serviceData.ativo : true,
    ordem: serviceData.ordem !== undefined ? parseInt(serviceData.ordem) : 999,
    
    // Armazenar também a estrutura de detalhes para compatibilidade
    // Garantir que seja sempre uma string JSON válida
    detalhes: JSON.stringify({
      captura: serviceData.duracao_media_captura || serviceData.detalhes?.captura || 'Sob consulta',
      tratamento: serviceData.duracao_media_tratamento || serviceData.detalhes?.tratamento || 'Sob consulta',
      entregaveis: serviceData.entregaveis || serviceData.detalhes?.entregaveis || '',
      adicionais: serviceData.possiveis_adicionais || serviceData.detalhes?.adicionais || '',
      deslocamento: serviceData.valor_deslocamento || serviceData.detalhes?.deslocamento || 'Sob consulta'
    })
  };
  
  // Log para depuração
  console.log(`[serviceDataUtils] Preparando dados para o banco: ${serviceData.nome}`);
  console.log(`[serviceDataUtils] Campo detalhes gerado: ${preparedData.detalhes}`);
  
  return preparedData;
}

/**
 * Prepara os dados de serviço para exibição no frontend
 * @param {Object} serviceData - Dados do serviço (do banco ou definição)
 * @returns {Object} Dados formatados para o frontend
 */
export function prepareServiceDataForFrontend(serviceData) {
  // Criar cópia para não modificar o objeto original
  const preparedData = { ...serviceData };
  
  // Garantir que o objeto tenha a estrutura aninhada esperada pelo frontend
  let detalhesObj = {};
  
  // Se detalhes for uma string JSON, fazer o parse
  if (typeof preparedData.detalhes === 'string') {
    try {
      detalhesObj = JSON.parse(preparedData.detalhes);
      console.log(`[serviceDataUtils] Parse do campo detalhes para o serviço ${preparedData.nome || 'desconhecido'}`);
    } catch (error) {
      console.error(`[serviceDataUtils] Erro ao fazer parse do campo detalhes:`, error.message);
      // Em caso de erro, criar um objeto vazio
      detalhesObj = {};
    }
  } else if (preparedData.detalhes && typeof preparedData.detalhes === 'object') {
    // Se já for um objeto, usar diretamente
    detalhesObj = preparedData.detalhes;
  }
  
  // Sempre construir o objeto detalhes a partir dos campos planos
  // Isso garante que o frontend sempre receba a estrutura esperada
  preparedData.detalhes = {
    captura: detalhesObj.captura || preparedData.duracao_media_captura || 'Sob consulta',
    tratamento: detalhesObj.tratamento || preparedData.duracao_media_tratamento || 'Sob consulta',
    entregaveis: detalhesObj.entregaveis || preparedData.entregaveis || '',
    adicionais: detalhesObj.adicionais || preparedData.possiveis_adicionais || '',
    deslocamento: detalhesObj.deslocamento || preparedData.valor_deslocamento || 'Sob consulta'
  };
  
  // Log para depuração
  console.log(`[serviceDataUtils] Preparando dados para o frontend: ${preparedData.nome || 'desconhecido'}`);
  console.log(`[serviceDataUtils] Detalhes preparados: ${JSON.stringify(preparedData.detalhes)}`);
  
  return preparedData;
}

/**
 * Valida se um objeto de serviço tem a estrutura mínima necessária
 * @param {Object} serviceData - Dados do serviço a serem validados
 * @returns {Object} Resultado da validação {valido: boolean, erros: string[]}
 */
export function validateServiceData(serviceData) {
  const erros = [];
  
  // Verificar campos obrigatórios
  if (!serviceData.nome) {
    erros.push('Nome é obrigatório');
  }
  
  if (!serviceData.descricao) {
    erros.push('Descrição é obrigatória');
  }
  
  if (serviceData.preco_base === undefined || serviceData.preco_base === null) {
    erros.push('Preço base é obrigatório');
  } else if (isNaN(parseFloat(serviceData.preco_base))) {
    erros.push('Preço base deve ser um número válido');
  }
  
  // Verificar se campos de duração estão presentes
  if (!serviceData.duracao_media_captura && 
      (!serviceData.detalhes || !serviceData.detalhes.captura)) {
    erros.push('Duração média de captura é obrigatória');
  }
  
  if (!serviceData.duracao_media_tratamento && 
      (!serviceData.detalhes || !serviceData.detalhes.tratamento)) {
    erros.push('Duração média de tratamento é obrigatória');
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
}

export default {
  prepareServiceDataForDatabase,
  prepareServiceDataForFrontend,
  validateServiceData
};
