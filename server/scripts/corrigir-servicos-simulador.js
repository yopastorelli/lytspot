/**
 * Script para corrigir problemas nos serviços do simulador
 * 
 * Este script corrige problemas estruturais nos serviços do banco de dados
 * que podem estar causando a exibição incorreta no simulador de preços.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o cliente Prisma
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
 * Função principal para corrigir os serviços do simulador
 */
async function corrigirServicosSimulador() {
  console.log('=== CORREÇÃO DE SERVIÇOS DO SIMULADOR ===\n');
  
  try {
    // 1. Buscar serviços do simulador no banco de dados
    console.log('1. Buscando serviços do simulador no banco de dados...');
    const servicos = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`\nEncontrados ${servicos.length} serviços para o simulador:`);
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id})`);
    });
    
    // 2. Verificar se todos os serviços esperados estão presentes
    console.log('\n2. Verificando se todos os serviços esperados estão presentes...');
    const nomesEncontrados = servicos.map(servico => servico.nome);
    const servicosFaltantes = SERVICOS_SIMULADOR.filter(nome => !nomesEncontrados.includes(nome));
    
    if (servicosFaltantes.length > 0) {
      console.warn(`⚠️ Há ${servicosFaltantes.length} serviços esperados que não foram encontrados:`);
      servicosFaltantes.forEach(nome => console.log(`- ${nome}`));
    } else {
      console.log('✅ Todos os serviços esperados estão presentes.');
    }
    
    // 3. Verificar e corrigir problemas estruturais nos serviços
    console.log('\n3. Verificando e corrigindo problemas estruturais...');
    
    let servicosCorrigidos = 0;
    
    for (const servico of servicos) {
      console.log(`\nProcessando serviço ID ${servico.id}: ${servico.nome}`);
      
      // Verificar se o campo detalhes está presente e válido
      let detalhesObj = null;
      let precisaCorrigir = false;
      
      // Tentar fazer parse do campo detalhes se existir
      if (servico.detalhes) {
        try {
          if (typeof servico.detalhes === 'string') {
            detalhesObj = JSON.parse(servico.detalhes);
            console.log(`Campo detalhes existente (string): ${servico.detalhes.substring(0, 100)}...`);
          } else if (typeof servico.detalhes === 'object') {
            detalhesObj = servico.detalhes;
            console.log('Campo detalhes existente (objeto)');
          }
          
          // Verificar se os campos necessários existem
          if (!detalhesObj.captura || !detalhesObj.tratamento) {
            console.log('Campo detalhes existe, mas está incompleto. Será corrigido.');
            precisaCorrigir = true;
          }
        } catch (error) {
          console.error(`Erro ao fazer parse do campo detalhes: ${error.message}`);
          console.log('Campo detalhes inválido. Será reconstruído.');
          precisaCorrigir = true;
        }
      } else {
        console.log('Campo detalhes não existe ou é nulo. Será criado.');
        precisaCorrigir = true;
      }
      
      // Corrigir o serviço se necessário
      if (precisaCorrigir) {
        // Preparar dados para atualização
        const dadosAtualizados = prepareServiceDataForDatabase({
          ...servico,
          // Garantir que os campos necessários existam
          duracao_media_captura: servico.duracao_media_captura || detalhesObj?.captura || 'Sob consulta',
          duracao_media_tratamento: servico.duracao_media_tratamento || detalhesObj?.tratamento || 'Sob consulta',
          entregaveis: servico.entregaveis || detalhesObj?.entregaveis || '',
          possiveis_adicionais: servico.possiveis_adicionais || detalhesObj?.adicionais || '',
          valor_deslocamento: servico.valor_deslocamento || detalhesObj?.deslocamento || 'Sob consulta'
        });
        
        // Atualizar o serviço no banco de dados
        await prisma.servico.update({
          where: { id: servico.id },
          data: {
            detalhes: dadosAtualizados.detalhes,
            duracao_media_captura: dadosAtualizados.duracao_media_captura,
            duracao_media_tratamento: dadosAtualizados.duracao_media_tratamento,
            entregaveis: dadosAtualizados.entregaveis,
            possiveis_adicionais: dadosAtualizados.possiveis_adicionais,
            valor_deslocamento: dadosAtualizados.valor_deslocamento
          }
        });
        
        console.log(`✅ Serviço ID ${servico.id} corrigido com sucesso.`);
        servicosCorrigidos++;
      } else {
        console.log(`✅ Serviço ID ${servico.id} já está correto.`);
      }
    }
    
    console.log(`\n✅ Correção concluída. ${servicosCorrigidos} serviços foram atualizados.`);
    
    // 4. Verificar se há IDs duplicados
    console.log('\n4. Verificando IDs duplicados...');
    const ids = servicos.map(servico => servico.id);
    const idsUnicos = [...new Set(ids)];
    
    if (ids.length !== idsUnicos.length) {
      console.warn('⚠️ Há IDs duplicados nos serviços!');
      
      // Identificar quais IDs estão duplicados
      const contagem = {};
      ids.forEach(id => {
        contagem[id] = (contagem[id] || 0) + 1;
      });
      
      const duplicados = Object.entries(contagem)
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => ({ id, count }));
      
      console.log('IDs duplicados:', duplicados);
      
      // Este é um problema mais sério que requer intervenção manual
      console.error('\n⚠️ ATENÇÃO: IDs duplicados podem indicar um problema no banco de dados.');
      console.error('Este script não pode corrigir automaticamente IDs duplicados.');
      console.error('Recomenda-se verificar e corrigir manualmente o banco de dados.');
    } else {
      console.log('✅ Não há IDs duplicados.');
    }
    
    // 5. Resumo e recomendações
    console.log('\n5. Resumo e recomendações:');
    
    if (servicosCorrigidos > 0 || servicosFaltantes.length > 0) {
      console.log(`
✅ Ações realizadas:
${servicosCorrigidos > 0 ? `- ${servicosCorrigidos} serviços foram atualizados com estrutura corrigida` : ''}
${servicosFaltantes.length > 0 ? `- Identificados ${servicosFaltantes.length} serviços faltantes` : ''}

Recomendações:
1. Reinicie o servidor para aplicar as alterações.
2. Limpe o cache do navegador antes de testar novamente o simulador.
3. Verifique se o componente PriceSimulator está exibindo corretamente todos os serviços.
`);
    } else {
      console.log(`
✅ Todos os serviços do simulador estão estruturalmente corretos.

Se ainda houver problemas na exibição dos serviços no simulador, verifique:
1. O componente PriceSimulator para garantir que não há filtros adicionais sendo aplicados.
2. A transformação de dados no serviceTransformer.js.
3. O cache do navegador (limpe-o antes de testar novamente).
`);
    }
    
    return {
      total: servicos.length,
      corrigidos: servicosCorrigidos,
      faltantes: servicosFaltantes.length
    };
  } catch (error) {
    console.error('\n❌ ERRO ao corrigir serviços:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
corrigirServicosSimulador()
  .then(resultado => {
    console.log('\n=== CORREÇÃO CONCLUÍDA ===');
    console.log('Resultado:', resultado);
  })
  .catch(error => {
    console.error('\n❌ ERRO FATAL:', error);
    process.exit(1);
  });
