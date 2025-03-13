/**
 * Script para consultar serviços no banco de dados
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    // Consultar todos os serviços
    const servicos = await prisma.servico.findMany();
    
    console.log(`✅ Total de serviços encontrados: ${servicos.length}`);
    console.log(JSON.stringify(servicos, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao consultar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
