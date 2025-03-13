/**
 * Script para limpar o cache e atualizar o servidor
 * @version 1.0.0 - 2025-03-13
 * @description Limpa o cache da API e reinicia o servidor para aplicar alterações no banco de dados
 */

import { clearCache } from '../middleware/cache.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Iniciando processo de limpeza de cache e atualização do servidor...');
    
    // Limpar o cache da API
    console.log('🧹 Limpando cache da API...');
    clearCache();
    console.log('✅ Cache da API limpo com sucesso!');
    
    // Verificar conexão com o banco de dados
    console.log('🔍 Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida.');
    
    // Consultar serviços para verificar se estão atualizados
    const servicos = await prisma.servico.findMany();
    console.log(`📋 Total de serviços no banco: ${servicos.length}`);
    
    // Exibir informações resumidas dos serviços
    console.log('📋 Resumo dos serviços:');
    servicos.forEach(servico => {
      console.log(`${servico.id}. ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    console.log('✅ Processo concluído com sucesso!');
    console.log('⚠️ Para aplicar as alterações, reinicie o servidor de desenvolvimento.');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
