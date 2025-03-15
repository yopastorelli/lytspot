/**
 * Script de teste simples para o filtro de serviços do simulador
 */

import { PrismaClient } from '@prisma/client';

// Cliente Prisma para acesso direto ao banco de dados
const prisma = new PrismaClient();

// Lista de nomes de serviços que devem aparecer no simulador de preços
const SERVICOS_SIMULADOR = [
  'VLOG - Aventuras em Família',
  'VLOG - Amigos e Comunidade',
  'Cobertura Fotográfica de Evento Social',
  'Filmagem de Evento Social',
  'Ensaio Fotográfico de Família',
  'Fotografia e Filmagem Aérea'
];

async function testarBuscaExata() {
  try {
    console.log('\n=== TESTE DE BUSCA EXATA ===');
    
    // Buscar serviços com nomes exatos
    const servicosExatos = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`\nEncontrados ${servicosExatos.length} serviços com correspondência exata:`);
    servicosExatos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Verificar quais serviços não foram encontrados
    const nomesEncontrados = servicosExatos.map(s => s.nome);
    const nomesFaltando = SERVICOS_SIMULADOR.filter(nome => !nomesEncontrados.includes(nome));
    
    if (nomesFaltando.length > 0) {
      console.log('\nServiços não encontrados com busca exata:');
      nomesFaltando.forEach(nome => console.log(`- ${nome}`));
    }
  } catch (error) {
    console.error('Erro ao testar busca exata:', error);
  }
}

// Executar teste
testarBuscaExata()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
