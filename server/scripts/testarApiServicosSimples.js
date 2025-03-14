/**
 * Script para testar a API de serviços de forma simples
 * @version 1.0.0 - 2025-03-14
 */

import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função para testar a transformação dos serviços
 */
async function testarTransformacaoServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    // Buscar serviços diretamente do banco
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    
    if (servicos.length > 0) {
      // Mostrar exemplo do primeiro serviço
      console.log('\nExemplo de serviço do banco:');
      const exemploServico = { ...servicos[0] };
      
      // Tentar fazer parse do campo detalhes para exibição
      try {
        if (typeof exemploServico.detalhes === 'string') {
          exemploServico.detalhes = JSON.parse(exemploServico.detalhes);
        }
      } catch (error) {
        console.log('Erro ao fazer parse do campo detalhes para exibição:', error.message);
      }
      
      console.log(JSON.stringify(exemploServico, null, 2));
      
      // Transformar serviços para o formato do simulador
      console.log('\nTransformando serviços para o formato do simulador...');
      const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicos);
      console.log(`✅ Total de serviços transformados: ${servicosTransformados.length}`);
      
      // Mostrar exemplo do primeiro serviço transformado
      if (servicosTransformados.length > 0) {
        console.log('\nExemplo de serviço transformado:');
        const exemploTransformado = { ...servicosTransformados[0] };
        console.log(JSON.stringify(exemploTransformado, null, 2));
        
        // Verificar se o campo detalhes está presente e tem a estrutura esperada
        if (exemploTransformado.detalhes) {
          console.log('\nVerificação da estrutura do campo detalhes:');
          console.log('- Campo captura:', exemploTransformado.detalhes.captura ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo tratamento:', exemploTransformado.detalhes.tratamento ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo entregaveis:', exemploTransformado.detalhes.entregaveis ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo adicionais:', exemploTransformado.detalhes.adicionais ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo deslocamento:', exemploTransformado.detalhes.deslocamento ? '✅ Presente' : '❌ Ausente');
        } else {
          console.log('\n❌ Campo detalhes ausente no serviço transformado!');
        }
      }
    } else {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao testar transformação de serviços:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função
testarTransformacaoServicos()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
