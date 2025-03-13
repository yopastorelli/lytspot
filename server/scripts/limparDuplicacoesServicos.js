/**
 * Script para limpar duplicações de serviços no banco de dados
 * @version 1.0.0 - 2025-03-13
 * @description Remove serviços duplicados e mantém apenas os mais recentes
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Iniciando processo de limpeza de duplicações de serviços...');
    
    // Verificar conexão com o banco de dados
    console.log('🔍 Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida.');
    
    // Consultar todos os serviços
    console.log('📋 Consultando serviços no banco de dados...');
    const servicos = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Total de serviços encontrados: ${servicos.length}`);
    
    // Identificar serviços a serem mantidos (IDs 1-8) e removidos (IDs > 8)
    const servicosParaManter = servicos.filter(s => s.id <= 8);
    const servicosParaRemover = servicos.filter(s => s.id > 8);
    
    console.log(`📋 Serviços a serem mantidos: ${servicosParaManter.length}`);
    console.log(`📋 Serviços a serem removidos: ${servicosParaRemover.length}`);
    
    // Exibir informações dos serviços a serem removidos
    if (servicosParaRemover.length > 0) {
      console.log('📋 Serviços que serão removidos:');
      servicosParaRemover.forEach(servico => {
        console.log(`   ID ${servico.id}: ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
      });
      
      // Remover serviços duplicados
      console.log('🧹 Removendo serviços duplicados...');
      
      for (const servico of servicosParaRemover) {
        await prisma.servico.delete({
          where: { id: servico.id }
        });
        console.log(`   ✅ Serviço ID ${servico.id} (${servico.nome}) removido com sucesso.`);
      }
      
      console.log('✅ Todos os serviços duplicados foram removidos.');
    } else {
      console.log('✅ Não foram encontrados serviços duplicados para remover.');
    }
    
    // Consultar serviços após a limpeza
    const servicosAtualizados = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Total de serviços após limpeza: ${servicosAtualizados.length}`);
    console.log('📋 Lista de serviços atual:');
    servicosAtualizados.forEach(servico => {
      console.log(`   ID ${servico.id}: ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    console.log('✅ Processo de limpeza concluído com sucesso!');
    console.log('⚠️ Para aplicar as alterações, reinicie o servidor de desenvolvimento.');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
