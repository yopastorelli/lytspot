import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import winston from 'winston';
import contactRoutes from './routes/contact.js';

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
  app.use(cors({
    origin: [baseUrl, '/', 'https://lytspot.onrender.com'], // Domínios permitidos
    methods: ['POST', 'GET', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
  }));
  app.use(express.json());
  logger.info('Middleware configurado.');
  console.log('Middleware configurado.');

  // Rotas de contato
  logger.info('Registrando rotas de contato...');
  console.log('Registrando rotas de contato...');
  app.use('/api/contact', contactRoutes);
  logger.info('Rotas de contato registradas.');
  console.log('Rotas de contato registradas.');

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
