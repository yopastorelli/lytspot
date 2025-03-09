// Script específico para configuração do ambiente Render
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

console.log('Iniciando configuração do ambiente Render...');

// Verificar a estrutura de diretórios
console.log('Estrutura de diretórios:');
console.log('Diretório atual:', process.cwd());
console.log('Conteúdo do diretório atual:', fs.readdirSync(process.cwd()));

// Caminho para o schema do Prisma
const schemaPath = path.join(process.cwd(), 'server', 'prisma', 'schema.prisma');

// Verificar se o schema existe
if (fs.existsSync(schemaPath)) {
  console.log(`Schema do Prisma encontrado em: ${schemaPath}`);
  
  // Configurar o caminho do banco de dados
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  console.log(`Caminho do banco de dados: ${dbPath}`);
  
  // Verificar se o diretório existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log(`Criando diretório para o banco de dados: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Executar comandos do Prisma
  try {
    console.log('Executando prisma generate...');
    execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });
    console.log('prisma generate executado com sucesso!');
    
    console.log('Executando prisma db push...');
    execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'inherit' });
    console.log('prisma db push executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar comandos do Prisma:', error);
    process.exit(1);
  }
} else {
  console.error(`ERRO: Schema do Prisma não encontrado em: ${schemaPath}`);
  process.exit(1);
}

console.log('Configuração do ambiente Render concluída com sucesso!');
