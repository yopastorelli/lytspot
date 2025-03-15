import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.development' });

// Função para testar as configurações SMTP
async function testSmtp() {
  console.log('Iniciando teste de configurações SMTP...');
  
  // Exibir configurações SMTP
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  console.log('Configurações SMTP carregadas:');
  console.log(`Host: ${SMTP_HOST || 'não definido'}`);
  console.log(`Port: ${SMTP_PORT || 'não definido'}`);
  console.log(`User: ${SMTP_USER ? 'definido' : 'não definido'}`);
  console.log(`Pass: ${SMTP_PASS ? 'definido' : 'não definido'}`);
  console.log(`Secure: ${SMTP_SECURE || 'não definido'}`);
  
  try {
    // Configurar transportador Zoho
    console.log('\nTestando configurações Zoho...');
    const transporterZoho = nodemailer.createTransport({
      host: SMTP_HOST || 'smtppro.zoho.com',
      port: parseInt(SMTP_PORT || '465', 10),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER || 'daniel@lytspot.com.br',
        pass: SMTP_PASS || 'RG02AJwZgA7w',
      },
      debug: true,
      tls: {
        rejectUnauthorized: false // Não verificar certificado para teste
      }
    });
    
    // Verificar conexão
    console.log('Verificando conexão com o servidor Zoho...');
    const zohoVerify = await transporterZoho.verify();
    console.log('Conexão com Zoho verificada:', zohoVerify);
    
    // Enviar email de teste
    console.log('Enviando email de teste via Zoho...');
    const zohoInfo = await transporterZoho.sendMail({
      from: `"Teste Lytspot" <${SMTP_USER || 'daniel@lytspot.com.br'}>`,
      to: 'contato@lytspot.com.br',
      subject: 'Teste SMTP Zoho',
      text: 'Este é um email de teste enviado pelo script de teste SMTP.',
      html: '<p>Este é um email de teste enviado pelo script de teste SMTP.</p>',
    });
    
    console.log('Email enviado via Zoho:', zohoInfo.messageId);
  } catch (zohoError) {
    console.error('Erro com Zoho:', zohoError);
    
    // Tentar com Gmail como alternativa
    try {
      console.log('\nTestando configurações Gmail alternativas...');
      const transporterGmail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'lytspot.contato@gmail.com',
          pass: 'yfkl wnzc rvqm jmrp', // Senha de aplicativo
        },
        secure: true,
        debug: true,
      });
      
      // Verificar conexão
      console.log('Verificando conexão com o Gmail...');
      const gmailVerify = await transporterGmail.verify();
      console.log('Conexão com Gmail verificada:', gmailVerify);
      
      // Enviar email de teste
      console.log('Enviando email de teste via Gmail...');
      const gmailInfo = await transporterGmail.sendMail({
        from: '"Teste Lytspot" <lytspot.contato@gmail.com>',
        to: 'contato@lytspot.com.br',
        subject: 'Teste SMTP Gmail',
        text: 'Este é um email de teste enviado pelo script de teste SMTP.',
        html: '<p>Este é um email de teste enviado pelo script de teste SMTP.</p>',
      });
      
      console.log('Email enviado via Gmail:', gmailInfo.messageId);
    } catch (gmailError) {
      console.error('Erro com Gmail:', gmailError);
    }
  }
}

// Executar o teste
testSmtp().catch(console.error);
