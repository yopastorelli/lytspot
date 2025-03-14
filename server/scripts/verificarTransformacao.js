/**
 * Script para verificar a transformação dos serviços
 * @version 1.0.0 - 2025-03-14
 * @description Verifica se a transformação dos serviços está gerando a estrutura correta para o frontend
 */

import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função para verificar a transformação dos serviços
 */
async function verificarTransformacao() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    // Buscar serviços diretamente do banco
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    
    if (servicos.length > 0) {
      // Mostrar detalhes de cada serviço
      console.log('\n📊 Análise detalhada de cada serviço:');
      
      for (const servico of servicos) {
        console.log(`\n🔍 Serviço ID ${servico.id}: ${servico.nome}`);
        
        // Extrair campos originais
        console.log('  📄 Campos originais:');
        console.log(`    - duracao_media_captura: "${servico.duracao_media_captura || 'não definido'}"`);
        console.log(`    - duracao_media_tratamento: "${servico.duracao_media_tratamento || 'não definido'}"`);
        
        // Verificar campo detalhes original
        console.log('  📄 Campo detalhes original:');
        let detalhesOriginais = null;
        
        if (servico.detalhes) {
          try {
            if (typeof servico.detalhes === 'string') {
              detalhesOriginais = JSON.parse(servico.detalhes);
              console.log(`    - Formato: string (JSON válido)`);
            } else if (typeof servico.detalhes === 'object') {
              detalhesOriginais = servico.detalhes;
              console.log(`    - Formato: objeto`);
            }
            
            if (detalhesOriginais) {
              console.log(`    - captura: "${detalhesOriginais.captura || 'não definido'}"`);
              console.log(`    - tratamento: "${detalhesOriginais.tratamento || 'não definido'}"`);
            }
          } catch (error) {
            console.log(`    - Erro ao fazer parse: ${error.message}`);
            console.log(`    - Valor bruto: "${servico.detalhes}"`);
          }
        } else {
          console.log(`    - Campo detalhes não definido`);
        }
        
        // Transformar serviço
        console.log('  🔄 Transformando serviço...');
        const servicoTransformado = serviceTransformer.toSimulatorFormat(servico);
        
        // Verificar resultado da transformação
        console.log('  📄 Resultado da transformação:');
        console.log(`    - detalhes.captura: "${servicoTransformado.detalhes.captura || 'não definido'}"`);
        console.log(`    - detalhes.tratamento: "${servicoTransformado.detalhes.tratamento || 'não definido'}"`);
        
        // Verificar se a transformação está correta
        const capturaCorreta = Boolean(servicoTransformado.detalhes.captura);
        const tratamentoCorreto = Boolean(servicoTransformado.detalhes.tratamento);
        
        if (capturaCorreta && tratamentoCorreto) {
          console.log('  ✅ Transformação correta: campos captura e tratamento presentes');
        } else {
          console.log('  ❌ Transformação incorreta:');
          if (!capturaCorreta) console.log('    - Campo captura ausente ou vazio');
          if (!tratamentoCorreto) console.log('    - Campo tratamento ausente ou vazio');
        }
      }
      
      // Resumo geral
      console.log('\n📊 Resumo geral:');
      const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicos);
      const servicosComCaptura = servicosTransformados.filter(s => Boolean(s.detalhes.captura)).length;
      const servicosComTratamento = servicosTransformados.filter(s => Boolean(s.detalhes.tratamento)).length;
      
      console.log(`✅ Serviços com campo captura: ${servicosComCaptura}/${servicos.length} (${Math.round(servicosComCaptura/servicos.length*100)}%)`);
      console.log(`✅ Serviços com campo tratamento: ${servicosComTratamento}/${servicos.length} (${Math.round(servicosComTratamento/servicos.length*100)}%)`);
      
      if (servicosComCaptura === servicos.length && servicosComTratamento === servicos.length) {
        console.log('\n🎉 Todos os serviços estão com a estrutura correta para o frontend!');
      } else {
        console.log('\n⚠️ Alguns serviços não estão com a estrutura correta para o frontend.');
        console.log('   Verifique os detalhes acima e corrija os problemas encontrados.');
      }
    } else {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar transformação dos serviços:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função
verificarTransformacao()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
