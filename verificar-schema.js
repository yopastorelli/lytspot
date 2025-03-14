/**
 * Script para verificar o esquema do banco de dados
 * @version 1.0.0 - 2025-03-14
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
console.log(`Caminho do banco de dados: ${dbPath}`);

async function verificarEsquema() {
  try {
    // Abrir conexão com o banco de dados SQLite
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Conexão com o banco de dados estabelecida');
    
    // Verificar esquema da tabela Servico
    console.log('\nEsquema da tabela Servico:');
    const schema = await db.all("PRAGMA table_info(Servico)");
    schema.forEach(col => {
      console.log(`- ${col.name} (${col.type})`);
    });
    
    // Fechar conexão com o banco de dados
    await db.close();
    console.log('\nConexão com o banco de dados fechada');
  } catch (error) {
    console.error('Erro ao verificar esquema:', error);
  }
}

verificarEsquema();
