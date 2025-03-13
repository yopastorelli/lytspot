/**
 * Script para verificar a integridade da persistência de dados
 * 
 * Este script realiza testes de persistência no banco de dados, criando, atualizando
 * e removendo registros de teste para garantir que as operações estão sendo
 * corretamente persistidas.
 * 
 * @version 1.0.2 - 2025-03-13 - Corrigido tipos de dados para corresponder ao schema
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import environment from '../config/environment.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logDir, 'persistencia-test.log');

/**
 * Registra uma mensagem no log
 * @param {string} message Mensagem a ser registrada
 * @param {string} level Nível do log (info, warn, error)
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
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
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

/**
 * Verifica as permissões do arquivo de banco de dados
 * @param {string} databasePath Caminho para o arquivo de banco de dados
 * @returns {Object} Resultado da verificação
 */
function verificarPermissoesBancoDados(databasePath) {
  try {
    log(`Verificando permissões do banco de dados: ${databasePath}`);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(databasePath)) {
      log(`Arquivo de banco de dados não encontrado: ${databasePath}`, 'error');
      return {
        success: false,
        message: `Arquivo de banco de dados não encontrado: ${databasePath}`,
        permissions: null
      };
    }
    
    // Verificar permissões
    const stats = fs.statSync(databasePath);
    const permissions = {
      isFile: stats.isFile(),
      mode: stats.mode.toString(8),
      uid: stats.uid,
      gid: stats.gid,
      readable: false,
      writable: false
    };
    
    // Testar leitura
    try {
      fs.accessSync(databasePath, fs.constants.R_OK);
      permissions.readable = true;
    } catch (error) {
      permissions.readable = false;
    }
    
    // Testar escrita
    try {
      fs.accessSync(databasePath, fs.constants.W_OK);
      permissions.writable = true;
    } catch (error) {
      permissions.writable = false;
    }
    
    // Verificar diretório pai
    const parentDir = path.dirname(databasePath);
    const parentStats = fs.statSync(parentDir);
    const parentPermissions = {
      isDirectory: parentStats.isDirectory(),
      mode: parentStats.mode.toString(8),
      uid: parentStats.uid,
      gid: parentStats.gid,
      writable: false
    };
    
    // Testar escrita no diretório pai
    try {
      fs.accessSync(parentDir, fs.constants.W_OK);
      parentPermissions.writable = true;
    } catch (error) {
      parentPermissions.writable = false;
    }
    
    // Verificar se temos todas as permissões necessárias
    const allPermissionsOk = permissions.readable && permissions.writable && parentPermissions.writable;
    
    if (allPermissionsOk) {
      log(`Permissões do banco de dados OK: ${databasePath}`);
    } else {
      log(`Problemas com permissões do banco de dados: ${databasePath}`, 'warn');
      if (!permissions.readable) log('Arquivo não tem permissão de leitura', 'error');
      if (!permissions.writable) log('Arquivo não tem permissão de escrita', 'error');
      if (!parentPermissions.writable) log('Diretório pai não tem permissão de escrita', 'error');
    }
    
    return {
      success: allPermissionsOk,
      message: allPermissionsOk ? 'Permissões OK' : 'Problemas com permissões',
      permissions,
      parentPermissions
    };
  } catch (error) {
    log(`Erro ao verificar permissões: ${error.message}`, 'error');
    return {
      success: false,
      message: `Erro ao verificar permissões: ${error.message}`,
      error
    };
  }
}

/**
 * Realiza testes de persistência no banco de dados
 */
async function testarPersistencia() {
  log('Iniciando testes de persistência de dados');
  
  // Verificar variáveis de ambiente
  log(`Ambiente: ${environment.env}`);
  log(`Caminho do banco de dados: ${environment.dbPath}`);
  
  // Obter caminho do arquivo de banco de dados
  const databasePath = environment.dbPath;
  
  // Verificar permissões do arquivo de banco de dados
  const permissoes = verificarPermissoesBancoDados(databasePath);
  
  if (!permissoes.success) {
    log('Falha na verificação de permissões, abortando testes', 'error');
    return;
  }
  
  // Criar cliente Prisma
  const prisma = new PrismaClient();
  
  try {
    // Verificar conexão com o banco de dados
    log('Verificando conexão com o banco de dados...');
    await prisma.$connect();
    log('Conexão com o banco de dados estabelecida com sucesso');
    
    // Criar serviço de teste
    const servicoTeste = {
      nome: `Serviço de Teste - ${Date.now()}`,
      descricao: 'Serviço criado para testar persistência de dados',
      preco_base: 100,
      duracao_media_captura: '60 minutos',
      duracao_media_tratamento: '120 minutos',
      entregaveis: 'Arquivos de teste',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    log(`Criando serviço de teste: ${servicoTeste.nome}`);
    const servicoCriado = await prisma.servico.create({
      data: servicoTeste
    });
    
    log(`Serviço criado com ID: ${servicoCriado.id}`);
    
    // Verificar se o serviço foi realmente criado
    log('Verificando se o serviço foi persistido...');
    const servicoVerificado = await prisma.servico.findUnique({
      where: { id: servicoCriado.id }
    });
    
    if (!servicoVerificado) {
      log('FALHA: Serviço não foi persistido após criação', 'error');
      throw new Error('Serviço não foi persistido após criação');
    }
    
    log('SUCESSO: Serviço foi persistido corretamente após criação');
    
    // Atualizar serviço
    const dadosAtualizacao = {
      descricao: `Descrição atualizada em ${new Date().toISOString()}`,
      preco_base: 150,
      updatedAt: new Date()
    };
    
    log(`Atualizando serviço ${servicoCriado.id}...`);
    const servicoAtualizado = await prisma.servico.update({
      where: { id: servicoCriado.id },
      data: dadosAtualizacao
    });
    
    log(`Serviço atualizado: ${servicoAtualizado.id}`);
    
    // Verificar se a atualização foi persistida
    log('Verificando se a atualização foi persistida...');
    const servicoVerificadoAposAtualizacao = await prisma.servico.findUnique({
      where: { id: servicoCriado.id }
    });
    
    if (!servicoVerificadoAposAtualizacao) {
      log('FALHA: Serviço não encontrado após atualização', 'error');
      throw new Error('Serviço não encontrado após atualização');
    }
    
    if (servicoVerificadoAposAtualizacao.preco_base !== dadosAtualizacao.preco_base) {
      log(`FALHA: Atualização não foi persistida corretamente. Esperado: ${dadosAtualizacao.preco_base}, Encontrado: ${servicoVerificadoAposAtualizacao.preco_base}`, 'error');
      throw new Error('Atualização não foi persistida corretamente');
    }
    
    log('SUCESSO: Atualização foi persistida corretamente');
    
    // Remover serviço
    log(`Removendo serviço ${servicoCriado.id}...`);
    await prisma.servico.delete({
      where: { id: servicoCriado.id }
    });
    
    // Verificar se a remoção foi persistida
    log('Verificando se a remoção foi persistida...');
    const servicoAposRemocao = await prisma.servico.findUnique({
      where: { id: servicoCriado.id }
    });
    
    if (servicoAposRemocao) {
      log('FALHA: Serviço ainda existe após remoção', 'error');
      throw new Error('Serviço ainda existe após remoção');
    }
    
    log('SUCESSO: Remoção foi persistida corretamente');
    
    // Teste de múltiplas operações em sequência
    log('Testando múltiplas operações em sequência...');
    
    // Criar vários serviços
    const servicos = [];
    for (let i = 1; i <= 3; i++) {
      const servico = await prisma.servico.create({
        data: {
          nome: `Serviço de Teste ${i} - ${Date.now()}`,
          descricao: `Descrição do serviço de teste ${i}`,
          preco_base: 100 * i,
          duracao_media_captura: `${30 * i} minutos`,
          duracao_media_tratamento: `${60 * i} minutos`,
          entregaveis: `Entregáveis do serviço ${i}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      servicos.push(servico);
      log(`Criado serviço ${i} com ID: ${servico.id}`);
    }
    
    // Atualizar serviços
    for (const servico of servicos) {
      await prisma.servico.update({
        where: { id: servico.id },
        data: {
          preco_base: servico.preco_base + 50,
          updatedAt: new Date()
        }
      });
      log(`Atualizado serviço ${servico.id}`);
    }
    
    // Verificar atualizações
    let todasAtualizacoesOk = true;
    for (const servico of servicos) {
      const servicoAtualizado = await prisma.servico.findUnique({
        where: { id: servico.id }
      });
      
      if (!servicoAtualizado || servicoAtualizado.preco_base !== servico.preco_base + 50) {
        todasAtualizacoesOk = false;
        log(`FALHA: Atualização do serviço ${servico.id} não foi persistida corretamente`, 'error');
      }
    }
    
    if (todasAtualizacoesOk) {
      log('SUCESSO: Todas as atualizações foram persistidas corretamente');
    }
    
    // Remover serviços
    for (const servico of servicos) {
      await prisma.servico.delete({
        where: { id: servico.id }
      });
      log(`Removido serviço ${servico.id}`);
    }
    
    // Verificar remoções
    let todasRemocoesOk = true;
    for (const servico of servicos) {
      const servicoAposRemocao = await prisma.servico.findUnique({
        where: { id: servico.id }
      });
      
      if (servicoAposRemocao) {
        todasRemocoesOk = false;
        log(`FALHA: Serviço ${servico.id} ainda existe após remoção`, 'error');
      }
    }
    
    if (todasRemocoesOk) {
      log('SUCESSO: Todas as remoções foram persistidas corretamente');
    }
    
    // Resultado final
    log('Testes de persistência concluídos com sucesso');
    
  } catch (error) {
    log(`ERRO nos testes de persistência: ${error.message}`, 'error');
    console.error(error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    log('Conexão com o banco de dados fechada');
  }
}

// Executar testes
testarPersistencia()
  .then(() => {
    log('Script de verificação de persistência concluído');
    process.exit(0);
  })
  .catch((error) => {
    log(`Erro ao executar script de verificação: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
