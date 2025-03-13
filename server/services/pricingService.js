/**
 * Serviço de Preços
 * @description Implementa a lógica de negócios relacionada a preços e serviços
 * @version 1.0.0 - 2025-03-12
 */

import serviceRepository from '../repositories/serviceRepository.js';
import serviceTransformer from '../transformers/serviceTransformer.js';
import { getServiceDefinitionsForFrontend } from '../models/seeds/serviceDefinitions.js';

/**
 * Serviço para gerenciar operações relacionadas a preços e serviços
 */
class PricingService {
  /**
   * Obtém todos os serviços disponíveis
   * @param {Object} options Opções de consulta
   * @returns {Promise<Array>} Lista de serviços formatados para o frontend
   */
  async getAllServices(options = {}) {
    try {
      const services = await serviceRepository.findAll(options);
      return services.map(serviceTransformer.toSimulatorFormat);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw new Error('Falha ao buscar serviços disponíveis');
    }
  }

  /**
   * Obtém um serviço pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<Object>} Serviço formatado para o frontend
   */
  async getServiceById(id) {
    try {
      const service = await serviceRepository.findById(id);
      if (!service) {
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      return serviceTransformer.toSimulatorFormat(service);
    } catch (error) {
      console.error(`Erro ao buscar serviço ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo serviço
   * @param {Object} serviceData Dados do serviço
   * @returns {Promise<Object>} Serviço criado e formatado para o frontend
   */
  async createService(serviceData) {
    try {
      const newService = await serviceRepository.create(serviceData);
      return serviceTransformer.toSimulatorFormat(newService);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw new Error('Falha ao criar novo serviço');
    }
  }

  /**
   * Atualiza um serviço existente
   * @param {number} id ID do serviço
   * @param {Object} serviceData Dados atualizados
   * @returns {Promise<Object>} Serviço atualizado e formatado para o frontend
   */
  async updateService(id, serviceData) {
    try {
      // Verificar se o serviço existe
      const exists = await serviceRepository.exists(id);
      if (!exists) {
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      const updatedService = await serviceRepository.update(id, serviceData);
      return serviceTransformer.toSimulatorFormat(updatedService);
    } catch (error) {
      console.error(`Erro ao atualizar serviço ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove um serviço
   * @param {number} id ID do serviço
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteService(id) {
    try {
      // Verificar se o serviço existe
      const exists = await serviceRepository.exists(id);
      if (!exists) {
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      await serviceRepository.delete(id);
      return { success: true, message: `Serviço ${id} removido com sucesso` };
    } catch (error) {
      console.error(`Erro ao remover serviço ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtém dados de demonstração quando o banco de dados não está disponível
   * @returns {Array} Dados de demonstração para o simulador
   */
  getDemonstrationData() {
    try {
      return getServiceDefinitionsForFrontend();
    } catch (error) {
      console.error('Erro ao obter dados de demonstração:', error);
      // Retornar array vazio em caso de erro para evitar quebra da aplicação
      return [];
    }
  }

  /**
   * Calcula o preço de um serviço com base nas opções selecionadas
   * @param {number} serviceId ID do serviço
   * @param {Object} options Opções selecionadas
   * @returns {Promise<Object>} Detalhes do preço calculado
   */
  async calculatePrice(serviceId, options = {}) {
    try {
      const service = await this.getServiceById(serviceId);
      
      // Preço base do serviço
      let totalPrice = service.preco_base;
      
      // Aplicar modificadores de preço com base nas opções
      // Implementação específica dependendo das regras de negócio
      
      return {
        serviceId,
        serviceName: service.nome,
        basePrice: service.preco_base,
        options,
        totalPrice,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Erro ao calcular preço para serviço ${serviceId}:`, error);
      throw error;
    }
  }
}

// Exportar uma instância única do serviço
export default new PricingService();
