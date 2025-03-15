/**
 * Script de diagnóstico para testar o filtro de serviços do simulador
 * 
 * Este script testa diretamente as funções de filtragem do repositório de serviços
 * para verificar se a busca por palavras-chave está funcionando corretamente.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import serviceRepository from '../repositories/serviceRepository.js';
import { PrismaClient } from '@prisma/client';

// Cliente Prisma para acesso direto ao banco de dados
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Lista de nomes de serviços que devem aparecer no simulador de preços
const SERVICOS_SIMULADOR = [
  'VLOG - Aventuras em Família',
  'VLOG - Amigos e Comunidade',
  'Cobertura Fotográfica de Evento Social',
  'Filmagem de Evento Social',
  'Ensaio Fotográfico de Família',
  'Fotografia e Filmagem Aérea'
];

// Palavras-chave para identificar serviços do simulador no banco de dados
const PALAVRAS_CHAVE_SIMULADOR = [
  'VLOG',
  'Aventuras',
  'Amigos',
  'Cobertura Fotográfica',
  'Evento Social',
  'Filmagem',
  'Ensaio Fotográfico',
  'Família',
  'Fotografia Aérea'
];

/**
 * Testa a busca exata por nomes de serviços
 */
async function testarBuscaExata() {
  console.log('\n=== TESTE DE BUSCA EXATA ===');
  
  try {
    // Buscar serviços com nomes exatos
    const servicosExatos = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`Encontrados ${servicosExatos.length} serviços com correspondência exata:`);
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
    
    return servicosExatos;
  } catch (error) {
    console.error('Erro ao testar busca exata:', error);
    return [];
  }
}

/**
 * Testa a busca por palavras-chave
 */
async function testarBuscaPorPalavrasChave() {
  console.log('\n=== TESTE DE BUSCA POR PALAVRAS-CHAVE ===');
  
  try {
    // Criar condições OR para cada palavra-chave
    const orConditions = PALAVRAS_CHAVE_SIMULADOR.map(keyword => ({
      nome: {
        contains: keyword
      }
    }));
    
    console.log('Condições OR:');
    console.log(JSON.stringify(orConditions, null, 2));
    
    // Buscar serviços por palavras-chave
    const servicosPorKeyword = await prisma.servico.findMany({
      where: {
        OR: orConditions
      }
    });
    
    console.log(`\nEncontrados ${servicosPorKeyword.length} serviços por palavras-chave:`);
    servicosPorKeyword.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    return servicosPorKeyword;
  } catch (error) {
    console.error('Erro ao testar busca por palavras-chave:', error);
    return [];
  }
}

/**
 * Testa a função findAll do repositório de serviços
 */
async function testarRepositorioFindAll() {
  console.log('\n=== TESTE DO MÉTODO findAll DO REPOSITÓRIO ===');
  
  try {
    // Chamar o método findAll com a opção apenasSimulador
    const servicos = await serviceRepository.findAll({ apenasSimulador: true });
    
    console.log(`\nEncontrados ${servicos.length} serviços pelo método findAll:`);
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    return servicos;
  } catch (error) {
    console.error('Erro ao testar repositório findAll:', error);
    return [];
  }
}

/**
 * Função principal que executa todos os testes
 */
async function executarDiagnostico() {
  console.log('=== DIAGNÓSTICO DO FILTRO DE SERVIÇOS DO SIMULADOR ===\n');
  
  try {
    // Listar todos os serviços no banco de dados
    const todosServicos = await prisma.servico.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log(`Total de serviços no banco: ${todosServicos.length}`);
    console.log('\nServiços no banco de dados:');
    todosServicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Executar testes
    const servicosExatos = await testarBuscaExata();
    const servicosPorKeyword = await testarBuscaPorPalavrasChave();
    const servicosRepositorio = await testarRepositorioFindAll();
    
    // Comparar resultados
    console.log('\n=== COMPARAÇÃO DE RESULTADOS ===');
    console.log(`Busca exata: ${servicosExatos.length} serviços`);
    console.log(`Busca por palavras-chave: ${servicosPorKeyword.length} serviços`);
    console.log(`Método findAll: ${servicosRepositorio.length} serviços`);
    
    // Verificar se há diferença entre os resultados
    if (servicosRepositorio.length !== 6) {
      console.log('\n⚠️ ALERTA: O método findAll não retornou os 6 serviços esperados!');
      
      if (servicosExatos.length === servicosRepositorio.length) {
        console.log('🔍 Diagnóstico: A busca por palavras-chave não está sendo efetiva.');
      } else {
        console.log('🔍 Diagnóstico: Há um problema na combinação dos resultados.');
      }
    } else {
      console.log('\n✅ SUCESSO: O método findAll retornou os 6 serviços esperados!');
    }
  } catch (error) {
    console.error('Erro ao executar diagnóstico:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    console.log('\nDiagnóstico concluído.');
  }
}

// Executar diagnóstico
executarDiagnostico()
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
