/**
 * Script para inicialização completa do sistema Lytspot
 * 
 * Este script executa todas as etapas necessárias para garantir que o sistema
 * esteja pronto para uso, incluindo:
 * 1. Inicialização do banco de dados
 * 2. População de serviços de demonstração
 * 3. Verificação de integridade
 * 4. Monitoramento do estado atual
 * 5. Verificação de persistência de dados
 * 
 * @version 1.1.0 - 2025-03-13
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
const logFile = path.resolve(logsDir, 'inicializacao-sistema.log');

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
 * Inicializa o sistema completo
 */
async function inicializarSistema() {
  log('=== INICIALIZAÇÃO DO SISTEMA LYTSPOT ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${process.env.RENDER === 'true' ? 'Sim' : 'Não'}`);
  
  try {
    // Etapa 1: Inicializar banco de dados
    log('Etapa 1: Inicializando banco de dados...');
    try {
      const outputInicializacao = execCommand('node server/scripts/inicializarBancoDados.js');
      log('Banco de dados inicializado com sucesso');
    } catch (error) {
      log(`Erro ao inicializar banco de dados: ${error.message}`);
      // Continuar mesmo com erro para tentar as próximas etapas
    }
    
    // Etapa 2: Popular serviços
    log('Etapa 2: Populando serviços de demonstração...');
    try {
      const outputPopulacao = execCommand('node server/scripts/popularServicos.js');
      log('Serviços populados com sucesso');
    } catch (error) {
      log(`Erro ao popular serviços: ${error.message}`);
      // Continuar mesmo com erro para tentar as próximas etapas
    }
    
    // Etapa 3: Verificar integridade
    log('Etapa 3: Verificando integridade do sistema...');
    try {
      const outputVerificacao = execCommand('node server/scripts/verificarBancoDados.js');
      log('Verificação de integridade concluída com sucesso');
    } catch (error) {
      log(`Erro ao verificar integridade: ${error.message}`);
      // Continuar mesmo com erro para tentar as próximas etapas
    }
    
    // Etapa 4: Monitorar estado atual
    log('Etapa 4: Monitorando estado atual do banco de dados...');
    try {
      const outputMonitoramento = execCommand('node server/scripts/monitorBancoDados.js');
      log('Monitoramento concluído com sucesso');
    } catch (error) {
      log(`Erro ao monitorar banco de dados: ${error.message}`);
      // Continuar mesmo com erro para tentar as próximas etapas
    }
    
    // Etapa 5: Verificar persistência de dados
    log('Etapa 5: Verificando persistência de dados...');
    try {
      const outputPersistencia = execCommand('node server/scripts/verificarPersistencia.js');
      log('Verificação de persistência concluída com sucesso');
    } catch (error) {
      log(`Erro ao verificar persistência: ${error.message}`);
      log('AVISO: Problemas de persistência podem afetar o funcionamento do sistema');
    }
    
    log('Inicialização do sistema concluída com sucesso');
  } catch (error) {
    log(`Erro durante inicialização do sistema: ${error.message}`);
    console.error('Detalhes do erro:', error);
  }
  
  log('=== INICIALIZAÇÃO CONCLUÍDA ===');
}

// Executar inicialização do sistema
inicializarSistema()
  .catch(error => {
    console.error('Erro fatal durante a inicialização do sistema:', error);
    process.exit(1);
  });
