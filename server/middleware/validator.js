import { validationResult } from 'express-validator';

/**
 * Middleware para validação de dados
 * Verifica se há erros de validação e retorna uma resposta com os erros
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  
  next();
};
