import nodemailer from 'nodemailer';
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

/**
 * Cria e retorna o transportador SMTP configurado.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.error('Configurações SMTP ausentes');
    throw new Error('Configurações SMTP ausentes. Verifique as variáveis de ambiente.');
  }

  logger.debug('Criando transportador SMTP', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE === 'true',
  });

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587, // Porta padrão 587 para SMTP
    secure: SMTP_SECURE === 'true', // Conexão segura baseada na variável de ambiente
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
    html,
  };

  try {
    logger.info('Iniciando envio de e-mail', { to, subject });
    const result = await transporter.sendMail(mailOptions);
    logger.info('E-mail enviado com sucesso', { messageId: result.messageId });
    return result;
  } catch (error) {
    logger.error('Erro ao enviar e-mail', { to, subject, error: error.message });
    throw new Error('Erro ao enviar e-mail. Verifique as configurações e tente novamente.');
  }
}
