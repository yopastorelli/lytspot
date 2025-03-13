import { Router } from 'express';
import { sendEmail } from '../services/emailService.js';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const router = Router();

router.post(
  '/',
  [
    // Validações
    body('name').notEmpty().withMessage('O nome é obrigatório.'),
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('message').notEmpty().withMessage('A mensagem é obrigatória.'),
    body('phone').optional(),
    body('service').optional(),
  ],
  async (req, res) => {
    logger.info('Nova requisição recebida no endpoint /api/contact', {
      endpoint: '/api/contact',
      method: 'POST',
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou', { errors: errors.array() });
      return res.status(400).json({
        errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
      });
    }

    const { name, email, message, phone, service } = req.body;

    try {
      logger.info('Tentando enviar e-mail...', { name, email });
      const result = await sendEmail({
        to: process.env.RECIPIENT_EMAIL || 'contato@lytspot.com', // Destinatário configurado na variável de ambiente
        subject: `Novo contato de ${name}`,
        text: `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone || 'Não informado'}\nServiço: ${service || 'Não informado'}\nMensagem:\n${message}`,
        html: `
          <h2>Novo contato recebido</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
          <p><strong>Serviço de interesse:</strong> ${service || 'Não informado'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      });

      // Responder com base no resultado
      if (result.mode === 'local') {
        logger.info('Mensagem salva localmente', { result });
        return res.status(200).json({
          success: true,
          message: 'Mensagem recebida com sucesso! (Modo de desenvolvimento)',
          mode: 'local'
        });
      } else {
        logger.info('E-mail enviado com sucesso', { messageId: result.messageId });
        return res.status(200).json({
          success: true,
          message: 'Mensagem enviada com sucesso!',
          mode: 'smtp'
        });
      }
    } catch (error) {
      logger.error('Erro ao enviar e-mail', { error: error.message });
      return res.status(500).json({
        error: 'Erro ao enviar a mensagem. Tente novamente mais tarde.'
      });
    }
  }
);

export default router;
