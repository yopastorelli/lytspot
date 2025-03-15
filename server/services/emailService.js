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
 * @returns {Object} - Transportador SMTP configurado.
 */
function createTransporter() {
  // Usar diretamente as configurações que funcionaram no teste
  const SMTP_HOST = 'smtppro.zoho.com';
  const SMTP_PORT = '465';
  const SMTP_USER = 'daniel@lytspot.com.br';
  const SMTP_PASS = 'RG02AJwZgA7w';
  const SMTP_SECURE = 'true';

  // Registrar as configurações SMTP para debug
  logger.info('Usando configurações SMTP fixas:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER ? 'definido' : 'não definido',
    pass: SMTP_PASS ? 'definido' : 'não definido',
    secure: SMTP_SECURE
  });

  // Verificar se devemos usar Gmail diretamente
  const useGmail = false; // Desativado para usar Zoho
  
  if (useGmail) {
    logger.info('Usando Gmail como transportador em ambiente de desenvolvimento');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lytspot.contato@gmail.com',
        pass: 'yfkl wnzc rvqm jmrp', // Senha de aplicativo
      },
      secure: true,
      debug: true,
    });
  }

  logger.info('Criando transportador SMTP com configurações fixas');

  // Converter string 'true'/'false' para boolean
  const secure = SMTP_SECURE === 'true';
  
  // Criar transportador com mais opções de debug
  const transporterConfig = {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '465', 10),
    secure: secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    debug: true, // Ativar debug para mais informações
    logger: true, // Usar logger interno do nodemailer
    tls: {
      // Não verificar certificado para evitar problemas de conexão
      rejectUnauthorized: false
    }
  };
  
  logger.info('Configuração do transportador:', JSON.stringify({
    ...transporterConfig,
    auth: { user: transporterConfig.auth.user, pass: '***' } // Ocultar senha nos logs
  }));
  
  return nodemailer.createTransport(transporterConfig);
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
  logger.info('Iniciando envio de e-mail', { 
    to: options.to, 
    subject: options.subject,
    env: process.env.NODE_ENV
  });
  
  // Log detalhado das configurações SMTP no início da função
  logger.info('Configurações SMTP no início do envio:', {
    host: 'smtppro.zoho.com',
    port: '465',
    user: 'daniel@lytspot.com.br',
    pass: 'definido',
    secure: 'true'
  });
  
  try {
    // Criar transportador SMTP com as configurações atualizadas
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Lytspot Contato" <daniel@lytspot.com.br>`,
      to: options.to || 'contato@lytspot.com.br',
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    try {
      // Tentar enviar o email
      logger.info('Tentando enviar e-mail via SMTP...', { to: mailOptions.to });
      const info = await transporter.sendMail(mailOptions);
      logger.info('E-mail enviado com sucesso', { messageId: info.messageId });
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (smtpError) {
      // Se falhar, registrar o erro e tentar método alternativo
      logger.error('Erro ao enviar e-mail', { error: smtpError.message });
      logger.error('Erro de autenticação SMTP. Verificando configurações alternativas...');
      
      // Tentar com Gmail como alternativa
      try {
        logger.info('Tentando enviar com configurações SMTP alternativas');
        const transporterGmail = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'lytspot.contato@gmail.com',
            pass: 'yfkl wnzc rvqm jmrp', // Senha de aplicativo
          },
          secure: true,
          debug: true,
        });
        
        const gmailInfo = await transporterGmail.sendMail(mailOptions);
        logger.info('E-mail enviado com sucesso via Gmail', { messageId: gmailInfo.messageId });
        return { success: true, messageId: gmailInfo.messageId, mode: 'gmail' };
      } catch (gmailError) {
        logger.error('Falha também com configuração SMTP alternativa', { error: gmailError.message });
        
        // Se estamos em desenvolvimento, salvar a mensagem localmente
        if (process.env.NODE_ENV === 'development') {
          logger.info('Tentando salvar mensagem localmente após falha no envio SMTP');
          const savedMessage = await saveMessageLocally(mailOptions);
          logger.info('Mensagem salva com sucesso em arquivo local');
          return { success: true, savedMessage, mode: 'local' };
        }
        
        // Se não estamos em desenvolvimento, propagar o erro
        throw new Error(`Falha ao enviar e-mail: ${smtpError.message}`);
      }
    }
  } catch (error) {
    logger.error('Erro crítico no serviço de e-mail', { error: error.message });
    
    // Em desenvolvimento, tentar salvar localmente como último recurso
    if (process.env.NODE_ENV === 'development') {
      try {
        logger.info('Tentando salvar mensagem localmente como último recurso');
        const mailOptions = {
          from: options.from || `"Lytspot Contato" <daniel@lytspot.com.br>`,
          to: options.to || 'contato@lytspot.com.br',
          subject: options.subject,
          text: options.text,
          html: options.html,
        };
        const savedMessage = await saveMessageLocally(mailOptions);
        logger.info('Mensagem salva localmente');
        return { success: true, savedMessage, mode: 'local' };
      } catch (saveError) {
        logger.error('Falha ao salvar mensagem localmente', { error: saveError.message });
        throw error; // Propagar o erro original
      }
    }
    
    throw error; // Propagar o erro
  }
}

/**
 * Salva uma mensagem em um arquivo local como fallback quando SMTP não está disponível
 * @param {Object} message - A mensagem a ser salva
 * @returns {Promise<void>}
 */
async function saveMessageLocally(message) {
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
