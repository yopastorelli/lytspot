import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configurar variável de ambiente DATABASE_URL se não existir
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../database.sqlite";
  console.log("DATABASE_URL não encontrada, definindo valor padrão:", process.env.DATABASE_URL);
}

console.log("Iniciando configuração do ambiente Render...");

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
  
  console.log("Configuração do ambiente Render concluída com sucesso!");
} catch (error) {
  console.error("Erro ao executar comandos do Prisma:", error);
  process.exit(1);
}