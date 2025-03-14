/**
 * Script para atualizar serviços usando SQL bruto
 * @version 1.0.0 - 2025-03-14
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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
}

// Função principal
async function atualizarServicos() {
  console.log('=== ATUALIZANDO SERVIÇOS COM SQL BRUTO ===');
  
  try {
    // Criar backup antes de modificar o banco de dados
    await criarBackup();
    
    // Abrir conexão com o banco de dados SQLite
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Conexão com o banco de dados estabelecida');
    
    // Buscar todos os serviços
    const servicos = await db.all('SELECT * FROM Servico');
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    // Atualizar cada serviço
    for (const servico of servicos) {
      // Criar objeto detalhes
      const detalhes = {
        captura: servico.duracao_media_captura,
        tratamento: servico.duracao_media_tratamento,
        entregaveis: servico.entregaveis,
        adicionais: servico.possiveis_adicionais,
        deslocamento: servico.valor_deslocamento
      };
      
      // Converter para JSON string
      const detalhesJSON = JSON.stringify(detalhes);
      
      // Atualizar o serviço
      await db.run(
        'UPDATE Servico SET detalhes = ? WHERE id = ?',
        [detalhesJSON, servico.id]
      );
      
      console.log(`Serviço "${servico.nome}" (ID: ${servico.id}) atualizado com sucesso`);
    }
    
    // Verificar resultado
    const servicosAtualizados = await db.all('SELECT id, nome, detalhes FROM Servico');
    const servicosComDetalhes = servicosAtualizados.filter(s => s.detalhes);
    
    console.log(`\nServiços com estrutura 'detalhes' após atualização: ${servicosComDetalhes.length} de ${servicosAtualizados.length}`);
    
    // Mostrar exemplo de serviço atualizado
    if (servicosComDetalhes.length > 0) {
      console.log('\nExemplo de serviço atualizado:');
      console.log(servicosComDetalhes[0]);
      
      try {
        const detalhesObj = JSON.parse(servicosComDetalhes[0].detalhes);
        console.log('\nDetalhes (Objeto):');
        console.log(detalhesObj);
      } catch (error) {
        console.error('Erro ao fazer parse do JSON de detalhes:', error);
      }
    }
    
    // Fechar conexão com o banco de dados
    await db.close();
    console.log('Conexão com o banco de dados fechada');
    
    console.log('=== ATUALIZAÇÃO CONCLUÍDA ===');
  } catch (error) {
    console.error('Erro durante a atualização:', error);
  }
}

// Executar a função principal
atualizarServicos();
