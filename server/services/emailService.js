import nodemailer from 'nodemailer';
import { log, logError } from '../utils/dbUtils.js';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Cria e retorna o transportador SMTP configurado.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  // Registrar as configurações SMTP para debug
  log('Configurações SMTP: ' + 
    `host: ${SMTP_HOST || 'não definido'}, ` +
    `port: ${SMTP_PORT || 'não definido'}, ` +
    `user: ${SMTP_USER ? 'definido' : 'não definido'}, ` +
    `pass: ${SMTP_PASS ? 'definido' : 'não definido'}, ` +
    `secure: ${SMTP_SECURE || 'não definido'}`, 
    'debug', 'email'
  );

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logError('Configurações SMTP ausentes', new Error('Configurações SMTP ausentes. Verifique as variáveis de ambiente.'), 'email');
    throw new Error('Configurações SMTP ausentes. Verifique as variáveis de ambiente.');
  }

  log(`Criando transportador SMTP: host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${SMTP_SECURE === 'true'}`, 'debug', 'email');

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
  log(`Iniciando envio de e-mail para ${options.to}: ${options.subject}`, 'info', 'email');
  
  try {
    // Verificar se as configurações SMTP estão disponíveis
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      log('Configurações SMTP ausentes. Salvando mensagem localmente.', 'warn', 'email');
      
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
    
    log(`Enviando e-mail: ${JSON.stringify({to: options.to, subject: options.subject})}`, 'debug', 'email');
    
    const info = await transporter.sendMail(mailOptions);
    
    log(`E-mail enviado com sucesso: messageId=${info.messageId}, response=${info.response}`, 'info', 'email');
    
    return {
      success: true,
      messageId: info.messageId,
      mode: 'smtp'
    };
  } catch (error) {
    logError('Erro ao enviar e-mail', error, 'email', { to: options.to, subject: options.subject });
    
    // Tentar salvar localmente em caso de falha no envio
    try {
      log('Tentando salvar mensagem localmente após falha no envio SMTP', 'info', 'email');
      
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
      logError('Falha ao salvar mensagem localmente', saveError, 'email');
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
    
    log(`Mensagem salva com sucesso em arquivo local: ${filePath}`, 'info', 'email');
    
    return { success: true, filePath };
  } catch (error) {
    logError('Erro ao salvar mensagem em arquivo', error, 'email');
    throw error;
  }
}
