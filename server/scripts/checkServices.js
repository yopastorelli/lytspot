/**
 * Script para verificar os serviços no banco de dados
 * @version 1.0.0 - 2025-03-12
 */

import prisma from '../prisma/client.js';

async function verificarServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    const servicos = await prisma.servico.findMany();
    
    console.log(`✅ Total de serviços encontrados: ${servicos.length}`);
    console.log(JSON.stringify(servicos, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao consultar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
verificarServicos()
  .then(() => {
    console.log('✨ Consulta finalizada com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro durante a consulta:', error);
    process.exit(1);
  });
