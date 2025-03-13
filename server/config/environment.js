/**
 * Configuração de Ambiente
 * @description Centraliza as configurações de ambiente da aplicação
 * @version 1.5.0 - 2025-03-12 - Corrigido caminho do banco de dados
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Gera uma string aleatória segura para uso como segredo
 * @param {number} length Tamanho da string
 * @returns {string} String aleatória
 */
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verifica e configura variáveis de ambiente críticas
 */
function setupCriticalEnvironmentVariables() {
  // Verificar se estamos no ambiente Render
  const isRender = process.env.RENDER === 'true';
  
  // Definir caminho absoluto para o banco de dados SQLite
  const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
  console.log(`Caminho do banco de dados: ${dbPath}`);
  
  // Verificar se o arquivo do banco de dados existe
  if (!isRender && !fs.existsSync(dbPath)) {
    console.warn(`⚠️ Arquivo de banco de dados não encontrado em: ${dbPath}`);
    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`✅ Diretório criado: ${dbDir}`);
    }
    // Criar arquivo vazio do banco de dados
    fs.writeFileSync(dbPath, '');
    console.log(`✅ Arquivo de banco de dados criado: ${dbPath}`);
  }
  
  // Definir variáveis padrão com base no ambiente
  const defaultValues = {
    // Autenticação
    JWT_SECRET: isRender ? 'f23e126b7f99a3e4553c65b3f558cb6a' : generateSecureSecret(),
    REFRESH_TOKEN: isRender ? '1000.6ab986833897ab97d106448be3eb113.b49abb95c1838c9e7ff9e09deeb97794' : generateSecureSecret(48),
    JWT_EXPIRES_IN: '7d',
    CLIENT_ID: 'lytspot-client',
    CLIENT_SECRET: generateSecureSecret(24),
    
    // Email
    EMAIL_FROM: 'noreply@lytspot.com.br',
    RECIPIENT_EMAIL: 'contato@lytspot.com.br',
    
    // Ambiente
    NODE_ENV: isRender ? 'production' : 'development',
    
    // Servidor
    PORT: isRender ? '10000' : '3000',
    HOST: '0.0.0.0',
    
    // URLs
    BASE_URL: isRender ? 'https://lytspot.onrender.com' : 'http://localhost:3000',
    API_URL: isRender ? 'https://lytspot.onrender.com/api' : 'http://localhost:3000/api',
    FRONTEND_URL: isRender ? 'https://lytspot.com.br' : 'http://localhost:3000',
    
    // CORS
    ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:4321,http://192.168.1.189:4321,https://lytspot.com.br,https://lytspot.onrender.com',
    CORS_ENABLED: 'true',
    
    // Banco de dados - usando caminho absoluto para evitar problemas de acesso
    DATABASE_URL: isRender 
      ? 'file:/opt/render/project/src/database.sqlite' 
      : `file:${dbPath}`,
    
    // Configurações de seed
    SKIP_DB_POPULATION: 'false',
    FORCE_UPDATE: 'false',
    
    // Logging
    LOG_LEVEL: 'info',
    LOG_TO_FILE: 'true',
    LOG_FILE_PATH: './server/logs/app.log',
    
    // Conta
    ACCOUNT_ID: 'lytspot-account',
    SENDER_EMAIL: 'noreply@lytspot.com.br'
  };
  
  // Configurar variáveis não definidas
  Object.entries(defaultValues).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
      console.warn(`⚠️ ${key} não definido. ${key === 'JWT_SECRET' || key === 'REFRESH_TOKEN' || key === 'CLIENT_SECRET' ? 'Usando valor padrão seguro.' : `Usando valor padrão: ${value}`}`);
    }
  });
  
  // Ajustar BASE_URL e API_URL com base no ambiente
  if (process.env.NODE_ENV === 'production' && !isRender) {
    if (process.env.BASE_URL === defaultValues.BASE_URL) {
      process.env.BASE_URL = 'https://lytspot.onrender.com';
      process.env.API_URL = 'https://lytspot.onrender.com/api';
      console.warn(`⚠️ Ajustando URLs para ambiente de produção: ${process.env.BASE_URL}`);
    }
  }
  
  // Salvar variáveis críticas no arquivo .env se estiver em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development' && !isRender) {
    try {
      const envPath = path.join(rootDir, '.env');
      let envContent = '';
      
      // Ler conteúdo existente se o arquivo existir
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Atualizar variáveis críticas
        let updated = false;
        
        // Atualizar cada variável no arquivo
        Object.entries(defaultValues).forEach(([key, value]) => {
          // Não sobrescrever valores existentes
          if (!envContent.includes(`${key}=`)) {
            envContent += `\n${key}=${process.env[key]}\n`;
            updated = true;
          }
        });
        
        // Salvar arquivo atualizado
        if (updated) {
          fs.writeFileSync(envPath, envContent);
          console.log('✅ Variáveis de ambiente críticas salvas no arquivo .env');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar variáveis de ambiente no arquivo .env:', error);
    }
  }
}

// Executar configuração de variáveis críticas
setupCriticalEnvironmentVariables();

/**
 * Configurações de ambiente da aplicação
 */
const environment = {
  // Ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_RENDER: process.env.RENDER === 'true',
  
  // Servidor
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  
  // URLs da API
  BASE_URL: process.env.BASE_URL,
  API_URL: process.env.API_URL || `${process.env.BASE_URL}/api`,
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.BASE_URL,
  
  // Origens permitidas para CORS
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://lytspot.com.br')
    .split(',')
    .map(origin => origin.trim()),
  
  // Banco de dados
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Autenticação
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  
  // Email
  EMAIL_FROM: process.env.EMAIL_FROM,
  RECIPIENT_EMAIL: process.env.RECIPIENT_EMAIL,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  
  // Conta
  ACCOUNT_ID: process.env.ACCOUNT_ID,
  
  // Cache
  CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutos em segundos
  
  // Diretórios
  ROOT_DIR: rootDir,
  DIST_DIR: path.join(rootDir, 'dist'),
  
  // Configurações de seed
  SKIP_DB_POPULATION: process.env.SKIP_DB_POPULATION === 'true',
  FORCE_UPDATE: process.env.FORCE_UPDATE === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './server/logs/app.log',
  
  /**
   * Obtém a URL da API com base no ambiente atual
   * @returns {string} URL da API
   */
  getApiUrl() {
    return this.API_URL || `${this.BASE_URL}/api`;
  },
  
  /**
   * Obtém as origens permitidas para CORS com base no ambiente
   * @returns {Array<string>} Lista de origens permitidas
   */
  getAllowedOrigins() {
    if (this.IS_DEVELOPMENT) {
      // Em desenvolvimento, permitir qualquer origem
      return ['*'];
    }
    
    // Em produção, usar lista específica
    return this.ALLOWED_ORIGINS;
  },
  
  /**
   * Obtém o diretório de arquivos estáticos com base no ambiente
   * @returns {string} Caminho para o diretório de arquivos estáticos
   */
  getStaticDir() {
    if (this.IS_PRODUCTION) {
      return this.DIST_DIR;
    }
    return path.join(rootDir, 'public');
  },
  
  /**
   * Valida se todas as variáveis de ambiente necessárias estão configuradas
   * @returns {boolean} Verdadeiro se todas as variáveis estiverem configuradas
   */
  validateEnvironment() {
    const requiredVars = [
      'BASE_URL', 
      'JWT_SECRET', 
      'REFRESH_TOKEN', 
      'ACCOUNT_ID', 
      'SENDER_EMAIL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      missingVars.forEach(varName => {
        console.error(`Variável de ambiente ${varName} não está configurada.`);
      });
      return false;
    }
    
    return true;
  }
};

export default environment;
