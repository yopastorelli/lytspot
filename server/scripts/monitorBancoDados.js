/**
 * Script para monitorar o banco de dados SQLite
 * 
 * Este script monitora o estado do banco de dados SQLite e registra informações
 * sobre seu tamanho, operações e performance. Útil para diagnosticar problemas
 * de persistência de dados.
 * 
 * @version 1.0.0 - 2025-03-13
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import config from '../config/environment.js';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Diretório de logs
const logsDir = path.resolve(rootDir, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logsDir, 'db-monitor.log');
const statsFile = path.resolve(logsDir, 'db-stats.json');

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

/**
 * Escreve uma mensagem no arquivo de log
 * @param {string} message Mensagem a ser registrada
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Escrever no console
  console.log(message);
  
  // Escrever no arquivo de log
  fs.appendFileSync(logFile, logMessage);
}

/**
 * Obtém estatísticas do banco de dados
 */
async function getDatabaseStats() {
  const dbPath = config.dbPath;
  const stats = {
    timestamp: new Date().toISOString(),
    exists: false,
    size: 0,
    lastModified: null,
    tables: {},
    error: null
  };
  
  try {
    // Verificar se o arquivo existe
    if (fs.existsSync(dbPath)) {
      stats.exists = true;
      
      // Obter informações do arquivo
      const fileStats = fs.statSync(dbPath);
      stats.size = fileStats.size;
      stats.lastModified = fileStats.mtime.toISOString();
      
      // Obter contagem de registros por tabela
      try {
        // Tabela Servico
        stats.tables.servico = {
          count: await prisma.servico.count(),
          lastUpdated: null
        };
        
        // Obter último registro atualizado
        const lastService = await prisma.servico.findFirst({
          orderBy: { updatedAt: 'desc' }
        });
        
        if (lastService) {
          stats.tables.servico.lastUpdated = lastService.updatedAt.toISOString();
        }
        
        // Tabela User
        stats.tables.user = {
          count: await prisma.user.count(),
          lastUpdated: null
        };
        
        // Obter último usuário atualizado
        const lastUser = await prisma.user.findFirst({
          orderBy: { updatedAt: 'desc' }
        });
        
        if (lastUser) {
          stats.tables.user.lastUpdated = lastUser.updatedAt.toISOString();
        }
      } catch (dbError) {
        stats.error = `Erro ao obter estatísticas das tabelas: ${dbError.message}`;
      }
    } else {
      stats.error = `Arquivo de banco de dados não encontrado: ${dbPath}`;
    }
  } catch (error) {
    stats.error = `Erro ao obter estatísticas do banco de dados: ${error.message}`;
  }
  
  return stats;
}

/**
 * Salva as estatísticas do banco de dados
 * @param {Object} stats Estatísticas do banco de dados
 */
function saveStats(stats) {
  try {
    // Carregar estatísticas anteriores se existirem
    let history = [];
    if (fs.existsSync(statsFile)) {
      try {
        const fileContent = fs.readFileSync(statsFile, 'utf8');
        history = JSON.parse(fileContent);
      } catch (parseError) {
        log(`Erro ao analisar arquivo de estatísticas: ${parseError.message}`);
        // Se houver erro de parse, começar com array vazio
        history = [];
      }
    }
    
    // Limitar histórico a 100 entradas
    if (history.length >= 100) {
      history = history.slice(-99);
    }
    
    // Adicionar estatísticas atuais
    history.push(stats);
    
    // Salvar arquivo
    fs.writeFileSync(statsFile, JSON.stringify(history, null, 2));
    
    log('Estatísticas salvas com sucesso');
  } catch (error) {
    log(`Erro ao salvar estatísticas: ${error.message}`);
  }
}

/**
 * Executa o monitoramento do banco de dados
 */
async function monitorDatabase() {
  log('=== MONITORAMENTO DO BANCO DE DADOS ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${process.env.RENDER === 'true' ? 'Sim' : 'Não'}`);
  log(`Caminho do banco de dados: ${config.dbPath}`);
  
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    log('Conexão estabelecida com sucesso');
    
    // Obter estatísticas
    const stats = await getDatabaseStats();
    
    // Registrar estatísticas
    if (stats.exists) {
      log(`Tamanho do banco de dados: ${(stats.size / 1024).toFixed(2)} KB`);
      log(`Última modificação: ${stats.lastModified}`);
      
      if (stats.tables.servico) {
        log(`Serviços: ${stats.tables.servico.count} registros`);
        if (stats.tables.servico.lastUpdated) {
          log(`Último serviço atualizado em: ${stats.tables.servico.lastUpdated}`);
        }
      }
      
      if (stats.tables.user) {
        log(`Usuários: ${stats.tables.user.count} registros`);
        if (stats.tables.user.lastUpdated) {
          log(`Último usuário atualizado em: ${stats.tables.user.lastUpdated}`);
        }
      }
    } else {
      log('Banco de dados não encontrado');
    }
    
    if (stats.error) {
      log(`ERRO: ${stats.error}`);
    }
    
    // Salvar estatísticas
    saveStats(stats);
    
  } catch (error) {
    log(`Erro durante o monitoramento: ${error.message}`);
    console.error('Detalhes do erro:', error);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('Desconectado do banco de dados');
  }
  
  log('=== MONITORAMENTO CONCLUÍDO ===');
}

// Executar monitoramento
monitorDatabase()
  .catch(error => {
    console.error('Erro fatal durante o monitoramento:', error);
    process.exit(1);
  });
