/**
 * Repositório para acesso a dados de serviços
 * 
 * Responsável por encapsular o acesso ao banco de dados para operações relacionadas a serviços,
 * incluindo listagem, criação, atualização, exclusão e consultas.
 * 
 * @version 1.7.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
 * @module repositories/serviceRepository
 */

import { 
  prisma, 
  log, 
  logError, 
  executeWithRetry, 
  sanitizeServiceData 
} from '../utils/dbUtils.js';

/**
 * Repositório para gerenciar operações de banco de dados relacionadas a serviços
 */
class ServiceRepository {
  /**
   * Busca todos os serviços com opções de filtragem
   * @param {Object} options Opções de consulta
   * @param {Object} options.orderBy Ordenação dos resultados
   * @param {Object} options.where Filtros para a consulta
   * @param {number} options.take Número máximo de registros
   * @param {number} options.skip Número de registros para pular
   * @returns {Promise<Array>} Lista de serviços
   */
  async findAll(options = {}) {
    const { orderBy = { nome: 'asc' }, where = {}, take, skip } = options;
    
    return executeWithRetry(
      () => prisma.servico.findMany({
        orderBy,
        where,
        take,
        skip
      }),
      'findAllServices',
      options
    );
  }

  /**
   * Busca um serviço pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findById(id) {
    return executeWithRetry(
      () => prisma.servico.findUnique({
        where: { id: Number(id) }
      }),
      'findServiceById',
      { id }
    );
  }

  /**
   * Busca um serviço pelo nome
   * @param {string} nome Nome do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findByName(nome) {
    return executeWithRetry(
      () => prisma.servico.findFirst({
        where: { nome }
      }),
      'findServiceByName',
      { nome }
    );
  }

  /**
   * Cria um novo serviço no banco de dados
   * @param {Object} data Dados do serviço a ser criado
   * @returns {Promise<Object>} Serviço criado
   */
  async create(data) {
    log(`Criando serviço: ${JSON.stringify(data)}`, 'info', 'repository');
    
    // Sanitizar dados antes de criar
    const sanitizedData = sanitizeServiceData(data);
    
    // Criar serviço no banco de dados
    const service = await executeWithRetry(
      () => prisma.servico.create({
        data: sanitizedData
      }),
      'createService',
      sanitizedData
    );
    
    log(`Serviço criado com sucesso (ID: ${service.id})`, 'info', 'repository');
    
    return service;
  }

  /**
   * Atualiza um serviço existente
   * @param {number} id ID do serviço a ser atualizado
   * @param {Object} data Dados atualizados do serviço
   * @returns {Promise<Object>} Serviço atualizado
   */
  async update(id, data) {
    log(`Atualizando serviço ID ${id}: ${JSON.stringify(data)}`, 'info', 'repository');
    
    // Sanitizar dados antes de atualizar
    const sanitizedData = sanitizeServiceData(data);
    
    // Atualizar serviço no banco de dados
    const service = await executeWithRetry(
      () => prisma.servico.update({
        where: { id: Number(id) },
        data: sanitizedData
      }),
      'updateService',
      { id, ...sanitizedData }
    );
    
    log(`Serviço ID ${id} atualizado com sucesso`, 'info', 'repository');
    
    return service;
  }

  /**
   * Remove um serviço do banco de dados
   * @param {number} id ID do serviço a ser removido
   * @returns {Promise<Object>} Serviço removido
   */
  async delete(id) {
    log(`Removendo serviço ID ${id}`, 'info', 'repository');
    
    // Remover serviço do banco de dados
    const service = await executeWithRetry(
      () => prisma.servico.delete({
        where: { id: Number(id) }
      }),
      'deleteService',
      { id }
    );
    
    log(`Serviço ID ${id} removido com sucesso`, 'info', 'repository');
    
    return service;
  }

  /**
   * Busca serviços por categoria
   * @param {string} categoria Categoria dos serviços
   * @returns {Promise<Array>} Lista de serviços da categoria
   */
  async findByCategory(categoria) {
    return executeWithRetry(
      () => prisma.servico.findMany({
        where: { categoria },
        orderBy: { nome: 'asc' }
      }),
      'findServicesByCategory',
      { categoria }
    );
  }

  /**
   * Busca serviços disponíveis
   * @returns {Promise<Array>} Lista de serviços disponíveis
   */
  async findAvailable() {
    return executeWithRetry(
      () => prisma.servico.findMany({
        where: { disponivel: true },
        orderBy: { nome: 'asc' }
      }),
      'findAvailableServices',
      {}
    );
  }

  /**
   * Conta o número total de serviços
   * @param {Object} where Filtros para a contagem
   * @returns {Promise<number>} Número total de serviços
   */
  async count(where = {}) {
    return executeWithRetry(
      () => prisma.servico.count({ where }),
      'countServices',
      { where }
    );
  }
}

// Exportar uma instância única do repositório
export default new ServiceRepository();
