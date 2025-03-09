import express from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Validações para registro e login
const registerValidations = [
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Email inválido'),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória')
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  
  body('nome')
    .notEmpty().withMessage('O nome é obrigatório')
    .isString().withMessage('O nome deve ser uma string')
];

const loginValidations = [
  body('email')
    .notEmpty().withMessage('O email é obrigatório')
    .isEmail().withMessage('Email inválido'),
  
  body('password')
    .notEmpty().withMessage('A senha é obrigatória')
];

// Rotas de autenticação
router.post('/register', registerValidations, validate, authController.register);
router.post('/login', loginValidations, validate, authController.login);
router.get('/verify', authenticateJWT, authController.verifyToken);

export default router;
