/**
 * Validador de Serviços
 * @description Funções de validação para dados de serviços
 * @version 1.0.0 - 2025-03-12
 */

/**
 * Classe responsável por validar dados de serviços
 */
class ServiceValidator {
  /**
   * Valida os dados de um serviço para criação ou atualização
   * @param {Object} serviceData Dados do serviço a serem validados
   * @returns {Object} Resultado da validação { isValid, errors }
   */
  validate(serviceData) {
    const errors = [];
    
    // Validar campos obrigatórios
    if (!serviceData.nome) {
      errors.push('O nome do serviço é obrigatório');
    } else if (serviceData.nome.length < 3 || serviceData.nome.length > 100) {
      errors.push('O nome do serviço deve ter entre 3 e 100 caracteres');
    }
    
    if (!serviceData.descricao) {
      errors.push('A descrição do serviço é obrigatória');
    } else if (serviceData.descricao.length < 10 || serviceData.descricao.length > 500) {
      errors.push('A descrição do serviço deve ter entre 10 e 500 caracteres');
    }
    
    // Validar preço base
    if (serviceData.preco_base === undefined || serviceData.preco_base === null) {
      errors.push('O preço base do serviço é obrigatório');
    } else {
      const precoBase = parseFloat(serviceData.preco_base);
      if (isNaN(precoBase) || precoBase < 0) {
        errors.push('O preço base deve ser um número positivo');
      }
    }
    
    // Validar campos opcionais se estiverem presentes
    if (serviceData.duracao_media_captura && typeof serviceData.duracao_media_captura !== 'string') {
      errors.push('A duração média de captura deve ser uma string');
    }
    
    if (serviceData.duracao_media_tratamento && typeof serviceData.duracao_media_tratamento !== 'string') {
      errors.push('A duração média de tratamento deve ser uma string');
    }
    
    if (serviceData.entregaveis && typeof serviceData.entregaveis !== 'string') {
      errors.push('Os entregáveis devem ser uma string');
    }
    
    if (serviceData.possiveis_adicionais && typeof serviceData.possiveis_adicionais !== 'string') {
      errors.push('Os possíveis adicionais devem ser uma string');
    }
    
    if (serviceData.valor_deslocamento && typeof serviceData.valor_deslocamento !== 'string') {
      errors.push('O valor de deslocamento deve ser uma string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valida os dados de um serviço no formato do simulador
   * @param {Object} simulatorData Dados do serviço no formato do simulador
   * @returns {Object} Resultado da validação { isValid, errors }
   */
  validateSimulatorFormat(simulatorData) {
    const errors = [];
    
    // Validar campos obrigatórios
    if (!simulatorData.nome) {
      errors.push('O nome do serviço é obrigatório');
    }
    
    if (!simulatorData.descricao) {
      errors.push('A descrição do serviço é obrigatória');
    }
    
    // Validar preço base
    if (simulatorData.preco_base === undefined || simulatorData.preco_base === null) {
      errors.push('O preço base do serviço é obrigatório');
    } else {
      const precoBase = parseFloat(simulatorData.preco_base);
      if (isNaN(precoBase) || precoBase < 0) {
        errors.push('O preço base deve ser um número positivo');
      }
    }
    
    // Validar duração média
    if (simulatorData.duracao_media !== undefined && simulatorData.duracao_media !== null) {
      const duracaoMedia = parseFloat(simulatorData.duracao_media);
      if (isNaN(duracaoMedia) || duracaoMedia < 0) {
        errors.push('A duração média deve ser um número positivo');
      }
    }
    
    // Validar detalhes se estiverem presentes
    if (simulatorData.detalhes) {
      if (typeof simulatorData.detalhes !== 'object') {
        errors.push('Os detalhes do serviço devem ser um objeto');
      } else {
        // Validar campos de detalhes
        const { captura, tratamento, entregaveis, adicionais, deslocamento } = simulatorData.detalhes;
        
        if (captura && typeof captura !== 'string') {
          errors.push('A duração de captura deve ser uma string');
        }
        
        if (tratamento && typeof tratamento !== 'string') {
          errors.push('A duração de tratamento deve ser uma string');
        }
        
        if (entregaveis && typeof entregaveis !== 'string') {
          errors.push('Os entregáveis devem ser uma string');
        }
        
        if (adicionais && typeof adicionais !== 'string') {
          errors.push('Os adicionais devem ser uma string');
        }
        
        if (deslocamento && typeof deslocamento !== 'string') {
          errors.push('O valor de deslocamento deve ser uma string');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valida os parâmetros de consulta para busca de serviços
   * @param {Object} queryParams Parâmetros de consulta
   * @returns {Object} Parâmetros validados e normalizados
   */
  validateQueryParams(queryParams) {
    const validatedParams = {};
    
    // Validar parâmetros de paginação
    if (queryParams.page) {
      const page = parseInt(queryParams.page);
      validatedParams.page = !isNaN(page) && page > 0 ? page : 1;
    } else {
      validatedParams.page = 1;
    }
    
    if (queryParams.limit) {
      const limit = parseInt(queryParams.limit);
      validatedParams.limit = !isNaN(limit) && limit > 0 && limit <= 100 ? limit : 20;
    } else {
      validatedParams.limit = 20;
    }
    
    // Validar parâmetros de ordenação
    if (queryParams.sortBy) {
      const allowedSortFields = ['nome', 'preco_base', 'id'];
      validatedParams.sortBy = allowedSortFields.includes(queryParams.sortBy) ? queryParams.sortBy : 'nome';
    } else {
      validatedParams.sortBy = 'nome';
    }
    
    if (queryParams.sortOrder) {
      validatedParams.sortOrder = queryParams.sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    } else {
      validatedParams.sortOrder = 'asc';
    }
    
    // Validar parâmetros de filtro
    if (queryParams.search) {
      validatedParams.search = queryParams.search.trim();
    }
    
    if (queryParams.minPrice) {
      const minPrice = parseFloat(queryParams.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        validatedParams.minPrice = minPrice;
      }
    }
    
    if (queryParams.maxPrice) {
      const maxPrice = parseFloat(queryParams.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        validatedParams.maxPrice = maxPrice;
      }
    }
    
    return validatedParams;
  }
}

// Exportar uma instância única do validador
export default new ServiceValidator();
