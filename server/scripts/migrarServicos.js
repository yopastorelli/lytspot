/**
 * Script para migrar serviços para o novo formato com estrutura aninhada detalhes
 * @description Atualiza todos os serviços no banco de dados para incluir a estrutura aninhada detalhes
 * @version 1.1.0 - 2025-03-14 - Atualizado para usar JSON string
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Verificar se estamos no ambiente Render
const isRender = process.env.RENDER === 'true';

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = isRender 
  ? path.join('/opt/render/project/src', 'database.sqlite')
  : path.resolve(rootDir, 'server', 'database.sqlite');

// Configurar logger
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  
  // Salvar log em arquivo
  const logDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'migracao-servicos.log');
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;
log(`DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);

const prisma = new PrismaClient();

/**
 * Cria backup dos serviços antes da migração
 * @param {Array} servicos Lista de serviços
 * @returns {string} Caminho do arquivo de backup
 */
async function criarBackupServicos(servicos) {
  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(rootDir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Criar nome do arquivo de backup com timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupDir, `servicos-backup-${timestamp}.json`);
    
    // Criar objeto de metadados
    const backup = {
      timestamp,
      ambiente: process.env.NODE_ENV || 'não definido',
      render: isRender ? 'Sim' : 'Não',
      total: servicos.length,
      servicos
    };
    
    // Salvar backup em arquivo JSON
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    log(`Backup criado com sucesso: ${backupFile}`);
    return backupFile;
  } catch (error) {
    log(`Erro ao criar backup: ${error.message}`);
    return null;
  }
}

/**
 * Migra serviços para o novo formato com estrutura aninhada detalhes
 */
async function migrarServicos() {
  log('=== INICIANDO MIGRAÇÃO DE SERVIÇOS ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${isRender ? 'Sim' : 'Não'}`);
  
  try {
    // Conectar ao banco de dados
    log('Conectando ao banco de dados...');
    await prisma.$connect();
    log('Conexão estabelecida com sucesso');
    
    // Buscar todos os serviços
    log('Buscando serviços existentes no banco de dados...');
    const servicos = await prisma.servico.findMany();
    log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    if (servicos.length === 0) {
      log('Nenhum serviço encontrado para migrar');
      return;
    }
    
    // Criar backup dos serviços antes da migração
    log('Criando backup dos serviços antes da migração...');
    await criarBackupServicos(servicos);
    
    // Migrar cada serviço para o novo formato
    log('Iniciando migração dos serviços...');
    let servicosMigrados = 0;
    
    for (const servico of servicos) {
      // Verificar se o serviço já tem a estrutura detalhes
      if (servico.detalhes) {
        log(`Serviço "${servico.nome}" (ID: ${servico.id}) já possui estrutura detalhes, pulando...`);
        continue;
      }
      
      // Criar estrutura detalhes
      const detalhes = {
        captura: servico.duracao_media_captura,
        tratamento: servico.duracao_media_tratamento,
        entregaveis: servico.entregaveis,
        adicionais: servico.possiveis_adicionais,
        deslocamento: servico.valor_deslocamento
      };
      
      try {
        // Converter detalhes para JSON string
        const detalhesJSON = JSON.stringify(detalhes);
        
        // Atualizar serviço com a nova estrutura
        await prisma.servico.update({
          where: { id: servico.id },
          data: { 
            detalhes: detalhesJSON,
            // Manter os campos originais para compatibilidade
            duracao_media_captura: servico.duracao_media_captura,
            duracao_media_tratamento: servico.duracao_media_tratamento,
            entregaveis: servico.entregaveis,
            possiveis_adicionais: servico.possiveis_adicionais,
            valor_deslocamento: servico.valor_deslocamento
          }
        });
        
        log(`Serviço "${servico.nome}" (ID: ${servico.id}) migrado com sucesso`);
        servicosMigrados++;
      } catch (error) {
        log(`Erro ao migrar serviço "${servico.nome}" (ID: ${servico.id}): ${error.message}`);
      }
    }
    
    // Verificar resultado da migração
    log(`Total de serviços migrados: ${servicosMigrados} de ${servicos.length}`);
    
    // Verificar se todos os serviços agora têm a estrutura detalhes
    const servicosAtualizados = await prisma.servico.findMany();
    const servicosComDetalhes = servicosAtualizados.filter(s => s.detalhes);
    
    log(`Serviços com estrutura detalhes após migração: ${servicosComDetalhes.length} de ${servicosAtualizados.length}`);
    
    if (servicosComDetalhes.length < servicosAtualizados.length) {
      log('Atenção: Alguns serviços ainda não possuem a estrutura detalhes:');
      const servicosSemDetalhes = servicosAtualizados.filter(s => !s.detalhes);
      servicosSemDetalhes.forEach(s => {
        log(`- ${s.nome} (ID: ${s.id})`);
      });
    } else {
      log('Todos os serviços possuem a estrutura detalhes');
    }
    
    log('Migração concluída com sucesso');
  } catch (error) {
    log(`Erro durante a migração: ${error.message}`);
    console.error('Detalhes do erro:', error);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('Desconectado do banco de dados');
  }
  
  log('=== MIGRAÇÃO CONCLUÍDA ===');
}

// Executar a migração
migrarServicos();
