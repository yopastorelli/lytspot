import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script para verificar os serviços no banco de dados
 */
async function main() {
  try {
    console.log('Verificando serviços no banco de dados...');

    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany();
    
    console.log(`Total de serviços encontrados: ${servicos.length}`);
    console.log(JSON.stringify(servicos, null, 2));
  } catch (error) {
    console.error('Erro ao verificar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
