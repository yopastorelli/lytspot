/**
 * Script para verificar a transformação de serviços
 * 
 * Este script simula o processo completo de obtenção e transformação de serviços
 * para identificar por que apenas um serviço está sendo exibido no simulador.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';

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

/**
 * Verifica o processo de transformação de serviços
 */
async function verificarTransformacao() {
  console.log('=== VERIFICAÇÃO DO PROCESSO DE TRANSFORMAÇÃO DE SERVIÇOS ===\n');
  
  try {
    // 1. Buscar serviços do banco de dados
    console.log('1. Buscando serviços do banco de dados...');
    const servicos = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`\nEncontrados ${servicos.length} serviços no banco de dados:`);
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id})`);
    });
    
    // 2. Verificar os IDs dos serviços
    console.log('\n2. Verificando IDs dos serviços...');
    const ids = servicos.map(s => s.id);
    const idsUnicos = [...new Set(ids)];
    
    if (ids.length !== idsUnicos.length) {
      console.log('\n⚠️ ALERTA: Há IDs duplicados nos serviços!');
      console.log(`IDs: ${ids.join(', ')}`);
    } else {
      console.log('Todos os IDs são únicos.');
    }
    
    // 3. Transformar serviços individualmente
    console.log('\n3. Transformando serviços individualmente...');
    
    const servicosTransformados = [];
    for (const servico of servicos) {
      console.log(`\nTransformando serviço: ${servico.nome} (ID: ${servico.id})`);
      
      // Verificar estrutura do serviço antes da transformação
      console.log(`- Campo detalhes (tipo): ${typeof servico.detalhes}`);
      if (servico.detalhes) {
        if (typeof servico.detalhes === 'string') {
          console.log(`- Campo detalhes (conteúdo): ${servico.detalhes.substring(0, 50)}...`);
        } else {
          console.log(`- Campo detalhes (conteúdo): ${JSON.stringify(servico.detalhes).substring(0, 50)}...`);
        }
      } else {
        console.log('- Campo detalhes: null ou undefined');
      }
      
      // Transformar serviço
      const transformado = serviceTransformer.toSimulatorFormat(servico);
      servicosTransformados.push(transformado);
      
      // Verificar resultado da transformação
      console.log(`- Resultado: ID=${transformado.id}, Nome=${transformado.nome}`);
      console.log(`- Detalhes transformados: ${JSON.stringify(transformado.detalhes).substring(0, 100)}...`);
    }
    
    // 4. Transformar serviços como lista
    console.log('\n4. Transformando serviços como lista...');
    const listaTransformada = serviceTransformer.toSimulatorFormatList(servicos);
    
    console.log(`\nResultado da transformação em lista: ${listaTransformada.length} serviços`);
    listaTransformada.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id})`);
    });
    
    // 5. Verificar IDs após transformação
    console.log('\n5. Verificando IDs após transformação...');
    const idsTransformados = listaTransformada.map(s => s.id);
    const idsTransformadosUnicos = [...new Set(idsTransformados)];
    
    if (idsTransformados.length !== idsTransformadosUnicos.length) {
      console.log('\n⚠️ ALERTA: Há IDs duplicados nos serviços transformados!');
      console.log(`IDs: ${idsTransformados.join(', ')}`);
      
      // Identificar quais IDs estão duplicados
      const contagem = {};
      idsTransformados.forEach(id => {
        contagem[id] = (contagem[id] || 0) + 1;
      });
      
      const duplicados = Object.entries(contagem)
        .filter(([_, count]) => count > 1)
        .map(([id, _]) => id);
      
      console.log(`IDs duplicados: ${duplicados.join(', ')}`);
      
      // Mostrar detalhes dos serviços com IDs duplicados
      console.log('\nDetalhes dos serviços com IDs duplicados:');
      duplicados.forEach(idDuplicado => {
        const servicosComIdDuplicado = listaTransformada.filter(s => s.id == idDuplicado);
        servicosComIdDuplicado.forEach((servico, index) => {
          console.log(`\nServiço ${index + 1} com ID ${idDuplicado}:`);
          console.log(`- Nome: ${servico.nome}`);
          console.log(`- Preço base: ${servico.preco_base}`);
          console.log(`- Detalhes: ${JSON.stringify(servico.detalhes).substring(0, 100)}...`);
        });
      });
    } else {
      console.log('Todos os IDs permanecem únicos após a transformação.');
    }
    
    return {
      servicosOriginais: servicos,
      servicosTransformados: listaTransformada
    };
  } catch (error) {
    console.error('Erro ao verificar transformação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
verificarTransformacao()
  .then(resultado => {
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    console.log(`Serviços originais: ${resultado.servicosOriginais.length}`);
    console.log(`Serviços transformados: ${resultado.servicosTransformados.length}`);
  })
  .catch(error => {
    console.error('\n❌ ERRO FATAL:', error);
    process.exit(1);
  });
