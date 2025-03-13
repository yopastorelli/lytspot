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

  // Registrar as configurações SMTP para debug
  logger.debug('Configurações SMTP:', {
    host: SMTP_HOST || 'não definido',
    port: SMTP_PORT || 'não definido',
    user: SMTP_USER ? 'definido' : 'não definido',
    pass: SMTP_PASS ? 'definido' : 'não definido',
    secure: SMTP_SECURE || 'não definido'
  });

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.error('Configurações SMTP ausentes');
    throw new Error('Configurações SMTP ausentes. Verifique as variáveis de ambiente.');
  }

  logger.debug('Criando transportador SMTP', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE === 'true',
  });

  // Converter string 'true'/'false' para boolean
  const secure = SMTP_SECURE === 'true';
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '465', 10),
    secure: secure,
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
 * @returns {Promise<Object>} - Resultado do envio.
 */
export async function sendEmail(options) {
  logger.info('Iniciando envio de e-mail', { to: options.to, subject: options.subject });
  
  try {
    // Verificar se as configurações SMTP estão disponíveis
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      logger.warn('Configurações SMTP ausentes. Salvando mensagem localmente.');
      
      // Salvar a mensagem em um arquivo local como fallback
      await saveMessageToFile({
        to: options.to,
        from: options.from || 'contato@lytspot.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Mensagem salva localmente (modo de desenvolvimento)',
        mode: 'local'
      };
    }
    
    // Se temos configurações SMTP, enviar o e-mail normalmente
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Lytspot Contato" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    logger.debug('Enviando e-mail', mailOptions);
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('E-mail enviado com sucesso', {
      messageId: info.messageId,
      response: info.response,
    });
    
    return {
      success: true,
      messageId: info.messageId,
      mode: 'smtp'
    };
  } catch (error) {
    logger.error('Erro ao enviar e-mail', { error: error.message, stack: error.stack });
    
    // Tentar salvar localmente em caso de falha no envio
    try {
      logger.info('Tentando salvar mensagem localmente após falha no envio SMTP');
      
      await saveMessageToFile({
        to: options.to,
        from: options.from || 'contato@lytspot.com',
        subject: options.subject,
        text: options.text,
        html: options.html,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      return {
        success: true,
        message: 'Mensagem salva localmente após falha no envio',
        error: error.message,
        mode: 'local'
      };
    } catch (saveError) {
      logger.error('Falha ao salvar mensagem localmente', { error: saveError.message });
      throw new Error('Não foi possível enviar o e-mail nem salvar localmente: ' + error.message);
    }
  }
}

/**
 * Salva uma mensagem em um arquivo local como fallback quando SMTP não está disponível
 * @param {Object} message - A mensagem a ser salva
 * @returns {Promise<void>}
 */
async function saveMessageToFile(message) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    // Criar diretório de mensagens se não existir
    const messagesDir = path.resolve(process.cwd(), 'data', 'messages');
    
    try {
      await fs.mkdir(messagesDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    // Criar nome de arquivo único baseado no timestamp
    const filename = `message_${new Date().getTime()}.json`;
    const filePath = path.join(messagesDir, filename);
    
    // Salvar mensagem como JSON
    await fs.writeFile(filePath, JSON.stringify(message, null, 2), 'utf8');
    
    logger.info('Mensagem salva com sucesso em arquivo local', { filePath });
    
    return { success: true, filePath };
  } catch (error) {
    logger.error('Erro ao salvar mensagem em arquivo', { error: error.message });
    throw error;
  }
}
