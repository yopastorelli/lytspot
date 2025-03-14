/**
 * Script para verificar diretamente o banco de dados SQLite
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

async function verificarBancoDados() {
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
    
    // Buscar todos os serviços
    const servicos = await db.all('SELECT id, nome, detalhes FROM Servico');
    console.log(`\nEncontrados ${servicos.length} serviços no banco de dados`);
    
    // Verificar se os serviços têm a coluna detalhes
    if (servicos.length > 0) {
      console.log('\nExemplo de serviço (primeiro do banco):');
      console.log(servicos[0]);
      
      // Verificar se todos os serviços têm a estrutura detalhes
      const servicosComDetalhes = servicos.filter(s => s.detalhes);
      console.log(`\nServiços com estrutura 'detalhes': ${servicosComDetalhes.length} de ${servicos.length}`);
      
      if (servicosComDetalhes.length > 0) {
        console.log('\nExemplo de detalhes:');
        try {
          const detalhesObj = JSON.parse(servicosComDetalhes[0].detalhes);
          console.log(detalhesObj);
        } catch (error) {
          console.error('Erro ao fazer parse do JSON de detalhes:', error);
        }
      }
    }
    
    // Fechar conexão com o banco de dados
    await db.close();
    console.log('\nConexão com o banco de dados fechada');
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  }
}

verificarBancoDados();
