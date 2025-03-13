/**
 * Controlador de Preços
 * 
 * Responsável por gerenciar as operações relacionadas a serviços e preços,
 * incluindo listagem, criação, atualização, exclusão e cálculo de preços.
 * 
 * @version 1.6.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
 * @module controllers/pricingController
 */

import pricingService from '../services/pricingService.js';
import serviceValidator from '../validators/serviceValidator.js';
import { clearCache } from '../middleware/cache.js';
import environment from '../config/environment.js';
import { log, logError } from '../utils/dbUtils.js';

/**
 * Controlador para o módulo de preços
 * Responsável por gerenciar os serviços e seus preços
 */
export const pricingController = {
  /**
   * Obter todos os serviços
   */
  getAllServices: async (req, res) => {
    try {
      // Validar e normalizar parâmetros de consulta
      const queryParams = serviceValidator.validateQueryParams(req.query);
      
      log(`Buscando serviços com parâmetros: ${JSON.stringify(queryParams)}`, 'info', 'controller');
      
      // Preparar opções para a consulta
      const options = {
        orderBy: { [queryParams.sortBy]: queryParams.sortOrder },
        take: queryParams.limit,
        skip: (queryParams.page - 1) * queryParams.limit
      };
      
      // Adicionar filtros se necessário
      if (queryParams.search) {
        options.where = {
          OR: [
            { nome: { contains: queryParams.search, mode: 'insensitive' } },
            { descricao: { contains: queryParams.search, mode: 'insensitive' } }
          ]
        };
      }
      
      if (queryParams.minPrice || queryParams.maxPrice) {
        options.where = options.where || {};
        options.where.preco_base = {};
        
        if (queryParams.minPrice) {
          options.where.preco_base.gte = queryParams.minPrice;
        }
        
        if (queryParams.maxPrice) {
          options.where.preco_base.lte = queryParams.maxPrice;
        }
      }
      
      try {
        // Tentar buscar serviços do banco de dados
        const servicos = await pricingService.getAllServices(options);
        log(`Encontrados ${servicos.length} serviços`, 'info', 'controller');
        return res.status(200).json(servicos);
      } catch (dbError) {
        logError('Erro ao buscar serviços do banco de dados', dbError, 'controller', options);
        
        // Fallback para dados de demonstração
        log('Usando dados de demonstração como fallback', 'warn', 'controller');
        const demoServices = pricingService.getDemonstrationData();
        
        if (demoServices && demoServices.length > 0) {
          return res.status(200).json(demoServices);
        } else {
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      logError('Erro ao processar requisição de serviços', error, 'controller');
      return res.status(500).json({ 
        message: 'Erro ao buscar serviços',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Obter um serviço específico pelo ID
   */
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        log(`ID de serviço inválido: ${id}`, 'warn', 'controller');
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      log(`Buscando serviço com ID: ${id}`, 'info', 'controller');
      
      try {
        // Tentar buscar serviço do banco de dados
        const servico = await pricingService.getServiceById(parseInt(id));
        log(`Serviço encontrado: ${servico ? servico.id : 'não encontrado'}`, 'info', 'controller');
        return res.status(200).json(servico);
      } catch (dbError) {
        logError(`Erro ao buscar serviço com ID ${id}`, dbError, 'controller');
        
        // Fallback para dados de demonstração
        log('Usando dados de demonstração como fallback', 'warn', 'controller');
        const demoService = pricingService.getDemonstrationData().find(s => s.id === parseInt(id));
        
        if (demoService) {
          return res.status(200).json(demoService);
        } else {
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      logError(`Erro ao processar requisição de serviço por ID`, error, 'controller');
      return res.status(500).json({ 
        message: 'Erro ao buscar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Criar um novo serviço
   * 
   * @version 1.3.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o serviço criado ou mensagem de erro
   */
  createService: async (req, res) => {
    try {
      log(`Criando novo serviço: ${JSON.stringify(req.body)}`, 'info', 'controller');
      
      // Validar dados do serviço
      const validationResult = serviceValidator.validate(req.body);
      
      if (!validationResult.isValid) {
        log(`Validação falhou: ${JSON.stringify(validationResult.errors)}`, 'warn', 'controller');
        return res.status(400).json({ 
          message: 'Dados de serviço inválidos',
          errors: validationResult.errors
        });
      }
      
      // Sanitizar dados antes de criar o serviço
      const dadosSanitizados = {
        ...req.body,
        // Garantir que o ID não seja enviado na criação
        id: undefined
      };
      
      // Criar serviço através do serviço
      const novoServico = await pricingService.createService(dadosSanitizados);
      
      // Limpar o cache quando um novo serviço é criado
      clearCache('/api/pricing');
      
      log(`Serviço criado com sucesso: ID ${novoServico.id}`, 'info', 'controller');
      return res.status(201).json(novoServico);
    } catch (error) {
      logError('Erro ao criar serviço', error, 'controller', req.body);
      
      // Verificar se é um erro de duplicação
      if (error.message && error.message.includes('Já existe um serviço')) {
        return res.status(409).json({ 
          message: error.message
        });
      }
      
      return res.status(500).json({ 
        message: 'Erro ao criar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Atualizar um serviço existente
   * 
   * @version 1.4.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o serviço atualizado ou mensagem de erro
   */
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      
      log(`Atualizando serviço ID ${id}: ${JSON.stringify(req.body)}`, 'info', 'controller');
      
      if (!id || isNaN(parseInt(id))) {
        log(`ID inválido: ${id}`, 'warn', 'controller');
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      // Validar dados do serviço
      const validationResult = serviceValidator.validate(req.body);
      
      if (!validationResult.isValid) {
        log(`Validação falhou: ${JSON.stringify(validationResult.errors)}`, 'warn', 'controller');
        return res.status(400).json({ 
          message: 'Dados de serviço inválidos',
          errors: validationResult.errors
        });
      }
      
      // Verificar se o serviço existe
      const servicoExistente = await pricingService.getServiceById(parseInt(id));
      
      if (!servicoExistente) {
        log(`Serviço não encontrado para atualização: ID ${id}`, 'warn', 'controller');
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      
      // Atualizar serviço
      const servicoAtualizado = await pricingService.updateService(parseInt(id), req.body);
      
      // Limpar o cache quando um serviço é atualizado
      clearCache('/api/pricing');
      clearCache(`/api/pricing/${id}`);
      
      log(`Serviço atualizado com sucesso: ID ${servicoAtualizado.id}`, 'info', 'controller');
      return res.status(200).json(servicoAtualizado);
    } catch (error) {
      logError(`Erro ao atualizar serviço ID ${req.params.id}`, error, 'controller', req.body);
      return res.status(500).json({ 
        message: 'Erro ao atualizar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Excluir um serviço
   * 
   * @version 1.2.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o serviço excluído ou mensagem de erro
   */
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      
      log(`Excluindo serviço ID ${id}`, 'info', 'controller');
      
      if (!id || isNaN(parseInt(id))) {
        log(`ID inválido: ${id}`, 'warn', 'controller');
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      // Verificar se o serviço existe
      const servicoExistente = await pricingService.getServiceById(parseInt(id));
      
      if (!servicoExistente) {
        log(`Serviço não encontrado para exclusão: ID ${id}`, 'warn', 'controller');
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      
      // Excluir serviço
      const servicoExcluido = await pricingService.deleteService(parseInt(id));
      
      // Limpar o cache quando um serviço é excluído
      clearCache('/api/pricing');
      clearCache(`/api/pricing/${id}`);
      
      log(`Serviço excluído com sucesso: ID ${id}`, 'info', 'controller');
      return res.status(200).json(servicoExcluido);
    } catch (error) {
      logError(`Erro ao excluir serviço ID ${req.params.id}`, error, 'controller');
      return res.status(500).json({ 
        message: 'Erro ao excluir serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Calcular preço de um serviço com base nas opções selecionadas
   * 
   * @version 1.2.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o preço calculado ou mensagem de erro
   */
  calculatePrice: async (req, res) => {
    try {
      const { serviceId } = req.params;
      const options = req.body;
      
      log(`Calculando preço para serviço ID ${serviceId} com opções: ${JSON.stringify(options)}`, 'info', 'controller');
      
      if (!serviceId || isNaN(parseInt(serviceId))) {
        log(`ID de serviço inválido: ${serviceId}`, 'warn', 'controller');
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      // Calcular preço
      const result = await pricingService.calculatePrice(parseInt(serviceId), options);
      
      log(`Preço calculado com sucesso: ${result.total}`, 'info', 'controller');
      return res.status(200).json(result);
    } catch (error) {
      logError(`Erro ao calcular preço para serviço ID ${req.params.serviceId}`, error, 'controller', req.body);
      return res.status(500).json({ 
        message: 'Erro ao calcular preço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  }
};
