/**
 * Cliente Prisma para acesso ao banco de dados
 * @description Configuração centralizada do cliente Prisma com tratamento de erros e fallback
 * @version 1.1.0 - 2025-03-12 - Melhorada a configuração para garantir acesso ao banco de dados
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

// Verificar se o arquivo do banco de dados existe
if (!isRender && !fs.existsSync(dbPath)) {
  console.warn(`⚠️ Arquivo de banco de dados não encontrado em: ${dbPath}`);
  // Criar diretório se não existir
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`✅ Diretório criado: ${dbDir}`);
  }
  // Criar arquivo vazio do banco de dados
  fs.writeFileSync(dbPath, '');
  console.log(`✅ Arquivo de banco de dados criado: ${dbPath}`);
}

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;
console.log(`🔧 DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);

// Opções do Prisma para melhor tratamento de erros
const prismaOptions = {
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
};

// Criando uma instância global do Prisma Client para evitar múltiplas conexões
const prismaClientSingleton = () => {
  try {
    return new PrismaClient(prismaOptions);
  } catch (error) {
    console.error('❌ Erro ao criar cliente Prisma:', error);
    throw error;
  }
};

// Definindo o objeto global para o Prisma Client
const globalForPrisma = globalThis;

// Criando ou reutilizando a instância do Prisma Client
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Em ambiente de desenvolvimento, salvamos a instância no objeto global
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
