/**
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
    console.log('✅ Script de seed concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro ao executar script de seed:', error);
    process.exit(1);
  });
