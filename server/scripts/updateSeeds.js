/**
 * Script de atualização dos arquivos de seed
 * @description Este script atualiza os arquivos de seed antigos para utilizar a nova arquitetura centralizada
 * @version 1.0.0 - 2025-03-12
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDatabase } from '../models/seeds/index.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Atualiza o arquivo populate-database.js para utilizar a nova arquitetura
 */
async function updatePopulateDatabase() {
  console.log('🔄 Atualizando arquivo populate-database.js...');
  
  const populateDbPath = path.join(rootDir, 'populate-database.js');
  const backupPath = path.join(rootDir, 'populate-database.js.bak');
  
  try {
    // Verificar se o arquivo existe
    await fs.access(populateDbPath);
    
    // Fazer backup do arquivo original
    await fs.copyFile(populateDbPath, backupPath);
    console.log(`✅ Backup criado em: ${backupPath}`);
    
    // Criar novo conteúdo
    const newContent = `/**
 * Script para popular o banco de dados com serviços básicos
 * @version 2.0.0 - 2025-03-12 - Atualizado para utilizar a arquitetura centralizada
 * @description Este script agora utiliza o módulo centralizado de seeds
 */

import { seedDatabase } from './server/models/seeds/index.js';

// Verificar se o script deve ser executado
const FORCE_UPDATE = process.env.FORCE_UPDATE === 'true';
const SKIP_DB_POPULATION = process.env.SKIP_DB_POPULATION === 'false';

/**
 * Função principal
 */
async function popularBancoDados() {
  console.log('Iniciando script de população do banco de dados...');
  
  // Verificar se o script deve ser pulado
  if (SKIP_DB_POPULATION && !FORCE_UPDATE) {
    console.log('SKIP_DB_POPULATION está ativado (false). Pulando população do banco de dados.');
    console.log('Para forçar a execução, defina FORCE_UPDATE=true');
    return;
  }
  
  // Executar seed através do módulo centralizado
  await seedDatabase({
    force: FORCE_UPDATE,
    environment: process.env.NODE_ENV || 'development',
    syncDemoData: true
  });
}

// Executar a função principal
popularBancoDados()
  .then(() => {
    console.log('Script de população do banco de dados concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro ao executar script de população:', error);
    process.exit(1);
  });
`;
    
    // Escrever novo conteúdo
    await fs.writeFile(populateDbPath, newContent, 'utf8');
    console.log(`✅ Arquivo ${populateDbPath} atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️ Arquivo ${populateDbPath} não encontrado. Pulando atualização.`);
      return false;
    }
    
    console.error('❌ Erro ao atualizar arquivo populate-database.js:', error);
    throw error;
  }
}

/**
 * Atualiza o arquivo seedServicos.js para utilizar a nova arquitetura
 */
async function updateSeedServicos() {
  console.log('🔄 Atualizando arquivo seedServicos.js...');
  
  const seedServicosPath = path.join(rootDir, 'server', 'scripts', 'seedServicos.js');
  const backupPath = path.join(rootDir, 'server', 'scripts', 'seedServicos.js.bak');
  
  try {
    // Verificar se o arquivo existe
    await fs.access(seedServicosPath);
    
    // Fazer backup do arquivo original
    await fs.copyFile(seedServicosPath, backupPath);
    console.log(`✅ Backup criado em: ${backupPath}`);
    
    // Criar novo conteúdo
    const newContent = `/**
 * Script para popular o banco de dados com serviços
 * @version 2.0.0 - 2025-03-12 - Atualizado para utilizar a arquitetura centralizada
 * @description Este script agora utiliza o módulo centralizado de seeds
 * @deprecated Use o módulo centralizado em server/models/seeds/index.js diretamente
 */

import { seedDatabase } from '../models/seeds/index.js';

/**
 * Função principal
 */
async function main() {
  console.log('⚠️ Este script está obsoleto e será removido em versões futuras.');
  console.log('⚠️ Use o módulo centralizado em server/models/seeds/index.js diretamente.');
  
  // Executar seed através do módulo centralizado
  await seedDatabase({
    force: true,
    environment: process.env.NODE_ENV || 'development',
    syncDemoData: true
  });
}

// Executar a função principal
main()
  .then(() => {
    console.log('Script de seed concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro ao executar script de seed:', error);
    process.exit(1);
  });
`;
    
    // Escrever novo conteúdo
    await fs.writeFile(seedServicosPath, newContent, 'utf8');
    console.log(`✅ Arquivo ${seedServicosPath} atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️ Arquivo ${seedServicosPath} não encontrado. Pulando atualização.`);
      return false;
    }
    
    console.error('❌ Erro ao atualizar arquivo seedServicos.js:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando atualização dos arquivos de seed...');
  
  try {
    // Atualizar arquivos
    await updatePopulateDatabase();
    await updateSeedServicos();
    
    // Executar seed para garantir que o banco de dados está atualizado
    console.log('🔄 Executando seed do banco de dados...');
    await seedDatabase({
      force: false,
      environment: process.env.NODE_ENV || 'development',
      syncDemoData: true
    });
    
    console.log('✅ Atualização concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
    return false;
  }
}

// Executar a função principal se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(success => {
      if (success) {
        console.log('✅ Script de atualização concluído com sucesso!');
      } else {
        console.error('❌ Script de atualização concluído com erros.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal durante execução do script:', error);
      process.exit(1);
    });
}
