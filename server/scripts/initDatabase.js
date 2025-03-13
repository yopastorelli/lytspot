/**
 * Script para inicializar o banco de dados
 * @description Garante que o banco de dados SQLite esteja criado e acessível
 * @version 1.0.0 - 2025-03-12
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
console.log(`🔍 Verificando banco de dados em: ${dbPath}`);

// Verificar se o diretório do banco de dados existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`📁 Criando diretório: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Verificar se o arquivo do banco de dados existe
if (!fs.existsSync(dbPath)) {
  console.log(`📄 Criando arquivo de banco de dados vazio: ${dbPath}`);
  fs.writeFileSync(dbPath, '');
}

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;
console.log(`🔧 DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Inicializando conexão com o banco de dados...');
    
    // Testar a conexão com o banco de dados
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log(`✅ Conexão com o banco de dados estabelecida com sucesso!`);
    
    // Verificar se há tabelas no banco de dados
    try {
      const servicos = await prisma.servico.count();
      console.log(`📊 Banco de dados contém ${servicos} serviços.`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️ Tabelas não encontradas. Execute o comando de migração do Prisma:');
        console.log('npx prisma migrate dev --name init');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Inicialização do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
    
    if (error.message.includes('Unable to open the database file')) {
      console.error('\n⚠️ Não foi possível abrir o arquivo do banco de dados. Verificando permissões...');
      
      try {
        // Verificar permissões do arquivo
        const stats = fs.statSync(dbPath);
        console.log(`📄 Permissões do arquivo: ${stats.mode.toString(8)}`);
        
        // Tentar recriar o arquivo com permissões explícitas
        console.log('🔄 Recriando o arquivo do banco de dados...');
        fs.unlinkSync(dbPath);
        fs.writeFileSync(dbPath, '', { mode: 0o666 }); // Permissões de leitura/escrita para todos
        
        console.log('✅ Arquivo do banco de dados recriado com sucesso!');
        console.log('🔄 Tente executar o servidor novamente.');
      } catch (fsError) {
        console.error('❌ Erro ao manipular o arquivo do banco de dados:', fsError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
