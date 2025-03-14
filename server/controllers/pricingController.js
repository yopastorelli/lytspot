/**
 * Controlador de Preços
 * 
 * Responsável por gerenciar as operações relacionadas a serviços e preços,
 * incluindo listagem, criação, atualização, exclusão e cálculo de preços.
 * 
 * @version 1.7.0 - 2025-03-14 - Adicionados logs detalhados para diagnóstico em produção
 * @module controllers/pricingController
 */

import pricingService from '../services/pricingService.js';
import serviceValidator from '../validators/serviceValidator.js';
import serviceTransformer from '../transformers/serviceTransformer.js';
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
      console.log('[pricingController] Iniciando getAllServices...');
      
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
        console.log('[pricingController] Buscando serviços do banco de dados com opções:', JSON.stringify(options));
        const servicos = await pricingService.getAllServices(options);
        console.log(`[pricingController] Encontrados ${servicos.length} serviços no banco de dados`);
        
        // Log da estrutura antes da transformação (apenas o primeiro serviço como exemplo)
        if (servicos.length > 0) {
          console.log('[pricingController] Exemplo de estrutura antes da transformação:');
          const exemploServico = { ...servicos[0] };
          console.log(JSON.stringify(exemploServico, null, 2).substring(0, 500) + (JSON.stringify(exemploServico).length > 500 ? '...' : ''));
        }
        
        // Transformar serviços para o formato esperado pelo frontend
        console.log('[pricingController] Transformando serviços para o formato do simulador...');
        const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicos);
        
        // Log da estrutura após a transformação (apenas o primeiro serviço como exemplo)
        if (servicosTransformados.length > 0) {
          console.log('[pricingController] Exemplo de estrutura após a transformação:');
          const exemploTransformado = { ...servicosTransformados[0] };
          console.log(JSON.stringify(exemploTransformado, null, 2).substring(0, 500) + (JSON.stringify(exemploTransformado).length > 500 ? '...' : ''));
        }
        
        console.log('[pricingController] Retornando resposta com serviços transformados');
        return res.status(200).json(servicosTransformados);
      } catch (dbError) {
        console.error('[pricingController] Erro ao buscar serviços do banco de dados:', dbError);
        
        // Fallback para dados de demonstração
        console.log('[pricingController] Usando dados de demonstração como fallback...');
        const demoServices = pricingService.getDemonstrationData();
        
        if (demoServices && demoServices.length > 0) {
          console.log(`[pricingController] Obtidos ${demoServices.length} serviços de demonstração`);
          
          // Log da estrutura antes da transformação (apenas o primeiro serviço como exemplo)
          if (demoServices.length > 0) {
            console.log('[pricingController] Exemplo de estrutura de demonstração antes da transformação:');
            const exemploDemo = { ...demoServices[0] };
            console.log(JSON.stringify(exemploDemo, null, 2).substring(0, 500) + (JSON.stringify(exemploDemo).length > 500 ? '...' : ''));
          }
          
          // Transformar dados de demonstração também
          console.log('[pricingController] Transformando serviços de demonstração...');
          const demoServicesTransformed = serviceTransformer.toSimulatorFormatList(demoServices);
          
          // Log da estrutura após a transformação (apenas o primeiro serviço como exemplo)
          if (demoServicesTransformed.length > 0) {
            console.log('[pricingController] Exemplo de estrutura de demonstração após a transformação:');
            const exemploTransformado = { ...demoServicesTransformed[0] };
            console.log(JSON.stringify(exemploTransformado, null, 2).substring(0, 500) + (JSON.stringify(exemploTransformado).length > 500 ? '...' : ''));
          }
          
          console.log('[pricingController] Retornando resposta com serviços de demonstração transformados');
          return res.status(200).json(demoServicesTransformed);
        } else {
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      console.error('[pricingController] Erro ao buscar serviços:', error);
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
      console.log(`[pricingController] Iniciando getServiceById para ID: ${id}...`);
      
      if (!id || isNaN(parseInt(id))) {
        console.log(`[pricingController] ID inválido: ${id}`);
        return res.status(400).json({ message: 'ID de serviço inválido' });
      }
      
      try {
        // Tentar buscar serviço do banco de dados
        console.log(`[pricingController] Buscando serviço com ID ${id} no banco de dados...`);
        const servico = await pricingService.getServiceById(parseInt(id));
        
        // Log da estrutura antes da transformação
        console.log('[pricingController] Estrutura do serviço antes da transformação:');
        console.log(JSON.stringify(servico, null, 2).substring(0, 500) + (JSON.stringify(servico).length > 500 ? '...' : ''));
        
        // Transformar serviço para o formato esperado pelo frontend
        console.log('[pricingController] Transformando serviço para o formato do simulador...');
        const servicoTransformado = serviceTransformer.toSimulatorFormat(servico);
        
        // Log da estrutura após a transformação
        console.log('[pricingController] Estrutura do serviço após a transformação:');
        console.log(JSON.stringify(servicoTransformado, null, 2).substring(0, 500) + (JSON.stringify(servicoTransformado).length > 500 ? '...' : ''));
        
        console.log('[pricingController] Retornando resposta com serviço transformado');
        return res.status(200).json(servicoTransformado);
      } catch (dbError) {
        console.error('[pricingController] Erro ao buscar serviço do banco de dados:', dbError);
        
        // Fallback para dados de demonstração
        console.log(`[pricingController] Usando dados de demonstração como fallback para ID ${id}...`);
        const demoService = pricingService.getDemonstrationData().find(s => s.id === parseInt(id));
        
        if (demoService) {
          console.log('[pricingController] Serviço de demonstração encontrado');
          
          // Log da estrutura antes da transformação
          console.log('[pricingController] Estrutura do serviço de demonstração antes da transformação:');
          console.log(JSON.stringify(demoService, null, 2).substring(0, 500) + (JSON.stringify(demoService).length > 500 ? '...' : ''));
          
          // Transformar serviço de demonstração também
          console.log('[pricingController] Transformando serviço de demonstração...');
          const demoServiceTransformed = serviceTransformer.toSimulatorFormat(demoService);
          
          // Log da estrutura após a transformação
          console.log('[pricingController] Estrutura do serviço de demonstração após a transformação:');
          console.log(JSON.stringify(demoServiceTransformed, null, 2).substring(0, 500) + (JSON.stringify(demoServiceTransformed).length > 500 ? '...' : ''));
          
          console.log('[pricingController] Retornando resposta com serviço de demonstração transformado');
          return res.status(200).json(demoServiceTransformed);
        } else {
          console.log(`[pricingController] Serviço com ID ${id} não encontrado nos dados de demonstração`);
          throw new Error('Não foi possível obter dados de demonstração');
        }
      }
    } catch (error) {
      console.error('[pricingController] Erro ao buscar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar serviço',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Criar um novo serviço
   * 
   * @version 1.2.0 - 2025-03-13 - Melhorada a validação e tratamento de erros
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o serviço criado ou mensagem de erro
   */
  createService: async (req, res) => {
    try {
      console.log('=== DEBUG createService ===');
      console.log('Dados recebidos:', req.body);
      
      // Validar dados do serviço
      const validationResult = serviceValidator.validate(req.body);
      
      if (!validationResult.isValid) {
        console.log('Validação falhou:', validationResult.errors);
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
      
      // Transformar serviço criado para o formato esperado pelo frontend
      const novoServicoTransformado = serviceTransformer.toSimulatorFormat(novoServico);
      
      // Limpar o cache quando um novo serviço é criado
      clearCache('/api/pricing');
      
      console.log('Serviço criado com sucesso:', novoServicoTransformado);
      return res.status(201).json(novoServicoTransformado);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      
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
   * @version 1.3.0 - 2025-03-13 - Melhorada a validação e tratamento de erros
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o serviço atualizado ou mensagem de erro
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
        
        // Garantir que o ID seja mantido no objeto de dados
        const dadosAtualizados = {
          ...req.body,
          id: parseInt(id)
        };
        
        // Atualizar serviço através do serviço
        const servicoAtualizado = await pricingService.updateService(parseInt(id), dadosAtualizados);
        
        // Transformar serviço atualizado para o formato esperado pelo frontend
        const servicoAtualizadoTransformado = serviceTransformer.toSimulatorFormat(servicoAtualizado);
        
        // Limpar o cache quando um serviço é atualizado
        clearCache('/api/pricing');
        clearCache(`/api/pricing/${id}`);
        
        console.log('Serviço atualizado com sucesso:', servicoAtualizadoTransformado);
        return res.status(200).json(servicoAtualizadoTransformado);
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
