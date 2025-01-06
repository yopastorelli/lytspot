// /server/routes/contact.js
import { Router } from 'express';
import { sendEmail } from '../services/emailService.js';
import { body, validationResult } from 'express-validator';

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      await sendEmail({
        to: process.env.RECIPIENT_EMAIL,
        subject: `Novo contato de ${name}`,
        text: `Nome: ${name}\nE-mail: ${email}\nMensagem:\n${message}`,
      });

      res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      res.status(500).json({ error: 'Erro ao enviar a mensagem. Tente novamente mais tarde.' });
    }
  }
);

export default router;
