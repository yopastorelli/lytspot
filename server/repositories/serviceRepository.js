/**
 * Repositório de Serviços
 * @description Encapsula todas as operações de banco de dados relacionadas a serviços
 * @version 1.0.0 - 2025-03-12
 */

import { PrismaClient } from '@prisma/client';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

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
    
    return prisma.servico.findMany({
      orderBy,
      where,
      take,
      skip
    });
  }

  /**
   * Busca um serviço pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findById(id) {
    return prisma.servico.findUnique({
      where: { id: Number(id) }
    });
  }

  /**
   * Busca um serviço pelo nome
   * @param {string} nome Nome do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findByName(nome) {
    return prisma.servico.findFirst({
      where: { nome }
    });
  }

  /**
   * Cria um novo serviço
   * @param {Object} data Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   */
  async create(data) {
    return prisma.servico.create({ data });
  }

  /**
   * Atualiza um serviço existente
   * @param {number} id ID do serviço
   * @param {Object} data Dados atualizados
   * @returns {Promise<Object>} Serviço atualizado
   */
  async update(id, data) {
    return prisma.servico.update({
      where: { id: Number(id) },
      data
    });
  }

  /**
   * Remove um serviço
   * @param {number} id ID do serviço
   * @returns {Promise<Object>} Serviço removido
   */
  async delete(id) {
    return prisma.servico.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Conta o número de serviços com base em filtros opcionais
   * @param {Object} where Filtros para a contagem
   * @returns {Promise<number>} Número de serviços
   */
  async count(where = {}) {
    return prisma.servico.count({ where });
  }

  /**
   * Verifica se um serviço existe pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<boolean>} Verdadeiro se o serviço existir
   */
  async exists(id) {
    try {
      console.log('ServiceRepository.exists - Verificando existência do serviço ID:', id);
      const count = await prisma.servico.count({
        where: { 
          id: Number(id) 
        }
      });
      console.log('ServiceRepository.exists - Contagem encontrada:', count);
      return count > 0;
    } catch (error) {
      console.error('ServiceRepository.exists - Erro ao verificar existência:', error);
      // Retornar false em caso de erro, para que o serviço possa tentar usar dados de demonstração
      return false;
    }
  }
}

// Exportar uma instância única do repositório
export default new ServiceRepository();
