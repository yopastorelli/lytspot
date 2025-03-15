/**
 * Script para testar o filtro de serviços do simulador
 * @version 1.0.0 - 2025-03-15
 * 
 * Este script testa se o filtro de serviços do simulador está funcionando corretamente,
 * comparando os serviços retornados com e sem o filtro.
 */

import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Configurar caminhos para importação
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryPath = path.join(__dirname, '..', 'repositories', 'serviceRepository.js');

// Importar o repositório diretamente
const serviceRepositoryModule = await import(repositoryPath);
const serviceRepository = new serviceRepositoryModule.default();

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

async function testarFiltroSimulador() {
  console.log('Iniciando teste do filtro de serviços do simulador...');
  
  try {
    // Buscar todos os serviços sem filtro
    console.log('\n1. Buscando todos os serviços sem filtro:');
    const todoServicos = await serviceRepository.findAll();
    console.log(`Total de serviços no banco: ${todoServicos.length}`);
    
    // Listar nomes de todos os serviços
    console.log('\nNomes de todos os serviços:');
    todoServicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
    });
    
    // Buscar apenas serviços do simulador
    console.log('\n2. Buscando apenas serviços do simulador:');
    const servicosSimulador = await serviceRepository.findAll({ apenasSimulador: true });
    console.log(`Total de serviços do simulador: ${servicosSimulador.length}`);
    
    // Verificar se retornou exatamente 6 serviços
    if (servicosSimulador.length !== 6) {
      console.error(`ERRO: Esperados 6 serviços, mas foram retornados ${servicosSimulador.length}`);
    } else {
      console.log('SUCESSO: Retornados exatamente 6 serviços');
    }
    
    // Listar nomes dos serviços do simulador
    console.log('\nNomes dos serviços do simulador:');
    servicosSimulador.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome}`);
      
      // Verificar se o serviço está na lista esperada
      if (!SERVICOS_SIMULADOR.includes(servico.nome)) {
        console.error(`ERRO: Serviço "${servico.nome}" não deveria estar na lista do simulador`);
      }
    });
    
    // Verificar se todos os serviços esperados estão presentes
    console.log('\nVerificando se todos os serviços esperados estão presentes:');
    const servicosEncontrados = servicosSimulador.map(s => s.nome);
    const servicosFaltando = SERVICOS_SIMULADOR.filter(nome => !servicosEncontrados.includes(nome));
    
    if (servicosFaltando.length > 0) {
      console.error('ERRO: Os seguintes serviços estão faltando:');
      servicosFaltando.forEach(nome => console.error(`- ${nome}`));
    } else {
      console.log('SUCESSO: Todos os serviços esperados estão presentes');
    }
    
    // Verificar a ordem dos serviços
    console.log('\nVerificando a ordem dos serviços:');
    let ordemCorreta = true;
    
    for (let i = 0; i < servicosSimulador.length; i++) {
      const indiceEsperado = SERVICOS_SIMULADOR.indexOf(servicosSimulador[i].nome);
      if (indiceEsperado !== i) {
        console.error(`ERRO: Serviço "${servicosSimulador[i].nome}" está na posição ${i}, mas deveria estar na posição ${indiceEsperado}`);
        ordemCorreta = false;
      }
    }
    
    if (ordemCorreta) {
      console.log('SUCESSO: Todos os serviços estão na ordem correta');
    }
    
    console.log('\nTeste concluído!');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarFiltroSimulador();
