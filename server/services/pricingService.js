/**
 * Serviço de Preços
 * @description Implementa a lógica de negócios relacionada a preços e serviços
 * @version 1.0.0 - 2025-03-12
 */

import serviceRepository from '../repositories/serviceRepository.js';
import serviceTransformer from '../transformers/serviceTransformer.js';
import { getServiceDefinitionsForFrontend, updateDemonstrationService } from '../models/seeds/serviceDefinitions.js';

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
      console.log('PricingService.getServiceById - Buscando serviço com ID:', id);
      const service = await serviceRepository.findById(id);
      console.log('PricingService.getServiceById - Resultado da busca:', service ? 'Encontrado' : 'Não encontrado');
      
      if (!service) {
        console.log('PricingService.getServiceById - Serviço não encontrado, tentando dados de demonstração');
        // Tentar buscar nos dados de demonstração como fallback
        const demoService = this.getDemonstrationData().find(s => s.id === parseInt(id));
        if (demoService) {
          console.log('PricingService.getServiceById - Serviço encontrado nos dados de demonstração');
          return demoService;
        }
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
      console.log('PricingService.updateService - Iniciando atualização do serviço:', id);
      console.log('PricingService.updateService - Dados recebidos:', serviceData);
      
      // Verificar se o serviço existe no banco de dados
      let existsInDatabase = false;
      let existsInDemo = false;
      
      try {
        console.log('PricingService.updateService - Verificando existência no banco de dados');
        existsInDatabase = await serviceRepository.exists(id);
        console.log('PricingService.updateService - Existe no banco de dados?', existsInDatabase);
      } catch (dbError) {
        console.error('PricingService.updateService - Erro ao verificar no banco de dados:', dbError);
        // Continuar com a verificação nos dados de demonstração
      }
      
      // Se não existe no banco de dados, verificar nos dados de demonstração
      if (!existsInDatabase) {
        console.log('PricingService.updateService - Verificando existência nos dados de demonstração');
        const demoServices = this.getDemonstrationData();
        const demoService = demoServices.find(s => s.id === parseInt(id));
        existsInDemo = !!demoService;
        console.log('PricingService.updateService - Existe nos dados de demonstração?', existsInDemo);
      }
      
      // Se não existe em nenhum lugar, lançar erro
      if (!existsInDatabase && !existsInDemo) {
        console.log('PricingService.updateService - Serviço não encontrado em nenhum lugar');
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      // Tentar atualizar no banco de dados primeiro
      let updatedService;
      
      if (existsInDatabase) {
        try {
          console.log('PricingService.updateService - Tentando atualizar no banco de dados');
          updatedService = await serviceRepository.update(id, serviceData);
          console.log('PricingService.updateService - Atualizado com sucesso no banco de dados');
          return serviceTransformer.toSimulatorFormat(updatedService);
        } catch (updateError) {
          console.error('PricingService.updateService - Erro ao atualizar no banco de dados:', updateError);
          // Se falhar e existir nos dados de demonstração, continuar com a atualização de demonstração
          if (!existsInDemo) {
            throw updateError;
          }
        }
      }
      
      // Se chegou aqui, tentar atualizar nos dados de demonstração
      console.log('PricingService.updateService - Tentando atualizar nos dados de demonstração');
      const updatedDemo = updateDemonstrationService(id, serviceData);
      
      if (updatedDemo) {
        console.log('PricingService.updateService - Atualizado com sucesso nos dados de demonstração');
        return updatedDemo;
      } else {
        console.error('PricingService.updateService - Falha ao atualizar nos dados de demonstração');
        throw new Error(`Não foi possível atualizar o serviço com ID ${id}`);
      }
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
