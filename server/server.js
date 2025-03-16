import dotenv from 'dotenv';
import express from 'express';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './routes/contact.js';
import pricingRoutes from './routes/pricing.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import setupRoutes from './routes/setup.js';
import cacheRoutes from './routes/cache.js';
import analyticsRoutes from './routes/analytics.js';
import cors from 'cors';
import fs from 'fs';
import { ensureAdminUser } from './scripts/ensureAdminUser.js';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração manual das variáveis de ambiente críticas
process.env.PORT = '3000';
process.env.JWT_SECRET = 'f23e126b7f99a3e4553c65b3f558cb6a';
process.env.REFRESH_TOKEN = '1000.6ab986833897ab97d106448be3eb113.b49abb95c1838c9e7ff9e09deeb97794';
process.env.CLIENT_ID = 'lytspot-client';
process.env.CLIENT_SECRET = 'lytspot_client_secret_key_2025';
process.env.ACCOUNT_ID = 'lytspot-account';
process.env.SENDER_EMAIL = 'noreply@lytspot.com.br';
process.env.RECIPIENT_EMAIL = 'contato@lytspot.com.br';
process.env.BASE_URL = 'http://localhost:3000';
process.env.API_URL = 'http://localhost:3000/api';

// Configurações SMTP padrão para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.SMTP_HOST = process.env.SMTP_HOST || 'smtppro.zoho.com';
  process.env.SMTP_PORT = process.env.SMTP_PORT || '465';
  process.env.SMTP_USER = process.env.SMTP_USER || 'daniel@lytspot.com.br';
  process.env.SMTP_PASS = process.env.SMTP_PASS || 'RG02AJwZgA7w';
  process.env.SMTP_SECURE = process.env.SMTP_SECURE || 'true';
}

// Identificar se estamos no ambiente Render
if (process.env.RENDER) {
  console.log("Detectado ambiente Render. Configurando variáveis específicas...");
  process.env.RENDER = 'true';
}

console.log("Iniciando carregamento das variáveis de ambiente...");

// Carregar variáveis de ambiente apropriadas para o ambiente atual
if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  // Em desenvolvimento, tenta carregar .env.development primeiro, depois .env como fallback
  try {
    // Usar caminho absoluto para o arquivo .env.development
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    // Obter o diretório raiz do projeto (um nível acima do diretório server)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = __dirname; // Usar o diretório do servidor diretamente
    
    // Caminho completo para o arquivo .env.development
    const envPath = path.resolve(rootDir, '.env.development');
    
    console.log(`Tentando carregar variáveis de ambiente de: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.log('Arquivo .env.development não encontrado, tentando .env padrão...');
      dotenv.config({ path: path.resolve(rootDir, '.env') });
    } else {
      console.log('Variáveis de ambiente carregadas com sucesso de .env.development');
      
      // Verificar se as variáveis SMTP foram carregadas
      console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'Configurado' : 'Não configurado');
      console.log('SMTP_USER:', process.env.SMTP_USER ? 'Configurado' : 'Não configurado');
      console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Configurado' : 'Não configurado');
    }
  } catch (error) {
    console.error('Erro ao carregar variáveis de ambiente:', error);
  }
}

console.log("Inicializando o servidor...");

const app = express();
const baseUrl = 'http://localhost:3000';

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

try {
  logger.info('Iniciando aplicação...');
  console.log('Iniciando aplicação...');

  // Validação de variáveis de ambiente
  logger.info('Validando variáveis de ambiente...');
  console.log('Validando variáveis de ambiente...');
  const requiredEnvVars = [
    'BASE_URL',
    'REFRESH_TOKEN',
    'CLIENT_ID',
    'CLIENT_SECRET',
    'ACCOUNT_ID',
    'SENDER_EMAIL',
    'RECIPIENT_EMAIL',
    // Não vamos exigir as variáveis SMTP para permitir o modo de fallback
    // 'SMTP_HOST',
    // 'SMTP_USER',
    // 'SMTP_PASS',
  ];

  // Verificar JWT_SECRET separadamente e configurar um valor padrão se não existir
  if (!process.env.JWT_SECRET) {
    const defaultSecret = 'f23e126b7f99a3e4553c65b3f558cb6a'; // Mesmo valor usado no fallback
    logger.warn(`Variável de ambiente JWT_SECRET não encontrada. Usando valor padrão para desenvolvimento.`);
    console.warn(`Variável de ambiente JWT_SECRET não encontrada. Usando valor padrão para desenvolvimento.`);
    process.env.JWT_SECRET = defaultSecret;
  } else {
    logger.info('JWT_SECRET configurado corretamente.');
    console.log('JWT_SECRET configurado corretamente.');
  }

  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      logger.error(`Variável de ambiente ${key} não está configurada.`);
      console.error(`Variável de ambiente ${key} não está configurada.`);
      process.exit(1);
    }
  });
  logger.info('Todas as variáveis de ambiente estão configuradas.');
  console.log('Todas as variáveis de ambiente estão configuradas.');

  // Configuração de CORS adaptativa baseada no ambiente
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'https://lytspot.com.br',
    'https://www.lytspot.com.br',
    'http://lytspot.com.br',
    'http://www.lytspot.com.br',
    'https://lytspot.onrender.com',
    'https://lytspot-api.onrender.com',
    'https://lytspot.netlify.app',
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:3000',
    'http://192.168.1.189:4321'  // Adicionando IP local
  ];
  
  // Configuração CORS unificada e robusta
  const corsOptions = {
    origin: function (origin, callback) {
      // Log detalhado para diagnóstico
      console.log(`[CORS] Requisição de origem: ${origin || 'desconhecida'}`);
      
      // Permitir requisições sem origem (como apps mobile ou curl)
      if (!origin) {
        console.log('[CORS] Permitindo requisição sem origem');
        return callback(null, true);
      }
      
      // Em desenvolvimento, aceitar qualquer origem
      if (isDevelopment) {
        console.log(`[CORS] Modo desenvolvimento: permitindo origem ${origin}`);
        return callback(null, true);
      }
      
      // Em produção, verificar se a origem está na lista de origens permitidas
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] Origem permitida: ${origin}`);
        return callback(null, true);
      } else {
        // Para diagnóstico, permitir temporariamente qualquer origem em produção
        console.log(`[CORS] Origem não listada, mas permitindo para diagnóstico: ${origin}`);
        return callback(null, true);
      }
    },
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Source, Pragma',
    exposedHeaders: 'Content-Length, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    maxAge: 86400, // Cache de preflight por 24 horas (em segundos)
    preflightContinue: false, // Importante: não continuar após preflight
    optionsSuccessStatus: 204 // Alguns navegadores legados (IE11) não aceitam 204
  };
  
  // Aplicar middleware CORS antes de outros middlewares
  app.use(cors(corsOptions));
  
  // Adicionar middleware específico para OPTIONS para garantir resposta imediata
  app.options('*', (req, res) => {
    // Adicionar cabeçalhos CORS manualmente para garantir que estejam presentes
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || isDevelopment)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // Para diagnóstico, permitir qualquer origem temporariamente
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    // Adicionar outros cabeçalhos CORS necessários
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Source, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    console.log(`[CORS] Respondendo a requisição OPTIONS de ${req.headers.origin || 'origem desconhecida'} para ${req.path}`);
    res.status(204).end();
  });

  // Middleware para adicionar cabeçalhos CORS em todas as respostas (redundância intencional)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || isDevelopment)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // Para diagnóstico em produção, permitir temporariamente qualquer origem
      res.header('Access-Control-Allow-Origin', origin || '*');
      if (origin) {
        res.header('Access-Control-Allow-Credentials', 'true');
      }
    }
    next();
  });

  // Middleware para JSON e URL encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware para adicionar cabeçalhos de segurança e SEO
  app.use((req, res, next) => {
    // Cabeçalhos de segurança
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Cabeçalhos de cache para melhorar performance
    if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    // Registrar requisições para diagnóstico
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Rotas
  logger.info('Registrando rotas...');
  console.log('Registrando rotas...');
  
  // Rotas de contato
  app.use('/api/contact', contactRoutes);
  logger.info('Rotas de contato registradas.');
  console.log('Rotas de contato registradas.');
  
  // Rotas de preços
  app.use('/api/pricing', pricingRoutes);
  logger.info('Rotas de preços registradas.');
  console.log('Rotas de preços registradas.');
  
  // Rotas de autenticação
  app.use('/api/auth', authRoutes);
  logger.info('Rotas de autenticação registradas.');
  console.log('Rotas de autenticação registradas.');
  
  // Rotas de sincronização
  app.use('/api/sync', syncRoutes);
  logger.info('Rotas de sincronização registradas.');
  console.log('Rotas de sincronização registradas.');
  
  // Rotas de configuração (temporárias)
  app.use('/api/setup', setupRoutes);
  logger.info('Rotas de configuração registradas.');
  console.log('Rotas de configuração registradas.');
  
  // Rotas de gerenciamento de cache
  app.use('/api/cache', cacheRoutes);
  logger.info('Rotas de gerenciamento de cache registradas.');
  console.log('Rotas de gerenciamento de cache registradas.');
  
  // Rotas de analytics
  app.use('/api/analytics', analyticsRoutes);
  logger.info('Rotas de analytics registradas.');
  console.log('Rotas de analytics registradas.');

  // Endpoint de health check para verificar se a API está funcionando
  app.get('/api/health', (req, res) => {
    logger.info('Health check solicitado');
    console.log(`Health check solicitado de origem: ${req.headers.origin || 'desconhecida'}`);
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      cors: {
        origin: req.headers.origin || 'não especificada',
        method: req.method
      }
    });
  });
  logger.info('Endpoint de health check registrado.');
  console.log('Endpoint de health check registrado.');

  // Endpoint temporário para atualização de serviços (apenas para testes)
  app.get('/api/admin/update-services', async (req, res) => {
    try {
      console.log('Iniciando atualização manual de serviços...');
      
      // Importar o script de atualização
      const scriptPath = path.join(__dirname, 'scripts', 'render-update-services.js');
      console.log(`Caminho do script: ${scriptPath}`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(scriptPath)) {
        console.error(`Script não encontrado: ${scriptPath}`);
        return res.status(500).json({ error: 'Script de atualização não encontrado' });
      }
      
      // Configurar variáveis de ambiente
      process.env.FORCE_UPDATE = 'true';
      process.env.SERVICE_DEFINITIONS_PATH = path.join(__dirname, 'models', 'seeds', 'updatedServiceDefinitions.js');
      
      // Executar o script
      console.log('Executando script de atualização...');
      const { default: updateScript } = await import(`file://${scriptPath}`);
      
      // Importar a função de limpeza de cache
      const { clearCache } = await import('./middleware/cache.js');
      
      // Limpar o cache da API após a atualização
      console.log('Limpando cache da API...');
      clearCache();
      
      return res.json({ 
        success: true, 
        message: 'Atualização de serviços iniciada com sucesso. Verifique os logs para mais detalhes.'
      });
    } catch (error) {
      console.error(`Erro ao executar atualização de serviços: ${error.message}`);
      console.error(error.stack);
      return res.status(500).json({ 
        error: 'Erro ao executar atualização de serviços', 
        details: error.message 
      });
    }
  });

  // Servir arquivos estáticos do diretório dist
  const distPath = path.join(__dirname, '..', 'dist');
  
  // Verificar se o diretório dist existe
  if (!fs.existsSync(distPath)) {
    logger.warn(`Diretório de arquivos estáticos não encontrado: ${distPath}`);
    console.warn(`Diretório de arquivos estáticos não encontrado: ${distPath}`);
    
    // Criar diretório dist se não existir
    fs.mkdirSync(distPath, { recursive: true });
    logger.info(`Diretório de arquivos estáticos criado: ${distPath}`);
    console.log(`Diretório de arquivos estáticos criado: ${distPath}`);
    
    // Criar um arquivo index.html básico para evitar erros
    const indexHtmlPath = path.join(distPath, 'index.html');
    const basicHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LytSpot</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>LytSpot API</h1>
    <p>A API está funcionando corretamente.</p>
    <p>Acesse o frontend para utilizar a aplicação completa.</p>
  </div>
</body>
</html>`;
    
    fs.writeFileSync(indexHtmlPath, basicHtml);
    logger.info(`Arquivo index.html básico criado em: ${indexHtmlPath}`);
    console.log(`Arquivo index.html básico criado em: ${indexHtmlPath}`);
  }
  
  app.use(express.static(distPath));
  logger.info(`Servindo arquivos estáticos do diretório: ${distPath}`);
  console.log(`Servindo arquivos estáticos do diretório: ${distPath}`);

  // Rota para todas as outras requisições que não correspondem a rotas específicas
  // e que não são requisições para a API
  app.get(/^(?!\/api\/).+$/, (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    
    // Verificar se o arquivo index.html existe
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Caso o arquivo não exista, enviar uma resposta básica
      res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LytSpot</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>LytSpot API</h1>
            <p>A API está funcionando corretamente.</p>
            <p>Acesse o frontend para utilizar a aplicação completa.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
  logger.info('Rota de fallback para SPA configurada.');
  console.log('Rota de fallback para SPA configurada.');

  // Middleware para capturar erros globais
  app.use((err, req, res, next) => {
    logger.error('Erro inesperado no servidor', { error: err.message, stack: err.stack });
    console.error('Erro inesperado no servidor:', err.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  // Inicialização do servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', async () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
    console.log(`Servidor rodando na porta ${PORT}`);
    
    // Garantir que um usuário administrador exista
    try {
      await ensureAdminUser();
      logger.info('Verificação de usuário administrador concluída.');
      console.log('Verificação de usuário administrador concluída.');
    } catch (error) {
      logger.error('Erro ao verificar usuário administrador:', error);
      console.error('Erro ao verificar usuário administrador:', error);
    }
  });
} catch (error) {
  logger.error('Erro ao iniciar o servidor', { error: error.message });
  console.error('Erro ao iniciar o servidor:', error);
}
