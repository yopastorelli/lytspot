import prisma from '../prisma/client.js';
import { clearCache } from '../middleware/cache.js';

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
      const servicos = await prisma.servico.findMany({
        orderBy: {
          nome: 'asc'
        }
      });
      
      return res.status(200).json(servicos);
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
      
      return res.status(200).json(servico);
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
      
      // Limpar o cache quando um novo serviço é criado
      clearCache('/api/pricing');
      
      return res.status(201).json(novoServico);
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
      
      // Limpar o cache quando um serviço é atualizado
      clearCache('/api/pricing');
      clearCache(`/api/pricing/${id}`);
      
      return res.status(200).json(servicoAtualizado);
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
