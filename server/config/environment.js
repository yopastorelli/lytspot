/**
 * Configuração de Ambiente
 * @description Centraliza as configurações de ambiente da aplicação
 * @version 1.6.2 - 2025-03-13 - Melhorada a resolução de caminhos para o banco de dados
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Determinar ambiente
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isRender = process.env.RENDER === 'true';

// Configurar caminhos de banco de dados
let dbPath;

// Em produção no Render, usar o diretório persistente
if (isProduction && isRender) {
  // Diretório persistente no Render
  dbPath = path.resolve('/opt/render/project/data/database.sqlite');
  
  // Garantir que o diretório existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Diretório para banco de dados criado: ${dbDir}`);
    } catch (error) {
      console.error(`Erro ao criar diretório para banco de dados: ${error.message}`);
    }
  }
} else {
  // Ambiente de desenvolvimento ou outro ambiente
  dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
}

// Verificar permissões do arquivo de banco de dados
if (fs.existsSync(dbPath)) {
  try {
    fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    console.log(`Permissões de leitura e escrita OK para o banco de dados: ${dbPath}`);
  } catch (error) {
    console.error(`Erro de permissão no banco de dados: ${error.message}`);
    
    // Tentar corrigir permissões
    try {
      fs.chmodSync(dbPath, 0o666);
      console.log('Permissões do banco de dados atualizadas');
    } catch (chmodError) {
      console.error(`Não foi possível atualizar permissões: ${chmodError.message}`);
    }
  }
} else {
  console.log(`Arquivo de banco de dados não existe, será criado: ${dbPath}`);
  
  // Verificar se o diretório existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Diretório para banco de dados criado: ${dbDir}`);
    } catch (error) {
      console.error(`Erro ao criar diretório para banco de dados: ${error.message}`);
    }
  }
}

// Log de configuração
console.log(`Ambiente: ${env}`);
console.log(`Render: ${isRender ? 'Sim' : 'Não'}`);
console.log(`Caminho do banco de dados: ${dbPath}`);

// Definir variáveis padrão com base no ambiente
const defaultValues = {
  // Servidor
  PORT: isProduction ? '10000' : '3001',
  HOST: isProduction ? '0.0.0.0' : 'localhost',
  
  // CORS
  CORS_ORIGIN: isProduction ? 'https://lytspot.onrender.com' : 'http://localhost:3000',
  CORS_ENABLED: 'true',
  
  // Banco de dados - usando caminho absoluto para evitar problemas de acesso
  DATABASE_URL: `file:${dbPath}`,
  
  // Configurações de seed
  SKIP_DB_POPULATION: 'false',
  
  // Configurações de log
  LOG_LEVEL: isProduction ? 'info' : 'debug',
  LOG_TO_FILE: isProduction ? 'true' : 'false',
  LOG_FILE_PATH: path.resolve(rootDir, 'logs', 'app.log'),
  
  // API URLs
  API_URL: isProduction ? 'https://lytspot-api.onrender.com' : 'http://localhost:3001',
  FRONTEND_URL: isProduction ? 'https://lytspot.onrender.com' : 'http://localhost:3000',
  
  // Configurações de autenticação
  JWT_SECRET: process.env.JWT_SECRET || 'desenvolvimento-segredo-temporario',
  JWT_EXPIRES_IN: '7d',
  
  // Configurações de upload
  UPLOAD_DIR: path.resolve(rootDir, 'uploads'),
  MAX_FILE_SIZE: '10mb',
  
  // Configurações de cache
  CACHE_ENABLED: isProduction ? 'true' : 'false',
  CACHE_TTL: '3600', // 1 hora em segundos
  
  // Configurações de rate limit
  RATE_LIMIT_WINDOW_MS: '900000', // 15 minutos
  RATE_LIMIT_MAX: '100', // 100 requisições por janela
  
  // Configurações de timeout
  REQUEST_TIMEOUT_MS: '30000', // 30 segundos
  
  // Configurações de compressão
  COMPRESSION_ENABLED: isProduction ? 'true' : 'false',
  
  // Configurações de segurança
  HELMET_ENABLED: isProduction ? 'true' : 'false',
};

// Função para obter variáveis de ambiente com fallback para valores padrão
export function getEnv(key) {
  return process.env[key] || defaultValues[key] || null;
}

// Exportar todas as configurações como um objeto
export default {
  env,
  isProduction,
  isRender,
  dbPath,
  port: getEnv('PORT'),
  host: getEnv('HOST'),
  cors: {
    origin: getEnv('CORS_ORIGIN'),
    enabled: getEnv('CORS_ENABLED') === 'true',
  },
  database: {
    url: getEnv('DATABASE_URL'),
    skipPopulation: getEnv('SKIP_DB_POPULATION') === 'true',
  },
  logging: {
    level: getEnv('LOG_LEVEL'),
    toFile: getEnv('LOG_TO_FILE') === 'true',
    filePath: getEnv('LOG_FILE_PATH'),
  },
  api: {
    url: getEnv('API_URL'),
    frontendUrl: getEnv('FRONTEND_URL'),
  },
  auth: {
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN'),
  },
  upload: {
    dir: getEnv('UPLOAD_DIR'),
    maxFileSize: getEnv('MAX_FILE_SIZE'),
  },
  cache: {
    enabled: getEnv('CACHE_ENABLED') === 'true',
    ttl: parseInt(getEnv('CACHE_TTL'), 10),
  },
  rateLimit: {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS'), 10),
    max: parseInt(getEnv('RATE_LIMIT_MAX'), 10),
  },
  timeout: {
    request: parseInt(getEnv('REQUEST_TIMEOUT_MS'), 10),
  },
  security: {
    compression: getEnv('COMPRESSION_ENABLED') === 'true',
    helmet: getEnv('HELMET_ENABLED') === 'true',
  },
};
