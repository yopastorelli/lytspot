import { Router } from 'express';
import { sendEmail } from '../services/emailService.js';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const router = Router();

router.post(
  '/contact',
  [
    // Validações
    body('name').notEmpty().withMessage('O nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('message').notEmpty().withMessage('A mensagem é obrigatória.'),
  ],
  async (req, res) => {
    logger.info('Nova requisição recebida no endpoint /contact', {
      endpoint: '/contact',
      method: 'POST',
      body: req.body,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      logger.info('Enviando email de contato', { name, email });
      await sendEmail({
        to: process.env.RECIPIENT_EMAIL,
        subject: `Novo contato de ${name}`,
        text: `Nome: ${name}\nE-mail: ${email}\nMensagem:\n${message}`,
      });

      logger.info('Email enviado com sucesso', { name, email });
      res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      logger.error('Erro ao enviar email', { error, body: req.body });
      res.status(500).json({
        error: 'Erro ao enviar a mensagem. Tente novamente mais tarde.',
      });
    }
  }
);

export default router;
