/**
 * Script para listar serviços do banco de dados e dados de demonstração
 * @version 1.1.0 - 2025-03-15 - Adicionado teste para o filtro de serviços do simulador
 */

import { PrismaClient } from '@prisma/client';
import { dadosDemonstracao } from '../../src/components/pricing/dadosDemonstracao.js';

const prisma = new PrismaClient();

// Lista de nomes de serviços que devem aparecer no simulador
const SERVICOS_SIMULADOR = [
  'VLOG - Aventuras em Família',
  'VLOG - Amigos e Comunidade',
  'Cobertura Fotográfica de Evento Social',
  'Filmagem de Evento Social',
  'Ensaio Fotográfico de Família',
  'Fotografia e Filmagem Aérea'
];

async function listarServicos() {
  try {
    console.log('Listando serviços do banco de dados...');
    
    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log(`\nTotal de serviços no banco: ${servicos.length}`);
    
    // Listar serviços do banco
    console.log('\nServiços do banco de dados:');
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Listar serviços de demonstração
    console.log('\nServiços de demonstração:');
    dadosDemonstracao.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Comparar serviços do banco com os de demonstração
    console.log('\nComparando serviços:');
    const servicosNoBanco = servicos.map(s => s.nome);
    const servicosNaDemonstracao = dadosDemonstracao.map(s => s.nome);
    
    // Serviços que estão na demonstração mas não no banco
    const servicosFaltando = servicosNaDemonstracao.filter(nome => !servicosNoBanco.includes(nome));
    if (servicosFaltando.length > 0) {
      console.log('\nServiços na demonstração que NÃO estão no banco:');
      servicosFaltando.forEach(nome => console.log(`- ${nome}`));
    } else {
      console.log('\nTodos os serviços da demonstração estão no banco.');
    }
    
    // Serviços que estão no banco mas não na demonstração
    const servicosExtras = servicosNoBanco.filter(nome => !servicosNaDemonstracao.includes(nome));
    if (servicosExtras.length > 0) {
      console.log('\nServiços no banco que NÃO estão na demonstração:');
      servicosExtras.forEach(nome => console.log(`- ${nome}`));
    } else {
      console.log('\nTodos os serviços do banco estão na demonstração.');
    }
    
    // Testar o filtro de serviços do simulador
    console.log('\n--- TESTE DO FILTRO DE SERVIÇOS DO SIMULADOR ---');
    
    // Filtrar manualmente os serviços que devem aparecer no simulador
    const servicosSimulador = servicos.filter(servico => SERVICOS_SIMULADOR.includes(servico.nome))
      .sort((a, b) => SERVICOS_SIMULADOR.indexOf(a.nome) - SERVICOS_SIMULADOR.indexOf(b.nome));
    
    console.log(`\nTotal de serviços filtrados para o simulador: ${servicosSimulador.length}`);
    
    // Verificar se retornou exatamente 6 serviços
    if (servicosSimulador.length !== 6) {
      console.error(`ERRO: Esperados 6 serviços, mas foram encontrados ${servicosSimulador.length}`);
    } else {
      console.log('SUCESSO: Encontrados exatamente 6 serviços');
    }
    
    // Listar nomes dos serviços do simulador
    console.log('\nNomes dos serviços do simulador:');
    servicosSimulador.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Verificar se todos os serviços esperados estão presentes
    console.log('\nVerificando se todos os serviços esperados estão presentes:');
    const servicosEncontrados = servicosSimulador.map(s => s.nome);
    const servicosSimuladorFaltando = SERVICOS_SIMULADOR.filter(nome => !servicosEncontrados.includes(nome));
    
    if (servicosSimuladorFaltando.length > 0) {
      console.error('ERRO: Os seguintes serviços estão faltando:');
      servicosSimuladorFaltando.forEach(nome => console.error(`- ${nome}`));
    } else {
      console.log('SUCESSO: Todos os serviços esperados estão presentes');
    }
    
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarServicos();
