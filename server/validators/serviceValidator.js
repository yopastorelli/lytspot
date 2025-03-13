/**
 * Validador de Serviços
 * @description Funções de validação para dados de serviços
 * @version 1.2.0 - 2025-03-13 - Implementada validação mais rigorosa para campos obrigatórios
 */

/**
 * Classe responsável por validar dados de serviços
 */
class ServiceValidator {
  /**
   * Valida os dados de um serviço para criação ou atualização
   * 
   * @version 1.3.0 - 2025-03-13 - Adicionada validação de comprimento e tipo para todos os campos
   * @param {Object} serviceData Dados do serviço a serem validados
   * @returns {Object} Resultado da validação { isValid, errors }
   */
  validate(serviceData) {
    const errors = [];
    
    console.log('Validando dados do serviço:', JSON.stringify(serviceData, null, 2));
    
    // Verificar se os dados do serviço existem
    if (!serviceData || typeof serviceData !== 'object') {
      return {
        isValid: false,
        errors: ['Dados do serviço inválidos ou ausentes']
      };
    }
    
    // Validar campos obrigatórios
    if (!serviceData.nome) {
      errors.push('O nome do serviço é obrigatório');
    } else if (typeof serviceData.nome !== 'string') {
      errors.push('O nome do serviço deve ser uma string');
    } else if (serviceData.nome.trim().length < 3 || serviceData.nome.trim().length > 100) {
      errors.push('O nome do serviço deve ter entre 3 e 100 caracteres');
    }
    
    if (!serviceData.descricao) {
      errors.push('A descrição do serviço é obrigatória');
    } else if (typeof serviceData.descricao !== 'string') {
      errors.push('A descrição do serviço deve ser uma string');
    } else if (serviceData.descricao.trim().length < 10 || serviceData.descricao.trim().length > 500) {
      errors.push('A descrição do serviço deve ter entre 10 e 500 caracteres');
    }
    
    // Validar preço base - aceitar tanto string quanto número
    if (serviceData.preco_base === undefined || serviceData.preco_base === null || serviceData.preco_base === '') {
      errors.push('O preço base do serviço é obrigatório');
    } else {
      let precoBase;
      
      if (typeof serviceData.preco_base === 'string') {
        // Substituir vírgula por ponto para conversão correta
        precoBase = parseFloat(serviceData.preco_base.replace(',', '.'));
      } else {
        precoBase = parseFloat(serviceData.preco_base);
      }
      
      if (isNaN(precoBase) || precoBase < 0) {
        errors.push('O preço base deve ser um número positivo');
      }
    }
    
    // Validar campos obrigatórios adicionais
    if (!serviceData.duracao_media_captura) {
      errors.push('A duração média de captura é obrigatória');
    } else if (typeof serviceData.duracao_media_captura !== 'string') {
      errors.push('A duração média de captura deve ser uma string');
    }
    
    if (!serviceData.duracao_media_tratamento) {
      errors.push('A duração média de tratamento é obrigatória');
    } else if (typeof serviceData.duracao_media_tratamento !== 'string') {
      errors.push('A duração média de tratamento deve ser uma string');
    }
    
    if (!serviceData.entregaveis) {
      errors.push('Os entregáveis são obrigatórios');
    } else if (typeof serviceData.entregaveis !== 'string') {
      errors.push('Os entregáveis devem ser uma string');
    }
    
    // Validar campos opcionais se estiverem presentes
    if (serviceData.possiveis_adicionais !== undefined && 
        serviceData.possiveis_adicionais !== null && 
        typeof serviceData.possiveis_adicionais !== 'string') {
      errors.push('Os possíveis adicionais devem ser uma string');
    }
    
    if (serviceData.valor_deslocamento !== undefined && 
        serviceData.valor_deslocamento !== null && 
        typeof serviceData.valor_deslocamento !== 'string') {
      errors.push('O valor de deslocamento deve ser uma string');
    }
    
    if (errors.length > 0) {
      console.log('Erros de validação encontrados:', errors);
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
