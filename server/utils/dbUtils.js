/**
 * Utilitários centralizados para operações de banco de dados
 * 
 * Este módulo fornece funções utilitárias reutilizáveis para operações
 * relacionadas ao banco de dados, incluindo configuração, logging e verificação.
 * 
 * @version 1.0.0 - 2025-03-13
 * @module utils/dbUtils
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Cliente Prisma para acesso ao banco de dados (singleton)
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Contador de tentativas de reconexão
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 segundos

/**
 * Registra uma mensagem no log
 * @param {string} message Mensagem a ser registrada
 * @param {string} level Nível do log (info, warn, error)
 * @param {string} logFileName Nome do arquivo de log (sem extensão)
 */
export function log(message, level = 'info', logFileName = 'database') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  const logFilePath = path.resolve(logDir, `${logFileName}.log`);
  
  // Escrever no console
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`ℹ️ ${message}`);
  }
  
  // Escrever no arquivo de log
  try {
    fs.appendFileSync(logFilePath, logMessage);
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

/**
 * Registra um erro detalhado
 * @param {string} operation Nome da operação que falhou
 * @param {Error} error Objeto de erro
 * @param {Object} data Dados relacionados ao erro
 */
export function logError(operation, error, data = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] [${operation}] ${error.message}\n`;
  const detailedLog = {
    timestamp,
    operation,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    data
  };
  
  // Log no console
  console.error(`❌ Erro em ${operation}:`, error);
  
  // Log em arquivo
  try {
    const logPath = path.join(logDir, 'database-errors.log');
    fs.appendFileSync(logPath, logMessage);
    
    const detailedLogPath = path.join(logDir, 'detailed-errors.json');
    let existingLogs = [];
    if (fs.existsSync(detailedLogPath)) {
      try {
        const content = fs.readFileSync(detailedLogPath, 'utf8');
        existingLogs = JSON.parse(content);
      } catch (e) {
        // Ignorar erro de parse, começar com array vazio
      }
    }
    
    existingLogs.push(detailedLog);
    // Manter apenas os últimos 100 logs
    if (existingLogs.length > 100) {
      existingLogs = existingLogs.slice(-100);
    }
    
    fs.writeFileSync(detailedLogPath, JSON.stringify(existingLogs, null, 2));
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

/**
 * Obtém o caminho absoluto do banco de dados
 * @returns {string|null} Caminho absoluto do banco de dados ou null se não definido
 */
export function getAbsoluteDatabasePath() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return null;
  }
  
  if (!dbUrl.startsWith('file:')) {
    return dbUrl; // Não é um caminho de arquivo
  }
  
  let dbPath = dbUrl.replace('file:', '');
  
  // Se o caminho for relativo, torná-lo absoluto
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.resolve(rootDir, dbPath);
  }
  
  return dbPath;
}

/**
 * Sanitiza os dados de um serviço para salvar no banco de dados
 * @param {Object} service Dados do serviço
 * @returns {Object} Dados sanitizados
 */
export function sanitizeServiceData(service) {
  // Clone para não modificar o objeto original
  const sanitizedData = { ...service };
  
  // Remover campos que não existem no modelo Prisma
  if (sanitizedData.id !== undefined) {
    delete sanitizedData.id;
  }
  
  // Converter preço para número
  if (sanitizedData.preco_base !== undefined) {
    sanitizedData.preco_base = typeof sanitizedData.preco_base === 'string' 
      ? parseFloat(sanitizedData.preco_base) 
      : sanitizedData.preco_base;
  }
  
  return sanitizedData;
}

/**
 * Verifica se deve tentar reconectar com base no erro
 * @param {Error} error Erro ocorrido
 * @returns {boolean} true se deve tentar reconectar
 */
export function shouldRetry(error) {
  // Verificar se é um erro de conexão
  const isConnectionError = 
    error.message.includes('connection') || 
    error.message.includes('timeout') ||
    error.message.includes('ECONNREFUSED') ||
    error.code === 'P1001' || // Prisma: Can't reach database server
    error.code === 'P1002'; // Prisma: Database connection timed out
  
  return isConnectionError && reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
}

/**
 * Tenta reconectar ao banco de dados
 * @returns {Promise<boolean>} true se reconectado com sucesso
 */
export async function reconnect() {
  reconnectAttempts++;
  log(`Tentativa de reconexão ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`, 'warn');
  
  try {
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    await prisma.$connect();
    log('Reconexão bem-sucedida!', 'info');
    reconnectAttempts = 0; // Resetar contador após sucesso
    return true;
  } catch (error) {
    logError('reconnect', error);
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      log('Número máximo de tentativas de reconexão atingido', 'error');
    }
    return false;
  }
}

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} true se a conexão for bem-sucedida
 */
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError('testDatabaseConnection', error);
    return false;
  }
}

/**
 * Verifica se o arquivo do banco de dados existe e tem permissões corretas
 * @returns {Promise<Object>} Resultado da verificação
 */
export async function checkDatabaseFile() {
  const dbPath = getAbsoluteDatabasePath();
  const result = {
    exists: false,
    size: 0,
    permissions: {
      read: false,
      write: false
    },
    error: null
  };
  
  if (!dbPath) {
    result.error = 'DATABASE_URL não definida';
    return result;
  }
  
  try {
    // Verificar se o arquivo existe
    if (fs.existsSync(dbPath)) {
      result.exists = true;
      
      // Verificar tamanho do arquivo
      const stats = fs.statSync(dbPath);
      result.size = stats.size;
      
      // Verificar permissões
      try {
        fs.accessSync(dbPath, fs.constants.R_OK);
        result.permissions.read = true;
      } catch (error) {
        result.permissions.read = false;
      }
      
      try {
        fs.accessSync(dbPath, fs.constants.W_OK);
        result.permissions.write = true;
      } catch (error) {
        result.permissions.write = false;
      }
    }
  } catch (error) {
    result.error = `Erro ao verificar arquivo: ${error.message}`;
  }
  
  return result;
}

/**
 * Executa uma operação no banco de dados com tratamento de erro e reconexão
 * @param {Function} operation Função que realiza a operação no banco
 * @param {string} operationName Nome da operação para log
 * @param {Object} params Parâmetros da operação para log
 * @returns {Promise<any>} Resultado da operação
 */
export async function executeWithRetry(operation, operationName, params = {}) {
  try {
    // Verificar conexão antes de executar
    await testDatabaseConnection();
    
    // Executar operação
    return await operation();
  } catch (error) {
    logError(operationName, error, params);
    
    // Tentar reconectar e repetir
    if (shouldRetry(error)) {
      log(`Tentando reconectar e repetir a operação ${operationName}...`, 'warn');
      const reconnected = await reconnect();
      if (reconnected) {
        return executeWithRetry(operation, operationName, params);
      }
    }
    
    throw new Error(`Erro em ${operationName}: ${error.message}`);
  }
}

// Exportar cliente Prisma para reutilização
export { prisma };

// Exportar diretórios úteis
export const directories = {
  root: rootDir,
  logs: logDir
};
