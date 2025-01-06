// /server/services/emailService.js

const nodemailer = require('nodemailer');

/**
 * Função para enviar e-mails.
 * @param {Object} options - Opções de envio do e-mail.
 * @param {string} options.to - Endereço do destinatário.
 * @param {string} options.subject - Assunto do e-mail.
 * @param {string} options.text - Texto do e-mail.
 * @throws {Error} Lança erro caso o envio falhe.
 */
async function sendEmail({ to, subject, text }) {
  // Configuração do transporte SMTP usando variáveis de ambiente
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para outras
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Opções do e-mail
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Endereço do remetente
    to,
    subject,
    text,
  };

  try {
    // Envia o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail');
  }
}

module.exports = { sendEmail };
