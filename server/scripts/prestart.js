/**
 * Script de pré-inicialização do servidor Lytspot
 * 
 * Este script é executado automaticamente antes da inicialização do servidor
 * no ambiente de produção (Render). Ele garante que o banco de dados esteja
 * corretamente configurado e populado.
 * 
 * @version 1.0.0 - 2025-03-13
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
const logFile = path.resolve(logsDir, 'prestart.log');

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
 * Verifica se estamos no ambiente Render
 * @returns {boolean} Verdadeiro se estamos no Render
 */
function isRenderEnvironment() {
  return process.env.RENDER === 'true';
}

/**
 * Inicializa o sistema antes de iniciar o servidor
 */
async function prestart() {
  log('=== PRÉ-INICIALIZAÇÃO DO SERVIDOR LYTSPOT ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${isRenderEnvironment() ? 'Sim' : 'Não'}`);
  
  try {
    // Verificar diretório persistente no Render
    if (isRenderEnvironment()) {
      const renderPersistentDir = '/opt/render/project/src/data';
      log(`Verificando diretório persistente no Render: ${renderPersistentDir}`);
      
      if (!fs.existsSync(renderPersistentDir)) {
        log(`Criando diretório persistente: ${renderPersistentDir}`);
        fs.mkdirSync(renderPersistentDir, { recursive: true });
      }
      
      // Verificar permissões
      try {
        fs.accessSync(renderPersistentDir, fs.constants.R_OK | fs.constants.W_OK);
        log('Permissões de leitura e escrita OK para o diretório persistente');
      } catch (error) {
        log(`Erro de permissão no diretório persistente: ${error.message}`);
        
        // Tentar corrigir permissões
        try {
          log('Tentando corrigir permissões...');
          fs.chmodSync(renderPersistentDir, 0o777);
          log('Permissões atualizadas');
        } catch (chmodError) {
          log(`Erro ao atualizar permissões: ${chmodError.message}`);
        }
      }
    }
    
    // Executar inicialização do sistema
    log('Executando inicialização do sistema...');
    try {
      execCommand('node server/scripts/inicializarSistema.js');
      log('Inicialização do sistema concluída com sucesso');
    } catch (error) {
      log(`Erro durante inicialização do sistema: ${error.message}`);
      // Continuar mesmo com erro para tentar iniciar o servidor
    }
    
    // Atualizar serviços no ambiente Render
    if (isRenderEnvironment()) {
      // Verificar se a atualização automática está habilitada
      const autoUpdateEnabled = process.env.ENABLE_AUTO_SERVICE_UPDATE === 'true';
      
      if (autoUpdateEnabled) {
        log('Atualização automática de serviços habilitada');
        log('Executando atualização de serviços no ambiente Render...');
        try {
          // Importar a função de atualização de serviços
          const { atualizarServicosExistentes } = await import('./popularServicos.js');
          
          // Executar atualização forçada
          await atualizarServicosExistentes(true);
          log('Atualização de serviços concluída com sucesso');
        } catch (error) {
          log(`Erro durante atualização de serviços: ${error.message}`);
          // Continuar mesmo com erro para tentar iniciar o servidor
        }
      } else {
        log('Atualização automática de serviços desabilitada');
      }
    }
    
    log('Pré-inicialização concluída com sucesso');
  } catch (error) {
    log(`Erro durante pré-inicialização: ${error.message}`);
    console.error('Detalhes do erro:', error);
  }
  
  log('=== PRÉ-INICIALIZAÇÃO CONCLUÍDA ===');
}

// Executar pré-inicialização
prestart()
  .catch(error => {
    console.error('Erro fatal durante a pré-inicialização:', error);
    // Não encerrar o processo para permitir que o servidor inicie mesmo com erros
  });
