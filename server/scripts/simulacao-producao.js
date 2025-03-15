/**
 * Script de simulação do ambiente de produção
 * 
 * Este script simula exatamente o que acontece no código de produção
 * para identificar onde está o problema com o filtro de serviços do simulador.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import serviceRepository from '../repositories/serviceRepository.js';
import pricingService from '../services/pricingService.js';

// Cliente Prisma para acesso direto ao banco de dados
const prisma = new PrismaClient();

/**
 * Simula uma requisição ao endpoint /api/pricing?simulador=true
 */
async function simularRequisicaoAPI() {
  console.log('=== SIMULAÇÃO DE REQUISIÇÃO AO ENDPOINT /api/pricing?simulador=true ===\n');
  
  try {
    // Simular o controlador
    console.log('1. Controlador detecta parâmetro simulador=true');
    console.log('2. Controlador chama pricingService.getAllServices({ apenasSimulador: true })');
    
    // Chamar o serviço diretamente
    console.log('\n3. Executando pricingService.getAllServices({ apenasSimulador: true })');
    const servicos = await pricingService.getAllServices({ apenasSimulador: true });
    
    console.log(`\n4. Serviço retorna ${servicos.length} serviços:`);
    servicos.forEach((servico, index) => {
      console.log(`   ${index + 1}. ${servico.nome}`);
    });
    
    return servicos;
  } catch (error) {
    console.error('Erro ao simular requisição API:', error);
    return [];
  }
}

/**
 * Simula apenas a chamada ao repositório
 */
async function simularChamadaRepositorio() {
  console.log('\n=== SIMULAÇÃO DE CHAMADA DIRETA AO REPOSITÓRIO ===\n');
  
  try {
    console.log('1. Chamando serviceRepository.findAll({ apenasSimulador: true })');
    const servicos = await serviceRepository.findAll({ apenasSimulador: true });
    
    console.log(`\n2. Repositório retorna ${servicos.length} serviços:`);
    servicos.forEach((servico, index) => {
      console.log(`   ${index + 1}. ${servico.nome}`);
    });
    
    return servicos;
  } catch (error) {
    console.error('Erro ao simular chamada ao repositório:', error);
    return [];
  }
}

/**
 * Verifica se o banco de dados contém todos os serviços necessários
 */
async function verificarBancoDados() {
  console.log('\n=== VERIFICAÇÃO DO BANCO DE DADOS ===\n');
  
  try {
    // Lista de nomes de serviços que devem aparecer no simulador de preços
    const SERVICOS_SIMULADOR = [
      'VLOG - Aventuras em Família',
      'VLOG - Amigos e Comunidade',
      'Cobertura Fotográfica de Evento Social',
      'Filmagem de Evento Social',
      'Ensaio Fotográfico de Família',
      'Fotografia e Filmagem Aérea'
    ];
    
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
    } else {
      console.log('\nTodos os serviços necessários estão presentes no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  }
}

/**
 * Função principal que executa todas as simulações
 */
async function executarSimulacoes() {
  try {
    // Verificar banco de dados
    await verificarBancoDados();
    
    // Simular chamada direta ao repositório
    await simularChamadaRepositorio();
    
    // Simular requisição à API
    await simularRequisicaoAPI();
    
    console.log('\n=== SIMULAÇÃO CONCLUÍDA ===');
  } catch (error) {
    console.error('Erro ao executar simulações:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar simulações
executarSimulacoes()
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
