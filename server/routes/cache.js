/**
 * Rotas para gerenciamento de cache
 * @description Endpoints para limpar e verificar o status do cache da API
 * @version 1.0.0 - 2025-03-14
 */

import express from 'express';
import { clearCache, getCacheStatus } from '../middleware/cache.js';

const router = express.Router();

/**
 * @route GET /api/cache/status
 * @description Retorna o status atual do cache
 * @access Público
 */
router.get('/status', (req, res) => {
  try {
    const status = getCacheStatus();
    return res.json({
      success: true,
      message: 'Status do cache obtido com sucesso',
      data: status
    });
  } catch (error) {
    console.error('Erro ao obter status do cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter status do cache',
      error: error.message
    });
  }
});

/**
 * @route GET /api/cache/clear
 * @description Limpa o cache da API
 * @access Público
 * @query {string} key - Chave específica para limpar (opcional)
 */
router.get('/clear', (req, res) => {
  try {
    const { key } = req.query;
    
    if (key) {
      console.log(`Solicitação para limpar cache com chave: ${key}`);
      clearCache(key);
      return res.json({
        success: true,
        message: `Cache para chave "${key}" limpo com sucesso`
      });
    } else {
      console.log('Solicitação para limpar todo o cache');
      clearCache();
      return res.json({
        success: true,
        message: 'Cache completo limpo com sucesso'
      });
    }
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache',
      error: error.message
    });
  }
});

export default router;
