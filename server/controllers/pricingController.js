import prisma from '../prisma/client.js';
import { clearCache } from '../middleware/cache.js';

/**
 * Transformador para converter dados do banco para o formato do PriceSimulator v2.8.0
 * @param {Object} servico - Serviço do banco de dados
 * @returns {Object} - Serviço no formato do PriceSimulator
 */
const transformarParaFormatoSimulador = (servico) => {
  // Calcula a duração média aproximada baseada nos campos individuais
  const duracaoCaptura = parseInt(servico.duracao_media_captura?.split(' ')[0] || 0);
  const duracaoTratamento = parseInt(servico.duracao_media_tratamento?.split(' ')[0] || 0);
  const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
  
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    preco_base: servico.preco_base,
    duracao_media: duracaoMedia,
    detalhes: {
      captura: servico.duracao_media_captura || '',
      tratamento: servico.duracao_media_tratamento || '',
      entregaveis: servico.entregaveis || '',
      adicionais: servico.possiveis_adicionais || '',
      deslocamento: servico.valor_deslocamento || ''
    },
    // Manter campos originais para compatibilidade com o banco
    duracao_media_captura: servico.duracao_media_captura,
    duracao_media_tratamento: servico.duracao_media_tratamento,
    entregaveis: servico.entregaveis,
    possiveis_adicionais: servico.possiveis_adicionais,
    valor_deslocamento: servico.valor_deslocamento,
    createdAt: servico.createdAt,
    updatedAt: servico.updatedAt
  };
};

/**
 * Controlador para o módulo de preços
 * Responsável por gerenciar os serviços e seus preços
 * @version 1.2.0 - Compatível com PriceSimulator 2.8.0
 */
export const pricingController = {
  /**
   * Obter todos os serviços
   */
  getAllServices: async (req, res) => {
    try {
      const servicos = await prisma.servico.findMany({
        orderBy: {
          nome: 'asc'
        }
      });
      
      // Transformar os serviços para o formato do PriceSimulator
      const servicosTransformados = servicos.map(transformarParaFormatoSimulador);
      
      return res.status(200).json(servicosTransformados);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar serviços',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Obter um serviço específico pelo ID
   */
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const servico = await prisma.servico.findUnique({
        where: {
          id: parseInt(id)
        }
      });
      
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      
      // Transformar o serviço para o formato do PriceSimulator
      const servicoTransformado = transformarParaFormatoSimulador(servico);
      
      return res.status(200).json(servicoTransformado);
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar serviço',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Criar um novo serviço
   */
  createService: async (req, res) => {
    try {
      const { 
        nome, 
        descricao, 
        preco_base, 
        duracao_media_captura,
        duracao_media_tratamento,
        entregaveis,
        possiveis_adicionais,
        valor_deslocamento
      } = req.body;
      
      const novoServico = await prisma.servico.create({
        data: {
          nome,
          descricao,
          preco_base: parseFloat(preco_base),
          duracao_media_captura,
          duracao_media_tratamento,
          entregaveis,
          possiveis_adicionais,
          valor_deslocamento
        }
      });
      
      // Transformar o serviço para o formato do PriceSimulator
      const novoServicoTransformado = transformarParaFormatoSimulador(novoServico);
      
      // Limpar o cache quando um novo serviço é criado
      clearCache('/api/pricing');
      
      return res.status(201).json(novoServicoTransformado);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao criar serviço',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Atualizar um serviço existente
   */
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        nome, 
        descricao, 
        preco_base, 
        duracao_media_captura,
        duracao_media_tratamento,
        entregaveis,
        possiveis_adicionais,
        valor_deslocamento
      } = req.body;
      
      // Verificar se o serviço existe
      const servicoExistente = await prisma.servico.findUnique({
        where: {
          id: parseInt(id)
        }
      });
      
      if (!servicoExistente) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      
      // Atualizar o serviço
      const servicoAtualizado = await prisma.servico.update({
        where: {
          id: parseInt(id)
        },
        data: {
          nome,
          descricao,
          preco_base: parseFloat(preco_base),
          duracao_media_captura,
          duracao_media_tratamento,
          entregaveis,
          possiveis_adicionais,
          valor_deslocamento,
          updatedAt: new Date()
        }
      });
      
      // Transformar o serviço para o formato do PriceSimulator
      const servicoAtualizadoTransformado = transformarParaFormatoSimulador(servicoAtualizado);
      
      // Limpar o cache quando um serviço é atualizado
      clearCache('/api/pricing');
      clearCache(`/api/pricing/${id}`);
      
      return res.status(200).json(servicoAtualizadoTransformado);
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao atualizar serviço',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Excluir um serviço
   */
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o serviço existe
      const servicoExistente = await prisma.servico.findUnique({
        where: {
          id: parseInt(id)
        }
      });
      
      if (!servicoExistente) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      
      // Excluir o serviço
      await prisma.servico.delete({
        where: {
          id: parseInt(id)
        }
      });
      
      // Limpar o cache quando um serviço é excluído
      clearCache('/api/pricing');
      clearCache(`/api/pricing/${id}`);
      
      return res.status(200).json({ message: 'Serviço excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      return res.status(500).json({ 
        message: 'Erro ao excluir serviço',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
