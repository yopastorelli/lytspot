/**
 * Inicializador do Sistema
 * 
 * Script unificado para inicialização completa do sistema, incluindo:
 * - Verificação e configuração do banco de dados
 * - Execução de migrações Prisma
 * - Criação de usuário administrador
 * - População de serviços de demonstração
 * - Verificação de integridade do sistema
 * 
 * @version 1.0.0 - 2025-03-13
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import environment from '../config/environment.js';
import { 
  log, 
  logError, 
  checkDatabaseFile, 
  executeWithRetry,
  prisma,
  directories
} from '../utils/dbUtils.js';
import { services as demoServices } from '../models/seeds/serviceDefinitions.js';

// Promisificar exec
const execAsync = promisify(exec);

/**
 * Verifica e configura o banco de dados
 */
async function setupDatabase() {
  log('Iniciando configuração do banco de dados...', 'info', 'system');
  
  // Verificar arquivo do banco de dados
  const dbCheck = await checkDatabaseFile();
  
  if (dbCheck.error) {
    log(`Erro na verificação do banco de dados: ${dbCheck.error}`, 'error', 'system');
    return false;
  }
  
  if (!dbCheck.exists) {
    log('Arquivo de banco de dados não encontrado. Será criado durante a migração.', 'info', 'system');
  } else {
    log(`Banco de dados encontrado: ${environment.dbPath}`, 'info', 'system');
    log(`Tamanho: ${(dbCheck.size / 1024).toFixed(2)} KB`, 'info', 'system');
    log(`Permissões - Leitura: ${dbCheck.permissions.read ? 'Sim' : 'Não'}, Escrita: ${dbCheck.permissions.write ? 'Sim' : 'Não'}`, 'info', 'system');
    
    if (!dbCheck.permissions.read || !dbCheck.permissions.write) {
      log('Permissões insuficientes no arquivo do banco de dados', 'error', 'system');
      return false;
    }
  }
  
  return true;
}

/**
 * Executa as migrações do Prisma
 */
async function runMigrations() {
  log('Executando migrações do Prisma...', 'info', 'system');
  
  try {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    log(`Migração concluída: ${stdout}`, 'info', 'system');
    
    if (stderr && stderr.trim() !== '') {
      log(`Avisos durante migração: ${stderr}`, 'warn', 'system');
    }
    
    return true;
  } catch (error) {
    logError('runMigrations', error);
    log('Tentando método alternativo de migração...', 'warn', 'system');
    
    try {
      // Método alternativo: gerar e executar SQL diretamente
      const { stdout, stderr } = await execAsync('npx prisma migrate dev --create-only');
      log(`Migração alternativa concluída: ${stdout}`, 'info', 'system');
      
      if (stderr && stderr.trim() !== '') {
        log(`Avisos durante migração alternativa: ${stderr}`, 'warn', 'system');
      }
      
      return true;
    } catch (migrationError) {
      logError('runMigrationsAlternative', migrationError);
      return false;
    }
  }
}

/**
 * Cria um usuário administrador se não existir
 */
async function createAdminUser() {
  log('Verificando usuário administrador...', 'info', 'system');
  
  const adminEmail = 'admin@lytspot.com.br';
  
  return await executeWithRetry(async () => {
    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      log('Usuário administrador já existe', 'info', 'system');
      return true;
    }
    
    // Criar admin se não existir
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    log('Usuário administrador criado com sucesso', 'info', 'system');
    return true;
  }, 'createAdminUser', { email: adminEmail });
}

/**
 * Popula o banco de dados com serviços de demonstração
 */
async function populateServices() {
  log('Verificando serviços de demonstração...', 'info', 'system');
  
  return await executeWithRetry(async () => {
    // Verificar se já existem serviços
    const existingServicesCount = await prisma.service.count();
    
    if (existingServicesCount > 0) {
      log(`${existingServicesCount} serviços já existem no banco de dados`, 'info', 'system');
      return true;
    }
    
    // Criar serviços de demonstração
    log('Populando serviços de demonstração...', 'info', 'system');
    
    for (const service of demoServices) {
      await prisma.service.create({
        data: {
          nome: service.nome,
          descricao: service.descricao,
          preco_base: service.preco_base,
          categoria: service.categoria,
          disponivel: service.disponivel || true,
          imagem_url: service.imagem_url || null
        }
      });
    }
    
    log(`${demoServices.length} serviços de demonstração criados com sucesso`, 'info', 'system');
    return true;
  }, 'populateServices');
}

/**
 * Verifica a integridade do banco de dados
 */
async function testDatabaseIntegrity() {
  log('Testando integridade do banco de dados...', 'info', 'system');
  
  return await executeWithRetry(async () => {
    // Criar registro de teste
    const testRecord = await prisma.testEntity.create({
      data: {
        name: `test-${Date.now()}`,
        value: 'Teste de integridade'
      }
    });
    
    // Verificar se foi criado
    const retrievedRecord = await prisma.testEntity.findUnique({
      where: { id: testRecord.id }
    });
    
    if (!retrievedRecord) {
      throw new Error('Falha ao recuperar registro de teste');
    }
    
    // Atualizar registro
    const updatedRecord = await prisma.testEntity.update({
      where: { id: testRecord.id },
      data: { value: 'Teste de integridade atualizado' }
    });
    
    if (updatedRecord.value !== 'Teste de integridade atualizado') {
      throw new Error('Falha ao atualizar registro de teste');
    }
    
    // Excluir registro
    await prisma.testEntity.delete({
      where: { id: testRecord.id }
    });
    
    // Verificar se foi excluído
    const deletedRecord = await prisma.testEntity.findUnique({
      where: { id: testRecord.id }
    });
    
    if (deletedRecord) {
      throw new Error('Falha ao excluir registro de teste');
    }
    
    log('Teste de integridade concluído com sucesso', 'info', 'system');
    return true;
  }, 'testDatabaseIntegrity');
}

/**
 * Monitora o estado atual do banco de dados
 */
async function monitorDatabase() {
  log('Monitorando estado do banco de dados...', 'info', 'system');
  
  try {
    const dbPath = environment.dbPath;
    
    if (!fs.existsSync(dbPath)) {
      log('Arquivo de banco de dados não encontrado', 'error', 'system');
      return;
    }
    
    const stats = fs.statSync(dbPath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    const lastModified = stats.mtime;
    
    log(`Tamanho atual do banco de dados: ${sizeInKB} KB`, 'info', 'system');
    log(`Última modificação: ${lastModified.toISOString()}`, 'info', 'system');
    
    // Estatísticas de tabelas
    const tables = [
      'User', 'Service', 'Order', 'TestEntity'
    ];
    
    log('Estatísticas de tabelas:', 'info', 'system');
    
    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        log(`- ${table}: ${count} registros`, 'info', 'system');
      } catch (error) {
        log(`- ${table}: Erro ao contar registros - ${error.message}`, 'warn', 'system');
      }
    }
  } catch (error) {
    logError('monitorDatabase', error);
  }
}

/**
 * Função principal que executa todas as etapas de inicialização
 */
async function initializeSystem() {
  log('=== INICIALIZAÇÃO DO SISTEMA LYTSPOT ===', 'info', 'system');
  log(`Ambiente: ${environment.env}`, 'info', 'system');
  log(`Data e hora: ${new Date().toISOString()}`, 'info', 'system');
  
  try {
    // Etapa 1: Configuração do banco de dados
    const dbSetupSuccess = await setupDatabase();
    if (!dbSetupSuccess) {
      log('Falha na configuração do banco de dados. Abortando inicialização.', 'error', 'system');
      return false;
    }
    
    // Etapa 2: Execução de migrações
    const migrationsSuccess = await runMigrations();
    if (!migrationsSuccess) {
      log('Falha na execução das migrações. Abortando inicialização.', 'error', 'system');
      return false;
    }
    
    // Etapa 3: Criação de usuário administrador
    const adminUserSuccess = await createAdminUser();
    if (!adminUserSuccess) {
      log('Falha na criação do usuário administrador. Abortando inicialização.', 'error', 'system');
      return false;
    }
    
    // Etapa 4: População de serviços
    const servicesSuccess = await populateServices();
    if (!servicesSuccess) {
      log('Falha na população de serviços. Abortando inicialização.', 'error', 'system');
      return false;
    }
    
    // Etapa 5: Teste de integridade
    const integritySuccess = await testDatabaseIntegrity();
    if (!integritySuccess) {
      log('Falha no teste de integridade. Abortando inicialização.', 'error', 'system');
      return false;
    }
    
    // Etapa 6: Monitoramento do banco de dados
    await monitorDatabase();
    
    log('=== INICIALIZAÇÃO DO SISTEMA CONCLUÍDA COM SUCESSO ===', 'info', 'system');
    return true;
  } catch (error) {
    logError('initializeSystem', error);
    log('=== FALHA NA INICIALIZAÇÃO DO SISTEMA ===', 'error', 'system');
    return false;
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar inicialização se este arquivo for executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeSystem()
    .then(success => {
      if (success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      logError('initializeSystemMain', error);
      process.exit(1);
    });
}

// Exportar funções para uso em outros módulos
export {
  setupDatabase,
  runMigrations,
  createAdminUser,
  populateServices,
  testDatabaseIntegrity,
  monitorDatabase,
  initializeSystem
};
