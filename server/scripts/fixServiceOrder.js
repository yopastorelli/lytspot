/**
 * Script para verificar e corrigir a ordem dos serviços no banco de dados
 * @version 1.0.0 - 2025-03-14 - Implementação inicial
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Criar cliente Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Ordem específica dos serviços conforme definido nas memórias
const ORDEM_SERVICOS = [
  "VLOG - Aventuras em Família",
  "VLOG - Amigos e Comunidade",
  "Cobertura Fotográfica de Evento Social",
  "Filmagem de Evento Social",
  "Ensaio Fotográfico de Família",
  "Filmagem Aérea com Drone",
  "Fotografia Aérea com Drone"
];

/**
 * Verifica e corrige a ordem dos serviços no banco de dados
 */
async function fixServiceOrder() {
  console.log('🔧 Iniciando verificação e correção da ordem dos serviços...');
  
  try {
    // Buscar todos os serviços
    console.log('🔄 Buscando serviços no banco de dados...');
    const servicos = await prisma.servico.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log(`✅ Encontrados ${servicos.length} serviços no banco de dados.`);
    
    if (servicos.length === 0) {
      console.warn('⚠️ Nenhum serviço encontrado no banco de dados. Nada a fazer.');
      return;
    }
    
    // Verificar quais serviços da ordem específica existem no banco
    const servicosExistentes = ORDEM_SERVICOS.filter(nome => 
      servicos.some(s => s.nome === nome)
    );
    
    console.log(`ℹ️ Serviços da ordem específica encontrados: ${servicosExistentes.length}/${ORDEM_SERVICOS.length}`);
    
    // Verificar serviços faltantes
    const servicosFaltantes = ORDEM_SERVICOS.filter(nome => 
      !servicos.some(s => s.nome === nome)
    );
    
    if (servicosFaltantes.length > 0) {
      console.warn('⚠️ Alguns serviços da ordem específica não foram encontrados:');
      servicosFaltantes.forEach(nome => console.log(`   - ${nome}`));
    }
    
    // Verificar serviços extras (não esperados)
    const servicosExtras = servicos
      .filter(s => !ORDEM_SERVICOS.includes(s.nome))
      .map(s => s.nome);
    
    if (servicosExtras.length > 0) {
      console.log('ℹ️ Serviços adicionais encontrados:');
      servicosExtras.forEach(nome => console.log(`   - ${nome}`));
    }
    
    // Verificar se a ordem atual está correta
    const ordemAtual = servicos.map(s => s.nome);
    const ordemEsperadaExistente = ORDEM_SERVICOS.filter(nome => ordemAtual.includes(nome));
    
    let ordemCorreta = true;
    let ultimoIndiceEncontrado = -1;
    
    for (const nome of ordemEsperadaExistente) {
      const indiceAtual = ordemAtual.indexOf(nome);
      if (indiceAtual > ultimoIndiceEncontrado) {
        ultimoIndiceEncontrado = indiceAtual;
      } else {
        ordemCorreta = false;
        break;
      }
    }
    
    if (ordemCorreta) {
      console.log('✅ A ordem dos serviços existentes já está correta!');
      
      // Exibir a ordem atual
      console.log('📋 Ordem atual dos serviços:');
      servicos.forEach((servico, index) => {
        console.log(`   ${index + 1}. ${servico.nome}`);
      });
      
      return;
    }
    
    console.log('⚠️ A ordem dos serviços não está correta. Iniciando correção...');
    
    // Criar um mapa de serviços por nome para facilitar o acesso
    const servicosPorNome = {};
    servicos.forEach(s => {
      servicosPorNome[s.nome] = s;
    });
    
    // Atualizar a ordem dos serviços
    console.log('🔄 Atualizando a ordem dos serviços...');
    
    // Primeiro, ordenar os serviços conforme a ordem específica
    const servicosOrdenados = [
      ...ORDEM_SERVICOS.filter(nome => servicosPorNome[nome]).map(nome => servicosPorNome[nome]),
      ...servicos.filter(s => !ORDEM_SERVICOS.includes(s.nome))
    ];
    
    // Exibir a nova ordem
    console.log('📋 Nova ordem dos serviços:');
    servicosOrdenados.forEach((servico, index) => {
      console.log(`   ${index + 1}. ${servico.nome}`);
    });
    
    // Perguntar se deseja continuar
    console.log('\n⚠️ ATENÇÃO: Esta operação irá atualizar a ordem dos serviços no banco de dados.');
    console.log('Para continuar, execute este script com o argumento --confirm');
    
    // Verificar se o argumento --confirm foi passado
    if (process.argv.includes('--confirm')) {
      console.log('🔄 Confirmação recebida. Atualizando banco de dados...');
      
      // Atualizar cada serviço com sua nova posição
      for (let i = 0; i < servicosOrdenados.length; i++) {
        const servico = servicosOrdenados[i];
        await prisma.servico.update({
          where: { id: servico.id },
          data: { ordem: i + 1 } // Começar do 1 para facilitar a leitura
        });
      }
      
      console.log('✅ Ordem dos serviços atualizada com sucesso!');
    } else {
      console.log('ℹ️ Operação cancelada. Nenhuma alteração foi feita.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir a ordem dos serviços:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
fixServiceOrder()
  .catch(e => {
    console.error('❌ Erro não tratado:', e);
    process.exit(1);
  });
