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
    // Validações - tornando todos os campos opcionais para permitir diferentes formatos
    body('name').optional(),
    body('nome').optional(),
    body('email').optional().isEmail().withMessage('E-mail inválido.'),
    body('message').optional(),
    body('mensagem').optional(),
    body('phone').optional(),
    body('telefone').optional(),
    body('service').optional(),
    body('metodoContato').optional(),
    body('tipo').optional(),
    body('servicos').optional().isArray(),
    body('adicionais').optional().isArray(),
    body('deslocamento').optional(),
    body('precoTotal').optional().isNumeric(),
    body('tempoEstimado').optional().isNumeric(),
  ],
  async (req, res) => {
    logger.info('Nova requisição recebida no endpoint /api/contact', {
      endpoint: '/api/contact',
      method: 'POST',
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validação falhou', { errors: errors.array() });
      
      // Verificar se é apenas o erro de email inválido quando o email está vazio
      // Isso permite que requisições sem email passem quando são do tipo orçamento
      const apenasEmailInvalido = errors.array().length === 1 && 
                                 errors.array()[0].param === 'email' && 
                                 (!req.body.email || req.body.email === '');
      
      const tipoOrcamento = req.body.tipo === 'orcamento';
      
      // Se for apenas o erro de email inválido em um orçamento, permitir continuar
      if (!(apenasEmailInvalido && tipoOrcamento)) {
        return res.status(400).json({
          errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
        });
      }
      
      // Log para debug
      logger.info('Permitindo requisição de orçamento mesmo com email vazio');
    }

    // Compatibilidade com diferentes formatos de dados (formulário de contato ou orçamento)
    const { 
      name, nome, email, message, mensagem, phone, telefone, service, 
      metodoContato, tipo, servicos, adicionais, deslocamento, precoTotal, tempoEstimado 
    } = req.body;

    // Determinar se é um orçamento ou contato normal
    const isOrcamento = tipo === 'orcamento';

    // Preparar conteúdo do email com base no tipo
    let subject, text, html;

    if (isOrcamento) {
      // Formatação para orçamento
      subject = `Novo orçamento de ${nome || name}`;
      
      // Preparar detalhes dos serviços para o email
      const servicosDetalhes = servicos?.map(s => 
        `- ${s.nome} (${s.quantidade}x): ${formatMoney(s.precoUnitario)} cada = ${formatMoney(s.precoTotal)}`
      ).join('\n') || 'Nenhum serviço selecionado';
      
      // Preparar detalhes dos adicionais para o email
      const adicionaisDetalhes = adicionais?.length > 0 
        ? adicionais.map(a => `- ${a.nome}: ${formatMoney(a.valor)}`).join('\n')
        : 'Nenhum adicional selecionado';
      
      // Texto do email
      text = `
        NOVO ORÇAMENTO RECEBIDO
        
        Informações de Contato:
        Nome: ${nome || name}
        E-mail: ${email}
        Telefone: ${telefone || phone || 'Não informado'}
        Método de contato preferido: ${metodoContato || 'Não informado'}
        
        Serviços Selecionados:
        ${servicosDetalhes}
        
        Adicionais:
        ${adicionaisDetalhes}
        
        ${deslocamento?.incluido ? `Taxa de Deslocamento: ${formatMoney(deslocamento.valor)}` : 'Sem taxa de deslocamento'}
        
        Preço Total: ${formatMoney(precoTotal)}
        Tempo Estimado de Entrega: ${tempoEstimado} dias
        
        Mensagem Adicional:
        ${mensagem || message || 'Nenhuma mensagem adicional'}
      `;
      
      // HTML do email
      html = `
        <h2>Novo Orçamento Recebido</h2>
        
        <h3>Informações de Contato</h3>
        <p><strong>Nome:</strong> ${nome || name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone || phone || 'Não informado'}</p>
        <p><strong>Método de contato preferido:</strong> ${metodoContato || 'Não informado'}</p>
        
        <h3>Serviços Selecionados</h3>
        ${servicos?.length > 0 ? '<ul>' + servicos.map(s => 
          `<li><strong>${s.nome}</strong> (${s.quantidade}x): ${formatMoney(s.precoUnitario)} cada = ${formatMoney(s.precoTotal)}</li>`
        ).join('') + '</ul>' : '<p>Nenhum serviço selecionado</p>'}
        
        <h3>Adicionais</h3>
        ${adicionais?.length > 0 ? '<ul>' + adicionais.map(a => 
          `<li><strong>${a.nome}:</strong> ${formatMoney(a.valor)}</li>`
        ).join('') + '</ul>' : '<p>Nenhum adicional selecionado</p>'}
        
        ${deslocamento?.incluido ? `<p><strong>Taxa de Deslocamento:</strong> ${formatMoney(deslocamento.valor)}</p>` : '<p>Sem taxa de deslocamento</p>'}
        
        <h3>Resumo</h3>
        <p><strong>Preço Total:</strong> ${formatMoney(precoTotal)}</p>
        <p><strong>Tempo Estimado de Entrega:</strong> ${tempoEstimado} dias</p>
        
        <h3>Mensagem Adicional</h3>
        <p>${(mensagem || message || 'Nenhuma mensagem adicional').replace(/\n/g, '<br>')}</p>
      `;
    } else {
      // Formatação para contato normal (mantém o formato original)
      subject = `Novo contato de ${name || nome}`;
      text = `Nome: ${name || nome}\nE-mail: ${email}\nTelefone: ${phone || telefone || 'Não informado'}\nServiço: ${service || 'Não informado'}\nMensagem:\n${message || mensagem}`;
      html = `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${name || nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone || telefone || 'Não informado'}</p>
        <p><strong>Serviço de interesse:</strong> ${service || 'Não informado'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${(message || mensagem || '').replace(/\n/g, '<br>')}</p>
      `;
    }

    try {
      logger.info(`Tentando enviar e-mail ${isOrcamento ? 'de orçamento' : 'de contato'}...`, { 
        email, 
        tipo: isOrcamento ? 'orcamento' : 'contato' 
      });
      
      const result = await sendEmail({
        to: process.env.RECIPIENT_EMAIL || 'contato@lytspot.com', // Destinatário configurado na variável de ambiente
        subject,
        text,
        html
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

// Função auxiliar para formatação de valores monetários
function formatMoney(value) {
  if (value === undefined || value === null) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export default router;
