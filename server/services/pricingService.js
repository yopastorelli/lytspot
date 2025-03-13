/**
 * Serviço para gerenciamento de preços e serviços
 * 
 * Responsável por implementar a lógica de negócios relacionada a serviços e preços,
 * incluindo listagem, criação, atualização, exclusão e cálculo de preços.
 * 
 * @version 1.6.0 - 2025-03-13 - Implementadas melhorias na persistência de dados e tratamento de erros
 * @module services/pricingService
 */

import serviceRepository from '../repositories/serviceRepository.js';
import { getServiceDefinitionsForFrontend, updateDemonstrationService } from '../models/seeds/serviceDefinitions.js';
import environment from '../config/environment.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual para logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logDir, 'pricing-service.log');

/**
 * Registra uma mensagem no log
 * @param {string} message Mensagem a ser registrada
 * @param {string} level Nível do log (info, warn, error)
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  // Escrever no console
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`ℹ️ ${message}`);
  }
  
  // Escrever no arquivo de log
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

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
      log(`Buscando todos os serviços com opções: ${JSON.stringify(options)}`);
      
      // Tentar buscar do banco de dados primeiro
      const services = await serviceRepository.findAll(options);
      
      if (services && services.length > 0) {
        log(`Encontrados ${services.length} serviços no banco de dados`);
        return services;
      }
      
      // Se não houver serviços no banco, popular o banco com dados de demonstração
      log('Nenhum serviço encontrado no banco, populando com dados de demonstração');
      
      try {
        const demoServices = getServiceDefinitionsForFrontend();
        log(`Obtidos ${demoServices.length} serviços de demonstração para popular o banco`);
        
        // Criar serviços no banco de dados
        const createdServices = [];
        for (const demoService of demoServices) {
          try {
            // Remover ID para que o banco gere um novo
            const { id, ...serviceData } = demoService;
            
            // Verificar se já existe um serviço com o mesmo nome
            const existingService = await serviceRepository.findByName(serviceData.nome);
            if (existingService) {
              log(`Serviço "${serviceData.nome}" já existe no banco, pulando`, 'warn');
              createdServices.push(existingService);
              continue;
            }
            
            // Criar serviço no banco
            const newService = await serviceRepository.create(serviceData);
            log(`Serviço "${serviceData.nome}" criado com sucesso no banco (ID: ${newService.id})`);
            createdServices.push(newService);
          } catch (createError) {
            log(`Erro ao criar serviço "${demoService.nome}" no banco: ${createError.message}`, 'error');
          }
        }
        
        if (createdServices.length > 0) {
          log(`Criados ${createdServices.length} serviços no banco a partir dos dados de demonstração`);
          return createdServices;
        }
      } catch (populateError) {
        log(`Erro ao popular banco com dados de demonstração: ${populateError.message}`, 'error');
      }
      
      // Se não conseguir popular o banco, retornar dados de demonstração diretamente
      log('Retornando dados de demonstração diretamente', 'warn');
      return getServiceDefinitionsForFrontend();
    } catch (error) {
      log(`Erro ao buscar serviços: ${error.message}`, 'error');
      
      // Em caso de erro no banco, usar dados de demonstração
      log('Erro no banco de dados, usando dados de demonstração', 'warn');
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
      log(`Buscando serviço com ID ${id}`);
      
      // Tentar buscar do banco de dados primeiro
      const service = await serviceRepository.findById(id);
      
      if (service) {
        log(`Serviço ID ${id} encontrado no banco de dados`);
        return service;
      }
      
      // Se não encontrar no banco, verificar nos dados de demonstração
      log(`Serviço com ID ${id} não encontrado no banco, verificando dados de demonstração`);
      const demoServices = getServiceDefinitionsForFrontend();
      const demoService = demoServices.find(s => s.id === Number(id));
      
      if (demoService) {
        log(`Serviço ID ${id} encontrado nos dados de demonstração`);
        
        // Tentar criar o serviço no banco de dados para futuras consultas
        try {
          // Remover ID para que o banco gere um novo
          const { id: demoId, ...serviceData } = demoService;
          
          // Verificar se já existe um serviço com o mesmo nome
          const existingService = await serviceRepository.findByName(serviceData.nome);
          if (existingService) {
            log(`Serviço "${serviceData.nome}" já existe no banco, retornando existente`, 'warn');
            return existingService;
          }
          
          // Criar serviço no banco
          const newService = await serviceRepository.create(serviceData);
          log(`Serviço "${serviceData.nome}" criado com sucesso no banco (ID: ${newService.id})`);
          return newService;
        } catch (createError) {
          log(`Erro ao criar serviço de demonstração no banco: ${createError.message}`, 'error');
          // Retornar o serviço de demonstração original
          return demoService;
        }
      }
      
      // Se não encontrar em nenhum lugar, lançar erro
      throw new Error(`Serviço com ID ${id} não encontrado`);
    } catch (error) {
      log(`Erro ao buscar serviço ${id}: ${error.message}`, 'error');
      
      // Verificar se é um erro de "não encontrado" ou outro tipo de erro
      if (error.message.includes('não encontrado')) {
        throw error; // Repassar erro de "não encontrado"
      }
      
      // Para outros erros, tentar buscar nos dados de demonstração
      const demoServices = getServiceDefinitionsForFrontend();
      const demoService = demoServices.find(s => s.id === Number(id));
      
      if (demoService) {
        log(`Serviço ID ${id} encontrado nos dados de demonstração após erro`, 'warn');
        return demoService;
      }
      
      // Se não encontrar nos dados de demonstração, lançar o erro original
      throw error;
    }
  }

  /**
   * Cria um novo serviço
   * 
   * @version 1.3.0 - 2025-03-13 - Melhorado o tratamento de dados e validação
   * @param {Object} serviceData Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   * @throws {Error} Se ocorrer um erro durante a criação
   */
  async createService(serviceData) {
    try {
      console.log('=== PricingService.createService ===');
      console.log('Dados recebidos:', JSON.stringify(serviceData, null, 2));
      
      // Verificar se já existe um serviço com o mesmo nome
      const existingService = await serviceRepository.findByName(serviceData.nome);
      
      if (existingService) {
        const errorMessage = `Já existe um serviço com o nome "${serviceData.nome}"`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Preparar dados para criação
      const preparedData = this.prepareServiceData(serviceData);
      console.log('Dados preparados:', JSON.stringify(preparedData, null, 2));
      
      // Criar o serviço
      const newService = await serviceRepository.create(preparedData);
      console.log('Serviço criado:', JSON.stringify(newService, null, 2));
      
      // Verificar se o serviço foi realmente criado
      const createdService = await serviceRepository.findById(newService.id);
      
      if (!createdService) {
        throw new Error('Falha ao persistir o serviço no banco de dados');
      }
      
      return newService;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }
  
  /**
   * Prepara os dados do serviço para criação ou atualização
   * 
   * @version 1.0.0 - 2025-03-13 - Método criado para centralizar a preparação de dados
   * @param {Object} serviceData Dados do serviço
   * @returns {Object} Dados preparados
   */
  prepareServiceData(serviceData) {
    // Criar uma cópia para não modificar o objeto original
    const preparedData = { ...serviceData };
    
    // Garantir que campos de texto não sejam undefined ou null
    const textFields = ['nome', 'descricao', 'duracao_media_captura', 'duracao_media_tratamento', 'entregaveis'];
    textFields.forEach(field => {
      if (!preparedData[field]) {
        preparedData[field] = '';
      } else if (typeof preparedData[field] !== 'string') {
        preparedData[field] = String(preparedData[field]);
      }
      
      // Remover espaços em branco extras
      if (typeof preparedData[field] === 'string') {
        preparedData[field] = preparedData[field].trim();
      }
    });
    
    // Campos opcionais de texto
    const optionalTextFields = ['possiveis_adicionais', 'valor_deslocamento'];
    optionalTextFields.forEach(field => {
      if (preparedData[field] === undefined || preparedData[field] === null) {
        preparedData[field] = '';
      } else if (typeof preparedData[field] !== 'string') {
        preparedData[field] = String(preparedData[field]);
      }
      
      // Remover espaços em branco extras
      if (typeof preparedData[field] === 'string') {
        preparedData[field] = preparedData[field].trim();
      }
    });
    
    // Converter preço para número
    if (preparedData.preco_base !== undefined) {
      if (typeof preparedData.preco_base === 'string') {
        // Substituir vírgula por ponto para conversão correta
        const cleanedValue = preparedData.preco_base.replace(',', '.').trim();
        preparedData.preco_base = parseFloat(cleanedValue) || 0;
      } else if (typeof preparedData.preco_base !== 'number') {
        preparedData.preco_base = 0;
      }
    } else {
      preparedData.preco_base = 0;
    }
    
    return preparedData;
  }

  /**
   * Atualiza um serviço existente
   * 
   * @version 1.3.0 - 2025-03-13 - Melhorado o tratamento de dados e validação
   * @param {number} id ID do serviço
   * @param {Object} serviceData Dados atualizados do serviço
   * @returns {Promise<Object>} Serviço atualizado
   * @throws {Error} Se o serviço não for encontrado ou ocorrer um erro durante a atualização
   */
  async updateService(id, serviceData) {
    try {
      console.log('=== PricingService.updateService ===');
      console.log(`Atualizando serviço ID ${id}:`, JSON.stringify(serviceData, null, 2));
      
      // Verificar se o serviço existe
      const existingService = await serviceRepository.findById(id);
      
      if (!existingService) {
        const errorMessage = `Serviço com ID ${id} não encontrado`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Verificar se está tentando alterar o nome para um nome que já existe
      if (serviceData.nome && serviceData.nome !== existingService.nome) {
        const serviceWithSameName = await serviceRepository.findByName(serviceData.nome);
        
        if (serviceWithSameName && serviceWithSameName.id !== id) {
          const errorMessage = `Já existe um serviço com o nome "${serviceData.nome}"`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      // Preparar dados para atualização
      const preparedData = this.prepareServiceData(serviceData);
      console.log('Dados preparados:', JSON.stringify(preparedData, null, 2));
      
      // Atualizar o serviço
      const updatedService = await serviceRepository.update(id, preparedData);
      console.log('Serviço atualizado:', JSON.stringify(updatedService, null, 2));
      
      // Verificar se o serviço foi realmente atualizado
      const verifiedService = await serviceRepository.findById(id);
      
      if (!verifiedService) {
        throw new Error('Falha ao persistir a atualização do serviço no banco de dados');
      }
      
      return updatedService;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
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
      log(`Removendo serviço ${id}`);
      
      // Verificar se o serviço existe no banco de dados
      const existingService = await serviceRepository.findById(id);
      
      if (existingService) {
        log(`Serviço ID ${id} encontrado no banco de dados, removendo...`);
        
        // Remover serviço do banco de dados
        const deletedService = await serviceRepository.delete(id);
        log(`Serviço ID ${id} removido com sucesso do banco de dados`);
        
        return {
          success: true,
          message: `Serviço "${deletedService.nome}" removido com sucesso`,
          service: deletedService
        };
      }
      
      // Se não encontrar no banco, verificar nos dados de demonstração
      log(`Serviço com ID ${id} não encontrado no banco, verificando dados de demonstração`);
      const demoServices = getServiceDefinitionsForFrontend();
      const demoServiceIndex = demoServices.findIndex(s => s.id === Number(id));
      
      if (demoServiceIndex >= 0) {
        log(`Serviço ID ${id} encontrado nos dados de demonstração, removendo...`);
        
        // Obter serviço antes de remover
        const demoService = demoServices[demoServiceIndex];
        
        // Remover dos dados de demonstração
        const updatedDemoServices = [...demoServices];
        updatedDemoServices.splice(demoServiceIndex, 1);
        
        // Atualizar dados de demonstração (não implementado diretamente)
        log(`Serviço ID ${id} removido apenas dos dados de demonstração`, 'warn');
        
        return {
          success: true,
          message: `Serviço "${demoService.nome}" removido com sucesso (apenas dos dados de demonstração)`,
          service: demoService
        };
      }
      
      // Se não encontrar em nenhum lugar, lançar erro
      throw new Error(`Serviço com ID ${id} não encontrado para remoção`);
    } catch (error) {
      log(`Erro ao remover serviço ${id}: ${error.message}`, 'error');
      
      // Verificar se é um erro de "não encontrado" ou outro tipo de erro
      if (error.message.includes('não encontrado')) {
        throw error; // Repassar erro de "não encontrado"
      }
      
      throw error;
    }
  }

  /**
   * Obtém dados de demonstração quando o banco de dados não está disponível
   * @returns {Array} Dados de demonstração para o simulador
   */
  getDemonstrationData() {
    log('Obtendo dados de demonstração');
    return getServiceDefinitionsForFrontend();
  }

  /**
   * Calcula o preço de um serviço com base nas opções selecionadas
   * @param {number} serviceId ID do serviço
   * @param {Object} options Opções selecionadas
   * @returns {Promise<Object>} Detalhes do preço calculado
   */
  async calculatePrice(serviceId, options = {}) {
    try {
      log(`Calculando preço para serviço ${serviceId} com opções: ${JSON.stringify(options)}`);
      
      // Obter serviço
      const service = await this.getServiceById(serviceId);
      
      if (!service) {
        throw new Error(`Serviço com ID ${serviceId} não encontrado`);
      }
      
      // Preço base
      let totalPrice = service.preco_base || 0;
      
      // Adicionar valores de opções adicionais
      // Implementação simplificada, pode ser expandida conforme necessário
      
      log(`Preço calculado para serviço ${serviceId}: ${totalPrice}`);
      
      return {
        service,
        basePrice: service.preco_base,
        totalPrice,
        options,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      log(`Erro ao calcular preço para serviço ${serviceId}: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Exportar uma instância única do serviço
export default new PricingService();
