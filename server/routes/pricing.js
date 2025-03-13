import express from 'express';
import { body, param } from 'express-validator';
import { pricingController } from '../controllers/pricingController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Validações para criação e atualização de serviços
const servicoValidations = [
  body('nome')
    .notEmpty().withMessage('O nome é obrigatório')
    .isString().withMessage('O nome deve ser uma string')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
  
  body('descricao')
    .notEmpty().withMessage('A descrição é obrigatória')
    .isString().withMessage('A descrição deve ser uma string'),
  
  body('preco_base')
    .notEmpty().withMessage('O preço base é obrigatório')
    .isFloat({ min: 0 }).withMessage('O preço base deve ser um número positivo'),
  
  body('duracao_media_captura')
    .notEmpty().withMessage('A duração média de captura é obrigatória')
    .isString().withMessage('A duração média de captura deve ser uma string'),
  
  body('duracao_media_tratamento')
    .notEmpty().withMessage('A duração média de tratamento é obrigatória')
    .isString().withMessage('A duração média de tratamento deve ser uma string'),
  
  body('entregaveis')
    .notEmpty().withMessage('Os entregáveis são obrigatórios')
    .isString().withMessage('Os entregáveis devem ser uma string'),
  
  body('possiveis_adicionais')
    .optional()
    .isString().withMessage('Os possíveis adicionais devem ser uma string'),
  
  body('valor_deslocamento')
    .optional()
    .isString().withMessage('O valor de deslocamento deve ser uma string')
];

// Validação para o ID do serviço
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('O ID deve ser um número inteiro positivo')
];

// Rotas públicas
router.get('/', cacheMiddleware(300), pricingController.getAllServices);
router.get('/:id', cacheMiddleware(300), idValidation, validate, pricingController.getServiceById);

// Rotas protegidas (requerem autenticação)
router.post('/', authenticateJWT, servicoValidations, validate, pricingController.createService);
router.put('/:id', authenticateJWT, [...idValidation, ...servicoValidations], validate, pricingController.updateService);
router.delete('/:id', authenticateJWT, idValidation, validate, pricingController.deleteService);

export default router;
