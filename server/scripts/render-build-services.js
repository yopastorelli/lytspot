/**
 * Script para atualização de serviços durante o build no Render
 * @version 1.0.0 - 2025-03-13
 * @description Script para ser executado durante o processo de build no Render
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();

/**
 * Função principal para atualização de serviços no Render
 */
async function atualizarServicosRender() {
  console.log('\n🔄 Iniciando atualização de serviços no ambiente Render...\n');
  
  // Verificar se a sincronização está habilitada
  const syncEnabled = process.env.ENABLE_SERVICES_SYNC === 'true';
  
  if (!syncEnabled) {
    console.log('⚠️ Sincronização de serviços desabilitada (ENABLE_SERVICES_SYNC=false).');
    console.log('⚠️ Para habilitar, defina a variável de ambiente ENABLE_SERVICES_SYNC=true no painel do Render.');
    console.log('⚠️ Pulando a atualização de serviços.');
    return;
  }
  
  try {
    console.log('✅ Sincronização de serviços habilitada (ENABLE_SERVICES_SYNC=true).');
    console.log('🔄 Executando atualização de serviços...');
    
    // Executar atualização de serviços
    try {
      console.log('\n📊 Executando atualização em massa de serviços...');
      execSync('node server/scripts/atualizarServicosProd.js', { stdio: 'inherit' });
      console.log('✅ Atualização em massa concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro durante a atualização em massa:', error.message);
      console.log('⚠️ Continuando com o processo de build...');
    }
    
    // Sincronizar dados de demonstração
    try {
      console.log('\n📊 Sincronizando dados de demonstração...');
      execSync('node server/scripts/atualizarDadosDemonstracao.js --build', { stdio: 'inherit' });
      console.log('✅ Sincronização de dados concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro durante a sincronização de dados:', error.message);
      console.log('⚠️ Continuando com o processo de build...');
    }
    
    console.log('\n✨ Processo de atualização de serviços concluído com sucesso!');
    console.log('⚠️ IMPORTANTE: Lembre-se de desativar a sincronização após o deploy definindo ENABLE_SERVICES_SYNC=false');
    
  } catch (error) {
    console.error('❌ Erro durante o processo de atualização:', error);
  }
}

// Executar a função principal
atualizarServicosRender()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
