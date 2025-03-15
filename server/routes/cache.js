/**
 * Rotas para gerenciamento de cache
 * @description Endpoints para limpar e verificar o status do cache da API
 * @version 1.0.0 - 2025-03-14
 */

import express from 'express';
import { clearCache, getCacheStatus } from '../middleware/cache.js';
import { authenticateJWT } from '../middleware/auth.js';

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
 * @access Privado (requer autenticação)
 */
router.get('/clear', authenticateJWT, (req, res) => {
  try {
    clearCache();
    res.status(200).json({ message: 'Cache limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    res.status(500).json({ error: 'Erro ao limpar cache' });
  }
});

/**
 * @route GET /api/cache/dev/clear
 * @description Limpa o cache da API (apenas em ambiente de desenvolvimento)
 * @access Público
 * @version 1.0.0 - 2025-03-15 - Adicionado para facilitar testes durante o desenvolvimento
 */
router.get('/dev/clear', (req, res) => {
  try {
    const env = process.env.NODE_ENV || 'development';
    if (env !== 'production') {
      clearCache();
      console.log('[Cache] Cache limpo via rota de desenvolvimento');
      res.status(200).json({ 
        message: 'Cache limpo com sucesso (modo desenvolvimento)',
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('[Cache] Tentativa de limpar cache em produção via rota de desenvolvimento');
      res.status(403).json({ 
        error: 'Esta rota só está disponível em ambiente de desenvolvimento'
      });
    }
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    res.status(500).json({ error: 'Erro ao limpar cache' });
  }
});

/**
 * @route GET /api/cache/clear/key
 * @description Limpa o cache da API por chave
 * @access Público
 * @query {string} key - Chave específica para limpar (opcional)
 */
router.get('/clear/key', (req, res) => {
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
