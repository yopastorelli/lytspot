/**
 * Rotas de analytics para o LytSpot
 * @version 1.1.0 - 2025-03-16 - Melhorada compatibilidade com o formato de dados do cliente
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
    
    // Log para debug em produção
    console.log(`[Analytics] Recebida métrica Web Vitals: ${JSON.stringify(metric, null, 2)}`);
    
    // Validar dados recebidos (formato flexível para compatibilidade)
    if (!metric) {
      return res.status(400).json({ 
        success: false, 
        message: 'Corpo da requisição vazio' 
      });
    }
    
    // Extrair informações relevantes com fallbacks para diferentes formatos
    const metricName = metric.name || metric.id || 'unknown';
    const metricValue = metric.value || metric.delta || 0;
    const metricId = metric.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metricUrl = metric.url || metric.path || metric.hostname || req.headers.referer || 'URL não especificada';
    
    // Registrar métricas no log
    logger.info(`[Web Vitals] ${metricName}: ${metricValue} (${metricId}) - ${metricUrl}`);
    
    // Aqui você pode implementar o armazenamento das métricas em um banco de dados
    // ou enviar para um serviço de analytics externo
    
    return res.status(200).json({ 
      success: true, 
      message: 'Métrica recebida com sucesso',
      received: {
        name: metricName,
        value: metricValue,
        id: metricId
      }
    });
  } catch (error) {
    console.error(`[Analytics] Erro ao processar métrica: ${error.message}`, error);
    logger.error(`[Web Vitals] Erro ao processar métrica: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar métrica',
      error: error.message
    });
  }
});

/**
 * Rota para lidar com requisições OPTIONS (preflight CORS)
 * Responde imediatamente para evitar erros 405
 */
router.options('/web-vitals', (req, res) => {
  // Adicionar cabeçalhos CORS explicitamente
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  res.status(204).end();
});

/**
 * Rota para receber eventos de página
 * Registra visualizações de página e eventos de usuário
 */
router.post('/page-event', (req, res) => {
  try {
    const event = req.body;
    
    // Log para debug em produção
    console.log(`[Analytics] Recebido evento de página: ${JSON.stringify(event, null, 2)}`);
    
    // Validar dados recebidos (formato flexível para compatibilidade)
    if (!event) {
      return res.status(400).json({ 
        success: false, 
        message: 'Corpo da requisição vazio' 
      });
    }
    
    // Extrair informações relevantes com fallbacks para diferentes formatos
    const eventType = event.type || event.name || event.action || 'unknown';
    const eventUrl = event.url || event.path || event.hostname || req.headers.referer || 'URL não especificada';
    const eventDetails = event.details || event.data || event.metadata || 'Sem detalhes';
    
    // Registrar evento no log
    logger.info(`[Page Event] ${eventType}: ${eventUrl} - ${typeof eventDetails === 'object' ? JSON.stringify(eventDetails) : eventDetails}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Evento recebido com sucesso',
      received: {
        type: eventType,
        url: eventUrl
      }
    });
  } catch (error) {
    console.error(`[Analytics] Erro ao processar evento de página: ${error.message}`, error);
    logger.error(`[Page Event] Erro ao processar evento: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar evento',
      error: error.message
    });
  }
});

/**
 * Rota para lidar com requisições OPTIONS (preflight CORS)
 * Responde imediatamente para evitar erros 405
 */
router.options('/page-event', (req, res) => {
  // Adicionar cabeçalhos CORS explicitamente
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  res.status(204).end();
});

// Rota fallback para qualquer outra requisição para analytics
router.all('*', (req, res) => {
  logger.warn(`[Analytics] Requisição não suportada: ${req.method} ${req.originalUrl}`);
  res.status(204).end(); // Responder com 204 No Content para evitar erros no console
});

export default router;
