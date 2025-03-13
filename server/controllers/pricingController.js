/**
 * Controlador de Preços
 * @description Gerencia as requisições relacionadas a serviços e preços
 * @version 2.1.0 - 2025-03-12 - Adicionado mecanismo de fallback para dados de demonstração
 */

import pricingService from '../services/pricingService.js';
import serviceValidator from '../validators/serviceValidator.js';
import { clearCache } from '../middleware/cache.js';
import environment from '../config/environment.js';

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
        return res.status(200).json(servicos);
      } catch (dbError) {
        console.error('Erro ao buscar serviços do banco de dados:', dbError);
        
        // Fallback para dados de demonstração
        console.log('Usando dados de demonstração como fallback...');
        const demoServices = pricingService.getDemonstrationData();
        
        if (demoServices && demoServices.length > 0) {
          return res.status(200).json(demoServices);
        } else {
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
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
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      try {
        // Tentar buscar serviço do banco de dados
        const servico = await pricingService.getServiceById(parseInt(id));
        return res.status(200).json(servico);
      } catch (dbError) {
        console.error('Erro ao buscar serviço do banco de dados:', dbError);
        
        // Fallback para dados de demonstração
        console.log('Usando dados de demonstração como fallback...');
        const demoService = pricingService.getDemonstrationData().find(s => s.id === parseInt(id));
        
        if (demoService) {
          return res.status(200).json(demoService);
        } else {
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Criar um novo serviço
   */
  createService: async (req, res) => {
    try {
      // Validar dados do serviço
      const validationResult = serviceValidator.validate(req.body);
      
      if (!validationResult.isValid) {
        return res.status(400).json({ 
          message: 'Dados de serviço inválidos',
          errors: validationResult.errors
        });
      }
      
      // Criar serviço através do serviço
      const novoServico = await pricingService.createService(req.body);
      
      // Limpar o cache quando um novo serviço é criado
      clearCache('/api/pricing');
      
      return res.status(201).json(novoServico);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao criar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Atualizar um serviço existente
   */
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('=== DEBUG updateService ===');
      console.log('Parâmetros recebidos:', { id, body: req.body });
      
      if (!id || isNaN(parseInt(id))) {
        console.log('ID inválido:', id);
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      // Validar dados do serviço
      const validationResult = serviceValidator.validate(req.body);
      
      if (!validationResult.isValid) {
        console.log('Validação falhou:', validationResult.errors);
        return res.status(400).json({ 
          message: 'Dados de serviço inválidos',
          errors: validationResult.errors
        });
      }
      
      try {
        console.log('Tentando atualizar serviço com ID:', parseInt(id));
        // Verificar se o serviço existe antes de tentar atualizar
        const servicoExistente = await pricingService.getServiceById(parseInt(id));
        console.log('Serviço existente:', servicoExistente ? 'Encontrado' : 'Não encontrado');
        
        if (!servicoExistente) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        
        // Atualizar serviço através do serviço
        const servicoAtualizado = await pricingService.updateService(parseInt(id), req.body);
        
        // Limpar o cache quando um serviço é atualizado
        clearCache('/api/pricing');
        clearCache(`/api/pricing/${id}`);
        
        console.log('Serviço atualizado com sucesso:', servicoAtualizado);
        return res.status(200).json(servicoAtualizado);
      } catch (error) {
        console.error('Erro específico na atualização:', error);
        if (error.message && error.message.includes('não encontrado')) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro geral ao atualizar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao atualizar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Excluir um serviço
   */
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      try {
        // Excluir serviço através do serviço
        await pricingService.deleteService(parseInt(id));
        
        // Limpar o cache quando um serviço é excluído
        clearCache('/api/pricing');
        clearCache(`/api/pricing/${id}`);
        
        return res.status(200).json({ 
          message: `Serviço ${id} excluído com sucesso` 
        });
      } catch (error) {
        if (error.message.includes('não encontrado')) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao excluir serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },
  
  /**
   * Calcular preço de um serviço com base nas opções selecionadas
   */
  calculatePrice: async (req, res) => {
    try {
      const { id } = req.params;
      const options = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      try {
        // Calcular preço através do serviço
        const calculoPreco = await pricingService.calculatePrice(parseInt(id), options);
        return res.status(200).json(calculoPreco);
      } catch (error) {
        if (error.message.includes('não encontrado')) {
          return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      return res.status(500).json({ 
        message: 'Erro ao calcular preço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  }
};
