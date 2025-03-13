import { validationResult } from 'express-validator';
import { log } from '../utils/dbUtils.js';

/**
 * Middleware para validação de dados
 * Verifica se há erros de validação e retorna uma resposta com os erros
 * 
 * @version 1.1.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    log(`Validação falhou para ${req.originalUrl}: ${JSON.stringify(formattedErrors)}`, 'warn', 'validator');
    
    return res.status(400).json({ 
      errors: formattedErrors
    });
  }
  
  log(`Validação bem-sucedida para ${req.originalUrl}`, 'debug', 'validator');
  next();
};
