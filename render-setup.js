import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configurar variáveis de ambiente essenciais se não existirem
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../database.sqlite";
  console.log("DATABASE_URL não encontrada, definindo valor padrão:", process.env.DATABASE_URL);
}

// Configurar JWT_SECRET com o valor específico fornecido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "f23e126b7f99a3e4553c65b3f558cb6a";
  console.log("JWT_SECRET não encontrada, usando valor específico configurado");
}

// Configurar JWT_EXPIRES_IN se não existir
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
  console.log("JWT_EXPIRES_IN não encontrada, definindo valor padrão:", process.env.JWT_EXPIRES_IN);
}

// Configurar NODE_ENV se não existir
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
  console.log("NODE_ENV não encontrada, definindo como:", process.env.NODE_ENV);
}

console.log("Iniciando configuração do ambiente Render...");

// Criar arquivo .env se estiver no ambiente Render
if (process.env.RENDER) {
  try {
    const envContent = `
DATABASE_URL=${process.env.DATABASE_URL}
JWT_SECRET=${process.env.JWT_SECRET}
JWT_EXPIRES_IN=${process.env.JWT_EXPIRES_IN}
NODE_ENV=${process.env.NODE_ENV}
BASE_URL=${process.env.BASE_URL || '/'}
REFRESH_TOKEN=${process.env.REFRESH_TOKEN || ''}
CLIENT_ID=${process.env.CLIENT_ID || ''}
CLIENT_SECRET=${process.env.CLIENT_SECRET || ''}
ACCOUNT_ID=${process.env.ACCOUNT_ID || ''}
SENDER_EMAIL=${process.env.SENDER_EMAIL || ''}
RECIPIENT_EMAIL=${process.env.RECIPIENT_EMAIL || ''}
`;
    
    fs.writeFileSync('.env', envContent);
    console.log("Arquivo .env criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar arquivo .env:", error);
  }
}

// Verificar estrutura de diretórios
const currentDir = process.cwd();
console.log("Estrutura de diretórios:");
console.log("Diretório atual:", currentDir);

try {
  const dirContents = fs.readdirSync(currentDir);
  console.log("Conteúdo do diretório atual:", dirContents);
  
  // Localizar o schema do Prisma
  const prismaSchemaPath = path.join(currentDir, 'server', 'prisma', 'schema.prisma');
  const dbPath = path.join(currentDir, 'database.sqlite');
  
  console.log("Schema do Prisma encontrado em:", prismaSchemaPath);
  console.log("Caminho do banco de dados:", dbPath);
  
  // Verificar se o arquivo schema.prisma existe
  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error(`Arquivo schema.prisma não encontrado em ${prismaSchemaPath}`);
  }
  
  // Executar comandos do Prisma
  console.log("Executando prisma generate...");
  execSync(`npx prisma generate --schema="${prismaSchemaPath}"`, { stdio: 'inherit' });
  console.log("prisma generate executado com sucesso!");
  
  // Verificar se o banco de dados já existe
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    console.log("Executando prisma db push...");
    execSync(`npx prisma db push --schema="${prismaSchemaPath}" --accept-data-loss`, { stdio: 'inherit' });
    console.log("prisma db push executado com sucesso!");
  } else {
    console.log("Banco de dados já existe, pulando prisma db push");
  }
  
  // Criar diretório dist se não existir
  const distPath = path.join(currentDir, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log("Criando diretório dist...");
    fs.mkdirSync(distPath, { recursive: true });
    console.log("Diretório dist criado com sucesso!");
  }
  
  console.log("Configuração do ambiente Render concluída com sucesso!");
} catch (error) {
  console.error("Erro ao executar comandos do Prisma:", error);
  process.exit(1);
}