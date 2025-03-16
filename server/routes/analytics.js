/**
 * Rotas de analytics para o LytSpot
 * @version 1.0.0 - 2025-03-15
 */

import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Rota para receber métricas de Web Vitals
 * Aceita requisições POST com dados de performance
 */
router.post('/web-vitals', (req, res) => {
  try {
    const metric = req.body;
    
    // Validar dados recebidos
    if (!metric || !metric.name || !metric.value) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados de métrica inválidos' 
      });
    }
    
    // Registrar métricas no log
    logger.info(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.id}) - ${metric.url || 'URL não especificada'}`);
    
    // Aqui você pode implementar o armazenamento das métricas em um banco de dados
    // ou enviar para um serviço de analytics externo
    
    return res.status(200).json({ 
      success: true, 
      message: 'Métrica recebida com sucesso' 
    });
  } catch (error) {
    logger.error(`[Web Vitals] Erro ao processar métrica: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar métrica' 
    });
  }
});

/**
 * Rota para lidar com requisições OPTIONS (preflight CORS)
 * Responde imediatamente para evitar erros 405
 */
router.options('/web-vitals', (req, res) => {
  res.status(204).end();
});

/**
 * Rota para receber eventos de página
 * Registra visualizações de página e eventos de usuário
 */
router.post('/page-event', (req, res) => {
  try {
    const event = req.body;
    
    // Validar dados recebidos
    if (!event || !event.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados de evento inválidos' 
      });
    }
    
    // Registrar evento no log
    logger.info(`[Page Event] ${event.type}: ${event.url || 'URL não especificada'} - ${event.details || 'Sem detalhes'}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Evento recebido com sucesso' 
    });
  } catch (error) {
    logger.error(`[Page Event] Erro ao processar evento: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar evento' 
    });
  }
});

/**
 * Rota para lidar com requisições OPTIONS (preflight CORS)
 * Responde imediatamente para evitar erros 405
 */
router.options('/page-event', (req, res) => {
  res.status(204).end();
});

// Rota fallback para qualquer outra requisição para analytics
router.all('*', (req, res) => {
  logger.warn(`[Analytics] Requisição não suportada: ${req.method} ${req.originalUrl}`);
  res.status(204).end(); // Responder com 204 No Content para evitar erros no console
});

export default router;
