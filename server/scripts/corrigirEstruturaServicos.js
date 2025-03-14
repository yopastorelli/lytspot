/**
 * Script para corrigir a estrutura dos serviços no banco de dados
 * @version 1.0.0 - 2025-03-14
 * @description Garante que todos os serviços tenham o campo detalhes corretamente estruturado
 */

import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função para corrigir a estrutura dos serviços no banco de dados
 */
async function corrigirEstruturaServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    // Buscar serviços diretamente do banco
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    
    if (servicos.length > 0) {
      console.log('\n📝 Iniciando correção da estrutura dos serviços...');
      
      // Array para armazenar as promessas de atualização
      const atualizacoes = [];
      
      // Iterar sobre cada serviço para corrigir sua estrutura
      for (const servico of servicos) {
        try {
          // Verificar se o campo detalhes está em formato válido
          let detalhesObj = {};
          
          if (servico.detalhes) {
            try {
              // Se for string, tenta fazer parse
              if (typeof servico.detalhes === 'string') {
                detalhesObj = JSON.parse(servico.detalhes);
              } 
              // Se já for objeto, usa diretamente
              else if (typeof servico.detalhes === 'object') {
                detalhesObj = servico.detalhes;
              }
            } catch (parseError) {
              console.error(`⚠️ Erro ao fazer parse do campo detalhes do serviço ${servico.id}:`, parseError.message);
              // Criar objeto vazio para prosseguir com a correção
              detalhesObj = {};
            }
          }
          
          // Garantir que os campos necessários estejam presentes no objeto detalhes
          detalhesObj = {
            captura: detalhesObj.captura || servico.duracao_media_captura || '',
            tratamento: detalhesObj.tratamento || servico.duracao_media_tratamento || '',
            entregaveis: detalhesObj.entregaveis || servico.entregaveis || '',
            adicionais: detalhesObj.adicionais || servico.possiveis_adicionais || '',
            deslocamento: detalhesObj.deslocamento || servico.valor_deslocamento || ''
          };
          
          // Converter o objeto detalhes para string JSON
          const detalhesString = JSON.stringify(detalhesObj);
          
          // Atualizar o serviço no banco de dados
          atualizacoes.push(
            prisma.servico.update({
              where: { id: servico.id },
              data: {
                detalhes: detalhesString,
                // Atualizar também os campos individuais para garantir consistência
                duracao_media_captura: detalhesObj.captura,
                duracao_media_tratamento: detalhesObj.tratamento,
                entregaveis: detalhesObj.entregaveis,
                possiveis_adicionais: detalhesObj.adicionais,
                valor_deslocamento: detalhesObj.deslocamento
              }
            }).then(() => {
              console.log(`✅ Serviço "${servico.nome}" (ID: ${servico.id}) atualizado com sucesso`);
            }).catch(updateError => {
              console.error(`❌ Erro ao atualizar serviço "${servico.nome}" (ID: ${servico.id}):`, updateError.message);
            })
          );
        } catch (servicoError) {
          console.error(`❌ Erro ao processar serviço ${servico.id}:`, servicoError.message);
        }
      }
      
      // Aguardar todas as atualizações
      console.log('\n⏳ Aguardando conclusão de todas as atualizações...');
      await Promise.all(atualizacoes);
      console.log('✅ Todas as atualizações concluídas!');
      
      // Verificar os serviços atualizados
      console.log('\n🔍 Verificando serviços após atualização...');
      const servicosAtualizados = await prisma.servico.findMany();
      
      if (servicosAtualizados.length > 0) {
        // Mostrar exemplo do primeiro serviço atualizado
        console.log('\nExemplo de serviço após atualização:');
        const exemploServico = { ...servicosAtualizados[0] };
        
        // Tentar fazer parse do campo detalhes para exibição
        try {
          if (typeof exemploServico.detalhes === 'string') {
            exemploServico.detalhes = JSON.parse(exemploServico.detalhes);
          }
        } catch (error) {
          console.error('Erro ao fazer parse do campo detalhes para exibição:', error.message);
        }
        
        console.log(JSON.stringify(exemploServico, null, 2));
        
        // Transformar serviços para o formato do simulador
        console.log('\nTransformando serviços para o formato do simulador...');
        const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicosAtualizados);
        console.log(`✅ Total de serviços transformados: ${servicosTransformados.length}`);
        
        // Mostrar exemplo do primeiro serviço transformado
        if (servicosTransformados.length > 0) {
          console.log('\nExemplo de serviço transformado:');
          const exemploTransformado = { ...servicosTransformados[0] };
          console.log(JSON.stringify(exemploTransformado, null, 2));
        }
      }
    } else {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao corrigir estrutura dos serviços:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função
corrigirEstruturaServicos()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
