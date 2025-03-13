/**
 * Script para criar um usuário de teste
 * @description Cria um usuário de teste para facilitar o login durante o desenvolvimento
 * @version 1.0.0 - 2025-03-12
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

// Verificar se o arquivo do banco de dados existe
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Arquivo de banco de dados não encontrado em: ${dbPath}`);
  process.exit(1);
}

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;
console.log(`🔧 DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

// Dados do usuário de teste
const testUser = {
  email: 'teste@lytspot.com.br',
  password: 'senha123',
  nome: 'Usuário de Teste'
};

async function createTestUser() {
  try {
    console.log('🚀 Criando usuário de teste...');
    
    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: testUser.email
      }
    });
    
    if (usuarioExistente) {
      console.log(`✅ Usuário de teste já existe: ${testUser.email}`);
      return;
    }
    
    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    
    // Criar o usuário
    const novoUsuario = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        nome: testUser.nome
      }
    });
    
    console.log(`✅ Usuário de teste criado com sucesso: ${novoUsuario.email}`);
    console.log('📝 Credenciais para login:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Senha: ${testUser.password}`);
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
