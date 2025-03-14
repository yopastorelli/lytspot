/**
 * Script para adicionar a coluna detalhes à tabela Servico e atualizar os dados existentes
 * @version 1.0.0 - 2025-03-14
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
console.log(`Caminho do banco de dados: ${dbPath}`);

// Função para criar backup
async function criarBackup() {
  const backupDir = path.join(rootDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(backupDir, `database-backup-${timestamp}.sqlite`);
  
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Backup criado em: ${backupPath}`);
  
  // Registrar no log
  const logDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'atualizacao-schema.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Backup criado em: ${backupPath}\n`);
}

// Função para registrar log
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  
  // Salvar log em arquivo
  const logDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'atualizacao-schema.log');
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

async function adicionarColunaDetalhes() {
  log('=== ADICIONANDO COLUNA DETALHES À TABELA SERVICO ===');
  
  try {
    // Criar backup antes de modificar o banco de dados
    await criarBackup();
    
    // Abrir conexão com o banco de dados SQLite
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    log('Conexão com o banco de dados estabelecida');
    
    // Verificar se a coluna já existe
    const schema = await db.all("PRAGMA table_info(Servico)");
    const colunaExistente = schema.find(col => col.name === 'detalhes');
    
    if (colunaExistente) {
      log('A coluna detalhes já existe na tabela Servico');
    } else {
      // Adicionar coluna detalhes à tabela Servico
      log('Adicionando coluna detalhes à tabela Servico...');
      await db.exec('ALTER TABLE Servico ADD COLUMN detalhes TEXT');
      log('Coluna detalhes adicionada com sucesso');
    }
    
    // Buscar todos os serviços
    const servicos = await db.all('SELECT * FROM Servico');
    log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    // Atualizar cada serviço
    for (const servico of servicos) {
      // Criar objeto detalhes
      const detalhes = {
        captura: servico.duracao_media_captura || 'Sob consulta',
        tratamento: servico.duracao_media_tratamento || 'Sob consulta',
        entregaveis: servico.entregaveis || 'Sob consulta',
        adicionais: servico.possiveis_adicionais || '',
        deslocamento: servico.valor_deslocamento || 'Sob consulta'
      };
      
      // Converter para JSON string
      const detalhesJSON = JSON.stringify(detalhes);
      
      // Atualizar o serviço
      await db.run(
        'UPDATE Servico SET detalhes = ? WHERE id = ?',
        [detalhesJSON, servico.id]
      );
      
      log(`Serviço "${servico.nome}" (ID: ${servico.id}) atualizado com sucesso`);
    }
    
    // Verificar resultado
    const servicosAtualizados = await db.all('SELECT id, nome, detalhes FROM Servico');
    const servicosComDetalhes = servicosAtualizados.filter(s => s.detalhes);
    
    log(`\nServiços com estrutura 'detalhes' após atualização: ${servicosComDetalhes.length} de ${servicosAtualizados.length}`);
    
    // Mostrar exemplo de serviço atualizado
    if (servicosComDetalhes.length > 0) {
      log('\nExemplo de serviço atualizado:');
      log(`ID: ${servicosComDetalhes[0].id}`);
      log(`Nome: ${servicosComDetalhes[0].nome}`);
      log(`Detalhes (JSON): ${servicosComDetalhes[0].detalhes}`);
      
      try {
        const detalhesObj = JSON.parse(servicosComDetalhes[0].detalhes);
        log('\nDetalhes (Objeto):');
        log(`- Captura: ${detalhesObj.captura}`);
        log(`- Tratamento: ${detalhesObj.tratamento}`);
        log(`- Entregáveis: ${detalhesObj.entregaveis}`);
        log(`- Adicionais: ${detalhesObj.adicionais}`);
        log(`- Deslocamento: ${detalhesObj.deslocamento}`);
      } catch (error) {
        log(`Erro ao fazer parse do JSON de detalhes: ${error.message}`);
      }
    }
    
    // Fechar conexão com o banco de dados
    await db.close();
    log('Conexão com o banco de dados fechada');
    
    log('=== ATUALIZAÇÃO CONCLUÍDA ===');
  } catch (error) {
    log(`Erro durante a atualização: ${error.message}`);
    console.error('Detalhes do erro:', error);
  }
}

// Executar a função principal
adicionarColunaDetalhes();
