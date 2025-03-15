/**
 * Script para analisar os serviços que são exibidos no simulador
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';
import { servicos as dadosDemonstracao } from '../../src/components/pricing/dadosDemonstracao.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

async function analisarServicos() {
  try {
    console.log('🔍 Analisando serviços para o simulador de preços...\n');
    
    // 1. Buscar todos os serviços do banco
    const servicosBanco = await prisma.servico.findMany();
    console.log(`✅ Total de serviços no banco de dados: ${servicosBanco.length}`);
    
    // 2. Transformar serviços para o formato do simulador
    const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicosBanco);
    console.log(`✅ Total de serviços transformados: ${servicosTransformados.length}`);
    
    // 3. Listar serviços de demonstração
    console.log(`✅ Total de serviços nos dados de demonstração: ${dadosDemonstracao.length}`);
    
    console.log('\n--- COMPARAÇÃO DE SERVIÇOS ---\n');
    
    // 4. Listar nomes dos serviços de demonstração
    console.log('Serviços nos dados de demonstração:');
    dadosDemonstracao.forEach((servico, index) => {
      console.log(`${index + 1}. ID: ${servico.id} - ${servico.nome}`);
    });
    
    console.log('\nServiços transformados do banco (primeiros 8):');
    servicosTransformados.slice(0, 8).forEach((servico, index) => {
      console.log(`${index + 1}. ID: ${servico.id} - ${servico.nome}`);
    });
    
    // 5. Verificar se há algum filtro sendo aplicado
    console.log('\nAnálise de possíveis filtros:');
    
    // Verificar se há algum padrão nos IDs dos serviços transformados
    const idsTransformados = servicosTransformados.map(s => s.id).sort((a, b) => a - b);
    console.log('IDs dos serviços transformados (ordenados):', idsTransformados);
    
    // Verificar se há algum padrão nos nomes dos serviços transformados
    const nomesTransformados = servicosTransformados.map(s => s.nome);
    
    // Verificar correspondência entre serviços de demonstração e transformados
    console.log('\nCorrespondência entre serviços de demonstração e transformados:');
    dadosDemonstracao.forEach(servicoDemo => {
      const correspondente = servicosTransformados.find(
        s => s.nome.toLowerCase() === servicoDemo.nome.toLowerCase() || 
             s.nome.toLowerCase().includes(servicoDemo.nome.toLowerCase()) ||
             servicoDemo.nome.toLowerCase().includes(s.nome.toLowerCase())
      );
      
      if (correspondente) {
        console.log(`✅ Serviço de demonstração "${servicoDemo.nome}" (ID: ${servicoDemo.id}) corresponde a "${correspondente.nome}" (ID: ${correspondente.id})`);
      } else {
        console.log(`❌ Serviço de demonstração "${servicoDemo.nome}" (ID: ${servicoDemo.id}) não tem correspondente nos transformados`);
      }
    });
    
    // Identificar serviços transformados que não têm correspondente nos dados de demonstração
    console.log('\nServiços transformados sem correspondente nos dados de demonstração:');
    let contadorExtras = 0;
    
    servicosTransformados.forEach(servicoTransf => {
      const correspondente = dadosDemonstracao.find(
        s => s.nome.toLowerCase() === servicoTransf.nome.toLowerCase() || 
             s.nome.toLowerCase().includes(servicoTransf.nome.toLowerCase()) ||
             servicoTransf.nome.toLowerCase().includes(s.nome.toLowerCase())
      );
      
      if (!correspondente) {
        console.log(`➕ Serviço extra: "${servicoTransf.nome}" (ID: ${servicoTransf.id})`);
        contadorExtras++;
      }
    });
    
    console.log(`\nTotal de serviços extras identificados: ${contadorExtras}`);
    
  } catch (error) {
    console.error('❌ Erro ao analisar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
analisarServicos()
  .then(() => {
    console.log('\n✨ Análise finalizada com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro durante a análise:', error);
    process.exit(1);
  });
