/**
 * Script para verificar a configuração e acesso ao banco de dados
 * 
 * Este script realiza uma série de verificações para garantir que o banco de dados
 * está configurado corretamente e acessível para operações de leitura e escrita.
 * 
 * @version 1.0.1 - 2025-03-13 - Melhorada a detecção de erros e uso de caminhos absolutos
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Obter caminho absoluto do banco de dados
function getAbsoluteDatabasePath() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return null;
  }
  
  if (!dbUrl.startsWith('file:')) {
    return dbUrl; // Não é um caminho de arquivo
  }
  
  let dbPath = dbUrl.replace('file:', '');
  
  // Se o caminho for relativo, torná-lo absoluto
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.resolve(rootDir, dbPath);
  }
  
  return dbPath;
}

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: `file:${getAbsoluteDatabasePath()}`
    }
  }
});

/**
 * Verifica a configuração do banco de dados
 */
async function verificarBancoDados() {
  console.log('=== VERIFICAÇÃO DO BANCO DE DADOS ===');
  console.log('Data e hora:', new Date().toISOString());
  console.log('Ambiente:', process.env.NODE_ENV || 'não definido');
  console.log('Render:', process.env.RENDER === 'true' ? 'Sim' : 'Não');
  
  // Verificar variáveis de ambiente
  console.log('\n--- Variáveis de Ambiente ---');
  console.log('DATABASE_URL original:', process.env.DATABASE_URL || 'não definida');
  
  // Verificar arquivo do banco de dados
  console.log('\n--- Arquivo do Banco de Dados ---');
  const dbPath = getAbsoluteDatabasePath();
  
  if (!dbPath) {
    console.error('❌ DATABASE_URL não definida!');
    return;
  }
  
  console.log('Caminho absoluto do banco de dados:', dbPath);
  
  try {
    // Verificar se o arquivo existe
    if (fs.existsSync(dbPath)) {
      console.log('✅ Arquivo do banco de dados existe');
      
      // Verificar tamanho do arquivo
      const stats = fs.statSync(dbPath);
      console.log(`Tamanho do arquivo: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Verificar permissões
      try {
        fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log('✅ Permissões de leitura e escrita OK');
      } catch (error) {
        console.error('❌ Erro de permissão:', error.message);
      }
    } else {
      console.error('❌ Arquivo do banco de dados não encontrado!');
      
      // Verificar diretório
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        console.error('❌ Diretório do banco de dados não existe:', dbDir);
        
        // Tentar criar o diretório
        try {
          fs.mkdirSync(dbDir, { recursive: true });
          console.log('✅ Diretório criado com sucesso:', dbDir);
          
          // Criar arquivo vazio do banco de dados
          fs.writeFileSync(dbPath, '');
          console.log('✅ Arquivo de banco de dados vazio criado:', dbPath);
        } catch (createError) {
          console.error('❌ Erro ao criar diretório ou arquivo:', createError.message);
        }
      } else {
        console.log('✅ Diretório do banco de dados existe:', dbDir);
        
        // Verificar permissões do diretório
        try {
          fs.accessSync(dbDir, fs.constants.R_OK | fs.constants.W_OK);
          console.log('✅ Permissões de leitura e escrita no diretório OK');
          
          // Criar arquivo vazio do banco de dados
          try {
            fs.writeFileSync(dbPath, '');
            console.log('✅ Arquivo de banco de dados vazio criado:', dbPath);
          } catch (createError) {
            console.error('❌ Erro ao criar arquivo de banco de dados:', createError.message);
          }
        } catch (error) {
          console.error('❌ Erro de permissão no diretório:', error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar arquivo:', error);
  }
  
  // Testar conexão com o banco de dados
  console.log('\n--- Teste de Conexão ---');
  try {
    console.log('Tentando conectar ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar consulta simples
    console.log('Executando consulta de teste...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Consulta executada com sucesso:', result);
    
    // Verificar tabelas
    console.log('\n--- Verificação de Tabelas ---');
    try {
      console.log('Contando serviços...');
      const countServicos = await prisma.servico.count();
      console.log(`✅ Tabela 'Servico' acessível - ${countServicos} registros encontrados`);
    } catch (error) {
      console.error('❌ Erro ao acessar tabela Servico:', error.message);
      
      // Verificar se o erro é devido à tabela não existir
      if (error.message.includes('does not exist')) {
        console.log('⚠️ A tabela Servico não existe. Pode ser necessário executar migrações do Prisma.');
        console.log('Comando sugerido: npx prisma migrate dev');
      }
    }
    
    try {
      console.log('Contando usuários...');
      const countUsers = await prisma.user.count();
      console.log(`✅ Tabela 'User' acessível - ${countUsers} registros encontrados`);
    } catch (error) {
      console.error('❌ Erro ao acessar tabela User:', error.message);
      
      // Verificar se o erro é devido à tabela não existir
      if (error.message.includes('does not exist')) {
        console.log('⚠️ A tabela User não existe. Pode ser necessário executar migrações do Prisma.');
        console.log('Comando sugerido: npx prisma migrate dev');
      }
    }
    
    // Testar operações CRUD
    console.log('\n--- Teste de Operações CRUD ---');
    try {
      // Criar um serviço de teste
      console.log('Criando serviço de teste...');
      const testService = await prisma.servico.create({
        data: {
          nome: 'Serviço de Teste - Verificação',
          descricao: 'Este é um serviço temporário criado para verificar o banco de dados',
          preco_base: 0.01,
          duracao_media_captura: 'N/A',
          duracao_media_tratamento: 'N/A',
          entregaveis: 'N/A'
        }
      });
      console.log('✅ Serviço criado com sucesso:', testService.id);
      
      // Atualizar o serviço
      console.log('Atualizando serviço de teste...');
      const updatedService = await prisma.servico.update({
        where: { id: testService.id },
        data: { descricao: 'Descrição atualizada para teste' }
      });
      console.log('✅ Serviço atualizado com sucesso');
      
      // Excluir o serviço
      console.log('Excluindo serviço de teste...');
      await prisma.servico.delete({
        where: { id: testService.id }
      });
      console.log('✅ Serviço excluído com sucesso');
      
      console.log('✅ Teste CRUD completo - Todas as operações funcionaram!');
    } catch (error) {
      console.error('❌ Erro no teste CRUD:', error.message);
      console.error('Detalhes do erro:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    console.error('Detalhes do erro:', error);
    
    // Sugestões para resolução de problemas comuns
    if (error.message.includes('Unable to open')) {
      console.log('\n--- Sugestões para Resolução ---');
      console.log('1. Verifique se o caminho do banco de dados está correto');
      console.log('2. Verifique se o diretório tem permissões de escrita');
      console.log('3. Execute as migrações do Prisma: npx prisma migrate dev');
      console.log('4. Tente criar manualmente o banco de dados: npx prisma db push');
    }
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    console.log('Desconectado do banco de dados');
  }
  
  console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
}

// Executar verificação
verificarBancoDados()
  .catch(error => {
    console.error('Erro fatal durante a verificação:', error);
    process.exit(1);
  });
