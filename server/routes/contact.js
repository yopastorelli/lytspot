// /server/routes/contact.js

const express = require('express');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// Rota para envio de e-mail
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    await sendEmail({
      to: process.env.RECIPIENT_EMAIL,
      subject: `Novo contato de ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`,
    });

    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar o contato:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

module.exports = router;
