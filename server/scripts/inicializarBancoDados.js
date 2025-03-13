/**
 * Script para inicializar o banco de dados SQLite
 * 
 * Este script cria o arquivo de banco de dados SQLite se não existir,
 * configura as permissões corretas e executa as migrações do Prisma.
 * 
 * @version 1.0.2 - 2025-03-13 - Corrigido problema com caminhos que contêm espaços
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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
const logFile = path.resolve(logsDir, 'db-init.log');

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
 * Executa um comando e retorna a saída
 * @param {string} command Comando a ser executado
 * @returns {string} Saída do comando
 */
function execCommand(command) {
  try {
    log(`Executando comando: ${command}`);
    const output = execSync(command, { encoding: 'utf8', cwd: rootDir });
    return output;
  } catch (error) {
    log(`Erro ao executar comando: ${error.message}`);
    if (error.stdout) log(`Saída padrão: ${error.stdout}`);
    if (error.stderr) log(`Saída de erro: ${error.stderr}`);
    throw error;
  }
}

/**
 * Inicializa o banco de dados
 */
async function initializeDatabase() {
  log('=== INICIALIZAÇÃO DO BANCO DE DADOS ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${process.env.RENDER === 'true' ? 'Sim' : 'Não'}`);
  
  try {
    // Obter caminho do banco de dados
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL não definida');
    }
    
    log(`DATABASE_URL: ${dbUrl}`);
    
    // Extrair caminho do arquivo
    let dbPath;
    if (dbUrl.startsWith('file:')) {
      dbPath = dbUrl.replace('file:', '');
      
      // Se o caminho for relativo, torná-lo absoluto
      if (!path.isAbsolute(dbPath)) {
        dbPath = path.resolve(rootDir, dbPath);
      }
    } else {
      throw new Error('DATABASE_URL não é um caminho de arquivo SQLite');
    }
    
    log(`Caminho absoluto do banco de dados: ${dbPath}`);
    
    // Verificar diretório
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      log(`Criando diretório: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Verificar se o arquivo existe
    if (fs.existsSync(dbPath)) {
      log(`Arquivo de banco de dados já existe: ${dbPath}`);
      
      // Verificar tamanho
      const stats = fs.statSync(dbPath);
      log(`Tamanho do arquivo: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Verificar permissões
      try {
        fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        log('Permissões de leitura e escrita OK');
      } catch (error) {
        log(`Erro de permissão: ${error.message}`);
        
        // Tentar corrigir permissões
        try {
          log('Tentando corrigir permissões...');
          fs.chmodSync(dbPath, 0o666);
          log('Permissões atualizadas');
        } catch (chmodError) {
          log(`Erro ao atualizar permissões: ${chmodError.message}`);
        }
      }
    } else {
      log(`Arquivo de banco de dados não existe, criando: ${dbPath}`);
      
      // Criar arquivo vazio
      fs.writeFileSync(dbPath, '');
      
      // Definir permissões
      try {
        fs.chmodSync(dbPath, 0o666);
        log('Permissões definidas');
      } catch (chmodError) {
        log(`Erro ao definir permissões: ${chmodError.message}`);
      }
    }
    
    // Caminho para o schema do Prisma
    // Usar caminho relativo para evitar problemas com espaços no caminho
    const schemaRelativePath = path.join('server', 'prisma', 'schema.prisma');
    const schemaAbsolutePath = path.resolve(rootDir, schemaRelativePath);
    log(`Caminho do schema do Prisma: ${schemaAbsolutePath}`);
    
    if (!fs.existsSync(schemaAbsolutePath)) {
      throw new Error(`Arquivo de schema do Prisma não encontrado: ${schemaAbsolutePath}`);
    }
    
    // Executar migrações do Prisma
    log('Executando migrações do Prisma...');
    try {
      // Usar caminho relativo para evitar problemas com espaços
      // Gerar cliente Prisma
      execCommand(`npx prisma generate --schema="${schemaRelativePath}"`);
      log('Cliente Prisma gerado com sucesso');
      
      // Aplicar migrações
      execCommand(`npx prisma migrate deploy --schema="${schemaRelativePath}"`);
      log('Migrações aplicadas com sucesso');
      
      // Verificar se o banco de dados está vazio
      const dbContent = fs.readFileSync(dbPath);
      if (dbContent.length === 0) {
        log('Banco de dados vazio, executando push para criar schema...');
        execCommand(`npx prisma db push --schema="${schemaRelativePath}"`);
        log('Schema criado com sucesso');
      }
    } catch (prismaError) {
      log(`Erro durante operações do Prisma: ${prismaError.message}`);
    }
    
    log('Inicialização do banco de dados concluída com sucesso');
  } catch (error) {
    log(`Erro durante inicialização: ${error.message}`);
    console.error('Detalhes do erro:', error);
  }
  
  log('=== INICIALIZAÇÃO CONCLUÍDA ===');
}

// Executar inicialização
initializeDatabase()
  .catch(error => {
    console.error('Erro fatal durante a inicialização:', error);
    process.exit(1);
  });
