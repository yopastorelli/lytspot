/**
 * Script para contar e listar os nomes dos serviços no banco de dados
 * @version 1.0.0 - 2025-03-14
 */

import { PrismaClient } from '@prisma/client';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

async function contarServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    const servicos = await prisma.servico.findMany({
      select: {
        id: true,
        nome: true
      }
    });
    
    console.log(`✅ Total de serviços encontrados: ${servicos.length}\n`);
    
    // Exibir lista simples de serviços
    console.log('Lista de serviços:');
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ID: ${servico.id} - ${servico.nome}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao consultar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
contarServicos()
  .then(() => {
    console.log('\n✨ Contagem finalizada com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro durante a contagem:', error);
    process.exit(1);
  });
