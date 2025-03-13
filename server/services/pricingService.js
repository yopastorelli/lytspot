/**
 * Serviço para gerenciamento de preços e serviços
 * 
 * Responsável por implementar a lógica de negócios relacionada a serviços e preços,
 * incluindo listagem, criação, atualização, exclusão e cálculo de preços.
 * 
 * @version 1.7.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
 * @module services/pricingService
 */

import serviceRepository from '../repositories/serviceRepository.js';
import { getServiceDefinitionsForFrontend, updateDemonstrationService } from '../models/seeds/serviceDefinitions.js';
import environment from '../config/environment.js';
import { log, logError, sanitizeServiceData, executeWithRetry } from '../utils/dbUtils.js';

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
      log(`Buscando todos os serviços com opções: ${JSON.stringify(options)}`, 'info', 'pricing');
      
      // Tentar buscar do banco de dados primeiro
      const services = await executeWithRetry(
        () => serviceRepository.findAll(options),
        'getAllServices',
        options
      );
      
      if (services && services.length > 0) {
        log(`Encontrados ${services.length} serviços no banco de dados`, 'info', 'pricing');
        return services;
      }
      
      // Se não houver serviços no banco, popular o banco com dados de demonstração
      log('Nenhum serviço encontrado no banco, populando com dados de demonstração', 'info', 'pricing');
      
      try {
        const demoServices = getServiceDefinitionsForFrontend();
        log(`Obtidos ${demoServices.length} serviços de demonstração para popular o banco`, 'info', 'pricing');
        
        // Criar serviços no banco de dados
        const createdServices = [];
        for (const demoService of demoServices) {
          try {
            // Remover ID para que o banco gere um novo
            const { id, ...serviceData } = demoService;
            
            // Sanitizar dados do serviço
            const sanitizedData = sanitizeServiceData(serviceData);
            
            // Verificar se já existe um serviço com o mesmo nome
            const existingService = await executeWithRetry(
              () => serviceRepository.findByName(sanitizedData.nome),
              'findServiceByName',
              { nome: sanitizedData.nome }
            );
            
            if (existingService) {
              log(`Serviço "${sanitizedData.nome}" já existe no banco, pulando`, 'warn', 'pricing');
              createdServices.push(existingService);
              continue;
            }
            
            // Criar serviço no banco
            const newService = await executeWithRetry(
              () => serviceRepository.create(sanitizedData),
              'createService',
              sanitizedData
            );
            
            log(`Serviço "${sanitizedData.nome}" criado com sucesso no banco (ID: ${newService.id})`, 'info', 'pricing');
            createdServices.push(newService);
          } catch (createError) {
            logError('createDemoService', createError, { service: demoService.nome });
          }
        }
        
        if (createdServices.length > 0) {
          log(`Criados ${createdServices.length} serviços no banco a partir dos dados de demonstração`, 'info', 'pricing');
          return createdServices;
        }
      } catch (populateError) {
        logError('populateDemoServices', populateError);
      }
      
      // Se não conseguir popular o banco, retornar dados de demonstração diretamente
      log('Retornando dados de demonstração diretamente', 'warn', 'pricing');
      return getServiceDefinitionsForFrontend();
    } catch (error) {
      logError('getAllServices', error);
      
      // Em caso de erro no banco, usar dados de demonstração
      log('Erro no banco de dados, usando dados de demonstração', 'warn', 'pricing');
      return getServiceDefinitionsForFrontend();
    }
  }

  /**
   * Obtém um serviço pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<Object>} Serviço formatado para o frontend
   */
  async getServiceById(id) {
    try {
      log(`Buscando serviço com ID ${id}`, 'info', 'pricing');
      
      // Tentar buscar do banco de dados primeiro
      const service = await executeWithRetry(
        () => serviceRepository.findById(id),
        'getServiceById',
        { id }
      );
      
      if (service) {
        log(`Serviço ID ${id} encontrado no banco de dados`, 'info', 'pricing');
        return service;
      }
      
      // Se não encontrar no banco, verificar nos dados de demonstração
      log(`Serviço com ID ${id} não encontrado no banco, verificando dados de demonstração`, 'info', 'pricing');
      const demoServices = getServiceDefinitionsForFrontend();
      const demoService = demoServices.find(s => s.id === Number(id));
      
      if (demoService) {
        log(`Serviço ID ${id} encontrado nos dados de demonstração`, 'info', 'pricing');
        
        // Tentar criar o serviço no banco de dados para futuras consultas
        try {
          // Remover ID para que o banco gere um novo
          const { id: demoId, ...serviceData } = demoService;
          
          // Sanitizar dados do serviço
          const sanitizedData = sanitizeServiceData(serviceData);
          
          // Verificar se já existe um serviço com o mesmo nome
          const existingService = await executeWithRetry(
            () => serviceRepository.findByName(sanitizedData.nome),
            'findServiceByName',
            { nome: sanitizedData.nome }
          );
          
          if (existingService) {
            log(`Serviço "${sanitizedData.nome}" já existe no banco, retornando existente`, 'warn', 'pricing');
            return existingService;
          }
          
          // Criar serviço no banco
          const newService = await executeWithRetry(
            () => serviceRepository.create(sanitizedData),
            'createService',
            sanitizedData
          );
          
          log(`Serviço "${sanitizedData.nome}" criado com sucesso no banco (ID: ${newService.id})`, 'info', 'pricing');
          return newService;
        } catch (createError) {
          logError('createDemoServiceById', createError, { id });
          // Retornar o serviço de demonstração original
          return demoService;
        }
      }
      
      // Se não encontrar em nenhum lugar, lançar erro
      throw new Error(`Serviço com ID ${id} não encontrado`);
    } catch (error) {
      logError('getServiceById', error, { id });
      
      // Verificar se é um erro de "não encontrado" ou outro tipo de erro
      if (error.message.includes('não encontrado')) {
        throw error; // Repassar erro de "não encontrado"
      }
      
      // Para outros erros, tentar buscar nos dados de demonstração
      const demoServices = getServiceDefinitionsForFrontend();
      const demoService = demoServices.find(s => s.id === Number(id));
      
      if (demoService) {
        log(`Serviço ID ${id} encontrado nos dados de demonstração após erro`, 'warn', 'pricing');
        return demoService;
      }
      
      // Se não encontrar nos dados de demonstração, lançar o erro original
      throw error;
    }
  }

  /**
   * Cria um novo serviço
   * @param {Object} serviceData Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   */
  async createService(serviceData) {
    try {
      log(`Criando novo serviço: ${JSON.stringify(serviceData)}`, 'info', 'pricing');
      
      // Sanitizar dados do serviço
      const sanitizedData = sanitizeServiceData(serviceData);
      
      // Verificar se já existe um serviço com o mesmo nome
      const existingService = await executeWithRetry(
        () => serviceRepository.findByName(sanitizedData.nome),
        'findServiceByName',
        { nome: sanitizedData.nome }
      );
      
      if (existingService) {
        log(`Serviço com nome "${sanitizedData.nome}" já existe (ID: ${existingService.id})`, 'warn', 'pricing');
        throw new Error(`Serviço com nome "${sanitizedData.nome}" já existe`);
      }
      
      // Criar serviço no banco
      const newService = await executeWithRetry(
        () => serviceRepository.create(sanitizedData),
        'createService',
        sanitizedData
      );
      
      log(`Serviço criado com sucesso (ID: ${newService.id})`, 'info', 'pricing');
      
      // Atualizar definição de demonstração se necessário
      if (environment.env === 'development') {
        try {
          updateDemonstrationService(newService);
          log('Definição de demonstração atualizada', 'info', 'pricing');
        } catch (updateError) {
          logError('updateDemoDefinition', updateError, { serviceId: newService.id });
        }
      }
      
      return newService;
    } catch (error) {
      logError('createService', error, serviceData);
      throw error;
    }
  }

  /**
   * Atualiza um serviço existente
   * @param {number} id ID do serviço
   * @param {Object} serviceData Dados atualizados do serviço
   * @returns {Promise<Object>} Serviço atualizado
   */
  async updateService(id, serviceData) {
    try {
      log(`Atualizando serviço ID ${id}: ${JSON.stringify(serviceData)}`, 'info', 'pricing');
      
      // Verificar se o serviço existe
      const existingService = await executeWithRetry(
        () => serviceRepository.findById(id),
        'findServiceById',
        { id }
      );
      
      if (!existingService) {
        log(`Serviço com ID ${id} não encontrado para atualização`, 'error', 'pricing');
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      // Sanitizar dados do serviço
      const sanitizedData = sanitizeServiceData(serviceData);
      
      // Verificar se o nome foi alterado e se já existe outro serviço com o mesmo nome
      if (sanitizedData.nome && sanitizedData.nome !== existingService.nome) {
        const serviceWithSameName = await executeWithRetry(
          () => serviceRepository.findByName(sanitizedData.nome),
          'findServiceByName',
          { nome: sanitizedData.nome }
        );
        
        if (serviceWithSameName && serviceWithSameName.id !== Number(id)) {
          log(`Já existe outro serviço com o nome "${sanitizedData.nome}" (ID: ${serviceWithSameName.id})`, 'error', 'pricing');
          throw new Error(`Já existe outro serviço com o nome "${sanitizedData.nome}"`);
        }
      }
      
      // Atualizar serviço no banco
      const updatedService = await executeWithRetry(
        () => serviceRepository.update(id, sanitizedData),
        'updateService',
        { id, ...sanitizedData }
      );
      
      log(`Serviço ID ${id} atualizado com sucesso`, 'info', 'pricing');
      
      // Atualizar definição de demonstração se necessário
      if (environment.env === 'development') {
        try {
          updateDemonstrationService(updatedService);
          log('Definição de demonstração atualizada', 'info', 'pricing');
        } catch (updateError) {
          logError('updateDemoDefinition', updateError, { serviceId: id });
        }
      }
      
      return updatedService;
    } catch (error) {
      logError('updateService', error, { id, ...serviceData });
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
      log(`Removendo serviço ID ${id}`, 'info', 'pricing');
      
      // Verificar se o serviço existe
      const existingService = await executeWithRetry(
        () => serviceRepository.findById(id),
        'findServiceById',
        { id }
      );
      
      if (!existingService) {
        log(`Serviço com ID ${id} não encontrado para remoção`, 'error', 'pricing');
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      // Remover serviço do banco
      await executeWithRetry(
        () => serviceRepository.delete(id),
        'deleteService',
        { id }
      );
      
      log(`Serviço ID ${id} removido com sucesso`, 'info', 'pricing');
      
      return { success: true, message: `Serviço ID ${id} removido com sucesso` };
    } catch (error) {
      logError('deleteService', error, { id });
      throw error;
    }
  }

  /**
   * Calcula o preço de um serviço com base em parâmetros adicionais
   * @param {number} serviceId ID do serviço
   * @param {Object} parameters Parâmetros para cálculo do preço
   * @returns {Promise<Object>} Resultado do cálculo
   */
  async calculatePrice(serviceId, parameters = {}) {
    try {
      log(`Calculando preço para serviço ID ${serviceId} com parâmetros: ${JSON.stringify(parameters)}`, 'info', 'pricing');
      
      // Buscar serviço
      const service = await this.getServiceById(serviceId);
      
      if (!service) {
        throw new Error(`Serviço com ID ${serviceId} não encontrado`);
      }
      
      // Preço base do serviço
      let finalPrice = service.preco_base;
      
      // Aplicar modificadores com base nos parâmetros
      if (parameters.urgente && parameters.urgente === true) {
        finalPrice *= 1.2; // Adiciona 20% para urgência
      }
      
      if (parameters.quantidade && typeof parameters.quantidade === 'number') {
        // Desconto por quantidade
        if (parameters.quantidade >= 10) {
          finalPrice *= 0.9; // 10% de desconto para 10 ou mais
        } else if (parameters.quantidade >= 5) {
          finalPrice *= 0.95; // 5% de desconto para 5 ou mais
        }
        
        // Multiplicar pelo número de itens
        finalPrice *= parameters.quantidade;
      }
      
      // Arredondar para duas casas decimais
      finalPrice = Math.round(finalPrice * 100) / 100;
      
      log(`Preço calculado para serviço ID ${serviceId}: R$ ${finalPrice.toFixed(2)}`, 'info', 'pricing');
      
      return {
        serviceId,
        serviceName: service.nome,
        basePrice: service.preco_base,
        parameters,
        finalPrice,
        currency: 'BRL'
      };
    } catch (error) {
      logError('calculatePrice', error, { serviceId, parameters });
      throw error;
    }
  }
}

// Exportar uma instância única do serviço
export default new PricingService();
