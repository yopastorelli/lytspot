// /server/services/emailService.js
import nodemailer from 'nodemailer';

/**
 * Cria e retorna o transportador SMTP configurado.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Configurações SMTP ausentes. Verifique as variáveis de ambiente.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Envia um e-mail com base nas opções fornecidas.
 * @param {Object} options - Opções para envio do e-mail.
 * @param {string} options.to - Destinatário do e-mail.
 * @param {string} options.subject - Assunto do e-mail.
 * @param {string} options.text - Corpo do e-mail em texto simples.
 * @param {string} [options.html] - Corpo do e-mail em HTML (opcional).
 */
export async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html, // Opcional: suporta HTML no e-mail.
  };

  return transporter.sendMail(mailOptions);
}
