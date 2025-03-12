import dotenv from 'dotenv';
import express from 'express';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './routes/contact.js';
import pricingRoutes from './routes/pricing.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import cors from 'cors';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Identificar se estamos no ambiente Render
if (process.env.RENDER) {
  console.log("Detectado ambiente Render. Configurando variáveis específicas...");
  process.env.RENDER = 'true';
}

console.log("Iniciando carregamento das variáveis de ambiente...");
dotenv.config();

console.log("Inicializando o servidor...");

const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || '/'; // Configuração dinâmica de BASE_URL

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
  ];
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
  const corsOptions = {
    origin: isDevelopment
      ? true // Em desenvolvimento, aceita qualquer origem
      : [
          'https://lytspot.com.br',
          'https://www.lytspot.com.br',
          'https://lytspot.onrender.com'
        ],
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
    credentials: true // Mantemos true para compatibilidade com código existente
  };
  
  app.use(cors(corsOptions));

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

  // Rota para todas as outras requisições que não correspondem a rotas específicas
  app.get('*', (req, res) => {
    const distPath = path.join(__dirname, '..', 'dist');
    res.sendFile(path.join(distPath, 'index.html'));
  });
  logger.info('Rota de fallback para SPA configurada.');
  console.log('Rota de fallback para SPA configurada.');

  // Servir arquivos estáticos do diretório dist
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  logger.info(`Servindo arquivos estáticos do diretório: ${distPath}`);
  console.log(`Servindo arquivos estáticos do diretório: ${distPath}`);

  // Middleware para capturar erros globais
  app.use((err, req, res, next) => {
    logger.error('Erro inesperado no servidor', { error: err.message, stack: err.stack });
    console.error('Erro inesperado no servidor:', err.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  // Inicialização do servidor
  logger.info(`Tentando iniciar o servidor na porta ${port}...`);
  console.log(`Tentando iniciar o servidor na porta ${port}...`);
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Servidor backend rodando na porta ${port}`);
    console.log(`Servidor backend rodando na porta ${port}`);
  });
} catch (error) {
  logger.error('Erro ao iniciar o servidor', { error: error.message });
  console.error('Erro ao iniciar o servidor:', error);
}
