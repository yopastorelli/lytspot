/**
 * Script de verificação de integridade da arquitetura
 * @description Verifica se todos os arquivos necessários para a nova arquitetura estão presentes
 * @version 1.0.0 - 2025-03-12
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Lista de arquivos essenciais para a arquitetura
 * @type {Array<{path: string, description: string}>}
 */
const essentialFiles = [
  { path: 'config/environment.js', description: 'Configuração centralizada de ambiente' },
  { path: 'controllers/pricingController.js', description: 'Controlador de preços refatorado' },
  { path: 'models/seeds/serviceDefinitions.js', description: 'Definições centralizadas de serviços' },
  { path: 'models/seeds/index.js', description: 'Script unificado de seed' },
  { path: 'repositories/serviceRepository.js', description: 'Repositório de serviços' },
  { path: 'services/pricingService.js', description: 'Serviço de preços' },
  { path: 'transformers/serviceTransformer.js', description: 'Transformador de serviços' },
  { path: 'validators/serviceValidator.js', description: 'Validador de serviços' },
  { path: 'README.md', description: 'Documentação da arquitetura' },
  { path: 'CHANGELOG.md', description: 'Registro de alterações' }
];

/**
 * Verifica se um arquivo existe
 * @param {string} filePath Caminho do arquivo
 * @returns {Promise<boolean>} Verdadeiro se o arquivo existir
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica a integridade da arquitetura
 */
async function checkArchitectureIntegrity() {
  console.log('🔍 Verificando integridade da arquitetura...\n');
  
  let allFilesExist = true;
  const missingFiles = [];
  
  // Verificar cada arquivo essencial
  for (const file of essentialFiles) {
    const filePath = path.join(rootDir, file.path);
    const exists = await fileExists(filePath);
    
    if (exists) {
      console.log(`✅ ${file.path} - ${file.description}`);
    } else {
      console.error(`❌ ${file.path} - ${file.description} - AUSENTE`);
      missingFiles.push(file.path);
      allFilesExist = false;
    }
  }
  
  // Exibir resultado final
  console.log('\n');
  if (allFilesExist) {
    console.log('✅ Todos os arquivos essenciais estão presentes!');
    console.log('✅ A arquitetura está íntegra e pronta para uso.');
  } else {
    console.error('❌ Arquivos essenciais ausentes:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    console.error('\n❌ A arquitetura não está íntegra. Corrija os problemas antes de prosseguir.');
  }
  
  return allFilesExist;
}

/**
 * Verifica se há arquivos antigos que podem ser removidos
 */
async function checkLegacyFiles() {
  console.log('\n🔍 Verificando arquivos legados...\n');
  
  const legacyFiles = [
    { path: 'server/scripts/seedServicos.js.bak', description: 'Backup do script antigo de seed' },
    { path: 'populate-database.js.bak', description: 'Backup do script antigo de população do banco' }
  ];
  
  let legacyFilesFound = false;
  
  // Verificar cada arquivo legado
  for (const file of legacyFiles) {
    const filePath = path.resolve(rootDir, '..', file.path);
    const exists = await fileExists(filePath);
    
    if (exists) {
      console.log(`⚠️ ${file.path} - ${file.description} - ENCONTRADO`);
      legacyFilesFound = true;
    } else {
      console.log(`✅ ${file.path} - Não encontrado (OK)`);
    }
  }
  
  // Exibir resultado final
  console.log('\n');
  if (legacyFilesFound) {
    console.log('⚠️ Arquivos legados encontrados. Considere removê-los após verificar que a nova arquitetura está funcionando corretamente.');
  } else {
    console.log('✅ Nenhum arquivo legado encontrado.');
  }
  
  return !legacyFilesFound;
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando verificação da arquitetura...\n');
  
  try {
    // Verificar integridade da arquitetura
    const architectureIntegrity = await checkArchitectureIntegrity();
    
    // Verificar arquivos legados
    const noLegacyFiles = await checkLegacyFiles();
    
    // Verificar resultado final
    const allPassed = architectureIntegrity && noLegacyFiles;
    
    console.log('\n');
    if (allPassed) {
      console.log('✅ Verificação concluída com sucesso!');
      console.log('✅ A arquitetura está íntegra e pronta para uso.');
    } else if (architectureIntegrity && !noLegacyFiles) {
      console.log('⚠️ Verificação concluída com avisos.');
      console.log('⚠️ A arquitetura está íntegra, mas há arquivos legados que podem ser removidos.');
    } else {
      console.error('❌ Verificação concluída com erros.');
      console.error('❌ Corrija os problemas antes de prosseguir.');
    }
    
    return allPassed;
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    return false;
  }
}

// Executar a função principal se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(success => {
      console.log(`\n${success ? '✅ Verificação concluída com sucesso!' : '⚠️ Verificação concluída com avisos ou erros.'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal durante execução da verificação:', error);
      process.exit(1);
    });
}
