/**
 * Repositório para acesso a dados de serviços
 * 
 * Responsável por encapsular o acesso ao banco de dados para operações relacionadas a serviços,
 * incluindo listagem, criação, atualização, exclusão e consultas.
 * 
 * @version 1.4.0 - 2025-03-12 - Melhorado o método de criação com sanitização de dados
 * @module repositories/serviceRepository
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
   * 
   * @version 1.1.0 - 2025-03-12 - Adicionada sanitização de dados
   * @param {Object} data Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   */
  async create(data) {
    try {
      console.log('ServiceRepository.create - Iniciando criação de serviço');
      console.log('ServiceRepository.create - Dados recebidos:', data);
      
      // Sanitizar dados antes de criar
      const sanitizedData = this.sanitizeServiceData(data);
      console.log('ServiceRepository.create - Dados sanitizados:', sanitizedData);
      
      // Criar serviço com dados sanitizados
      return prisma.servico.create({ data: sanitizedData });
    } catch (error) {
      console.error('ServiceRepository.create - Erro ao criar serviço:', error);
      throw error;
    }
  }

  /**
   * Atualiza um serviço
   * 
   * @version 1.3.0 - 2025-03-12 - Refatorado para usar a função sanitizeServiceData
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
      
      // Sanitizar dados antes de atualizar
      const sanitizedData = this.sanitizeServiceData(data);
      console.log('ServiceRepository.update - Dados sanitizados:', sanitizedData);
      
      // Atualizar serviço com dados sanitizados
      return prisma.servico.update({
        where: { id: numericId },
        data: sanitizedData
      });
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

  /**
   * Sanitiza os dados de um serviço para garantir compatibilidade com o banco de dados
   * 
   * @version 1.0.0 - 2025-03-12
   * @param {Object} data Dados do serviço
   * @returns {Object} Dados sanitizados
   */
  sanitizeServiceData(data) {
    // Criar uma cópia dos dados para não modificar o objeto original
    const sanitized = { ...data };
    
    // Converter preço base para número
    if (sanitized.preco_base !== undefined && sanitized.preco_base !== null) {
      sanitized.preco_base = parseFloat(sanitized.preco_base);
      
      // Se o parseFloat retornar NaN, definir como 0
      if (isNaN(sanitized.preco_base)) {
        sanitized.preco_base = 0;
      }
    }
    
    // Garantir que campos de string não sejam undefined
    const stringFields = [
      'nome', 
      'descricao', 
      'duracao_media_captura', 
      'duracao_media_tratamento', 
      'entregaveis', 
      'possiveis_adicionais', 
      'valor_deslocamento'
    ];
    
    stringFields.forEach(field => {
      if (sanitized[field] === undefined) {
        sanitized[field] = '';
      }
    });
    
    // Remover campos que não pertencem ao modelo Servico
    delete sanitized.id;
    delete sanitized.detalhes;
    delete sanitized.duracao_media;
    
    return sanitized;
  }
}

// Exportar uma instância única do repositório
export default new ServiceRepository();
