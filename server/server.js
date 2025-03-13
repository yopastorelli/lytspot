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
import cors from 'cors';
import fs from 'fs';
import { ensureAdminUser } from './scripts/ensureAdminUser.js';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Imprimir informações sobre o banco de dados
console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);
const dbPath = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('file:', '') : 'não definido';
console.log('📊 Caminho do banco de dados:', dbPath);
console.log('📊 Caminho absoluto:', path.resolve(__dirname, dbPath));

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
    const rootDir = path.resolve(__dirname, '..');
    
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

  // Middleware
  logger.info('Configurando middleware...');
  console.log('Configurando middleware...');
  
  // Configuração de CORS adaptativa baseada no ambiente
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'https://lytspot.com.br',
    'https://www.lytspot.com.br',
    'https://lytspot.onrender.com',
    'https://lytspot.netlify.app',
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:3000'
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      // Permitir requisições sem origem (como apps mobile ou curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, aceitar qualquer origem
      if (isDevelopment) {
        return callback(null, true);
      }
      
      // Em produção, verificar se a origem está na lista de origens permitidas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`[CORS] Origem bloqueada: ${origin}`);
        return callback(new Error('Origem não permitida pelo CORS'), false);
      }
    },
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
    credentials: true,
    maxAge: 86400 // Cache de preflight por 24 horas (em segundos)
  };
  
  // Aplicar middleware CORS
  app.use(cors(corsOptions));
  
  // Adicionar logging de diagnóstico para CORS e garantir que os cabeçalhos sejam aplicados corretamente
  app.use((req, res, next) => {
    console.log(`[CORS] Requisição de origem: ${req.headers.origin || 'desconhecida'} para ${req.method} ${req.path}`);
    
    // Determinar a origem permitida
    let allowedOrigin = '*';
    
    // Em desenvolvimento, aceitar a origem da requisição
    if (isDevelopment && req.headers.origin) {
      allowedOrigin = req.headers.origin;
    } 
    // Em produção, verificar se a origem está na lista de origens permitidas
    else if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
      allowedOrigin = req.headers.origin;
    }
    
    // Adicionar cabeçalhos CORS manualmente para garantir que eles sejam aplicados
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', corsOptions.methods);
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders);
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Responder imediatamente a requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  app.use(express.json());
  logger.info('Middleware configurado.');
  console.log('Middleware configurado.');

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
  app.get('*', (req, res) => {
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
