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
   * Atualiza um serviço
   * @param {number} id ID do serviço
   * @param {Object} data Dados atualizados
   * @returns {Promise<Object>} Serviço atualizado
   */
  async update(id, data) {
    try {
      console.log('ServiceRepository.update - Iniciando atualização do serviço ID:', id);
      console.log('ServiceRepository.update - Dados recebidos:', data);
      
      // Garantir que o ID seja um número
      const numericId = Number(id);
      
      // Verificar se o serviço existe
      const exists = await this.exists(numericId);
      if (!exists) {
        console.error('ServiceRepository.update - Serviço não encontrado com ID:', numericId);
        throw new Error(`Serviço com ID ${numericId} não encontrado`);
      }
      
      // Garantir que preco_base seja um número
      const sanitizedData = { ...data };
      if (sanitizedData.preco_base !== undefined) {
        sanitizedData.preco_base = typeof sanitizedData.preco_base === 'string' 
          ? parseFloat(sanitizedData.preco_base) 
          : sanitizedData.preco_base;
      }
      
      console.log('ServiceRepository.update - Dados sanitizados:', sanitizedData);
      
      // Atualizar o serviço
      const updatedService = await prisma.servico.update({
        where: { id: numericId },
        data: sanitizedData
      });
      
      console.log('ServiceRepository.update - Serviço atualizado com sucesso:', updatedService);
      return updatedService;
    } catch (error) {
      console.error('ServiceRepository.update - Erro ao atualizar serviço:', error);
      throw error;
    }
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
