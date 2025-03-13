/**
 * Script para verificar e corrigir a conexão com o banco de dados
 * @description Verifica se o banco de dados está acessível e cria as tabelas necessárias
 * @version 1.0.0 - 2025-03-12
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisificar exec
const execAsync = promisify(exec);

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const databaseDir = path.resolve(rootDir);

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Verifica se o arquivo do banco de dados existe
 * @returns {Promise<boolean>} Verdadeiro se o arquivo existir
 */
async function checkDatabaseFileExists() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ Variável DATABASE_URL não definida no arquivo .env');
      return false;
    }
    
    // Extrair caminho do arquivo do SQLite da URL
    const filePath = databaseUrl.replace('file:', '').trim();
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(rootDir, filePath);
    
    console.log(`🔍 Verificando arquivo do banco de dados: ${absolutePath}`);
    
    try {
      await fs.access(absolutePath);
      console.log('✅ Arquivo do banco de dados encontrado');
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️ Arquivo do banco de dados não encontrado');
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar arquivo do banco de dados:', error);
    return false;
  }
}

/**
 * Executa o comando de migração do Prisma
 */
async function runPrismaMigration() {
  try {
    console.log('🔄 Executando migração do Prisma...');
    
    const { stdout, stderr } = await execAsync('npx prisma migrate dev --name init', {
      cwd: rootDir
    });
    
    console.log('✅ Migração concluída com sucesso');
    console.log(stdout);
    
    if (stderr) {
      console.warn('⚠️ Avisos durante a migração:', stderr);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    
    // Tentar abordagem alternativa se a migração falhar
    try {
      console.log('🔄 Tentando abordagem alternativa: prisma db push...');
      
      const { stdout, stderr } = await execAsync('npx prisma db push', {
        cwd: rootDir
      });
      
      console.log('✅ Comando db push concluído com sucesso');
      console.log(stdout);
      
      if (stderr) {
        console.warn('⚠️ Avisos durante o db push:', stderr);
      }
      
      return true;
    } catch (pushError) {
      console.error('❌ Erro ao executar db push:', pushError.message);
      return false;
    }
  }
}

/**
 * Verifica a conexão com o banco de dados
 */
async function checkDatabaseConnection() {
  try {
    console.log('🔄 Verificando conexão com o banco de dados...');
    
    // Tentar executar uma consulta simples
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Verifica se as tabelas necessárias existem
 */
async function checkTablesExist() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Verificando se as tabelas necessárias existem...');
    
    // Tentar acessar a tabela Servico
    const servicoCount = await prisma.servico.count();
    console.log(`✅ Tabela Servico existe e contém ${servicoCount} registros`);
    
    // Tentar acessar a tabela User
    const userCount = await prisma.user.count();
    console.log(`✅ Tabela User existe e contém ${userCount} registros`);
    
    return true;
  } catch (error) {
    if (error.message.includes('does not exist in the current database')) {
      console.error('❌ Uma ou mais tabelas necessárias não existem:', error.message);
      return false;
    }
    
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Corrige a URL do banco de dados no arquivo .env se necessário
 */
async function fixDatabaseUrl() {
  try {
    console.log('🔄 Verificando configuração de DATABASE_URL...');
    
    const envPath = path.join(rootDir, '.env');
    let envContent = '';
    
    // Ler conteúdo existente se o arquivo existir
    if (await fileExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf8');
    } else {
      console.log('⚠️ Arquivo .env não encontrado. Criando novo arquivo...');
      envContent = '';
    }
    
    // Verificar se DATABASE_URL já existe
    const dbUrlRegex = /DATABASE_URL\s*=\s*["'](.+)["']/;
    const match = envContent.match(dbUrlRegex);
    
    // Caminho recomendado para o banco de dados
    const recommendedPath = 'file:../database.sqlite';
    
    if (match) {
      const currentUrl = match[1];
      console.log(`📝 DATABASE_URL atual: ${currentUrl}`);
      
      if (currentUrl !== recommendedPath) {
        console.log(`🔄 Atualizando DATABASE_URL para: ${recommendedPath}`);
        envContent = envContent.replace(dbUrlRegex, `DATABASE_URL="${recommendedPath}"`);
        await fs.writeFile(envPath, envContent, 'utf8');
        console.log('✅ DATABASE_URL atualizado com sucesso');
      } else {
        console.log('✅ DATABASE_URL já está configurado corretamente');
      }
    } else {
      console.log(`📝 DATABASE_URL não encontrado. Adicionando...`);
      
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      
      envContent += `DATABASE_URL="${recommendedPath}"\n`;
      await fs.writeFile(envPath, envContent, 'utf8');
      console.log('✅ DATABASE_URL adicionado com sucesso');
    }
    
    // Recarregar variáveis de ambiente
    process.env.DATABASE_URL = recommendedPath;
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir DATABASE_URL:', error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando verificação do banco de dados...\n');
  
  try {
    // Verificar e corrigir URL do banco de dados
    await fixDatabaseUrl();
    
    // Verificar se o arquivo do banco de dados existe
    const fileExists = await checkDatabaseFileExists();
    
    // Se o arquivo não existir ou houver problemas de conexão, executar migração
    if (!fileExists || !(await checkDatabaseConnection())) {
      console.log('🔄 Executando migração para criar/atualizar o banco de dados...');
      await runPrismaMigration();
    }
    
    // Verificar se as tabelas necessárias existem
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('🔄 Executando migração para criar tabelas...');
      await runPrismaMigration();
      
      // Verificar novamente se as tabelas foram criadas
      const tablesCreated = await checkTablesExist();
      
      if (!tablesCreated) {
        throw new Error('Não foi possível criar as tabelas necessárias');
      }
    }
    
    // Importar e executar o script de seed
    console.log('🔄 Executando seed do banco de dados...');
    const { seedDatabase } = await import('../models/seeds/index.js');
    
    await seedDatabase({
      force: false,
      environment: process.env.NODE_ENV || 'development',
      syncDemoData: true
    });
    
    console.log('\n✅ Verificação e correção do banco de dados concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('\n❌ Erro durante verificação do banco de dados:', error);
    return false;
  }
}

// Executar a função principal se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(success => {
      console.log(`\n${success ? '✅ Banco de dados verificado e corrigido com sucesso!' : '❌ Não foi possível corrigir todos os problemas do banco de dados.'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal durante execução do script:', error);
      process.exit(1);
    });
}
