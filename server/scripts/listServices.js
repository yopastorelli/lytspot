/**
 * Script para listar os serviços no banco de dados de forma mais legível
 * @version 1.1.0 - 2025-03-14 - Adicionada exibição do campo detalhes
 */

import prisma from '../prisma/client.js';

async function listarServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    const servicos = await prisma.servico.findMany();
    
    console.log(`✅ Total de serviços encontrados: ${servicos.length}\n`);
    
    // Exibir cada serviço de forma mais legível
    servicos.forEach((servico, index) => {
      console.log(`\n--- SERVIÇO ${index + 1} ---`);
      console.log(`ID: ${servico.id}`);
      console.log(`Nome: ${servico.nome}`);
      console.log(`Preço Base: R$ ${servico.preco_base.toFixed(2)}`);
      console.log(`Descrição: ${servico.descricao.substring(0, 100)}${servico.descricao.length > 100 ? '...' : ''}`);
      console.log(`Duração Média de Captura: ${servico.duracao_media_captura}`);
      console.log(`Duração Média de Tratamento: ${servico.duracao_media_tratamento}`);
      console.log(`Entregáveis: ${servico.entregaveis}`);
      console.log(`Possíveis Adicionais: ${servico.possiveis_adicionais}`);
      console.log(`Valor Deslocamento: ${servico.valor_deslocamento}`);
      
      // Exibir campo detalhes
      if (servico.detalhes) {
        console.log(`Detalhes (raw): ${servico.detalhes}`);
        try {
          const detalhesObj = JSON.parse(servico.detalhes);
          console.log('Detalhes (parsed):');
          console.log(JSON.stringify(detalhesObj, null, 2));
        } catch (error) {
          console.log(`Erro ao fazer parse do campo detalhes: ${error.message}`);
        }
      } else {
        console.log('Detalhes: Não disponível');
      }
      
      console.log('-------------------\n');
    });
    
  } catch (error) {
    console.error('❌ Erro ao consultar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
listarServicos()
  .then(() => {
    console.log('✨ Listagem finalizada com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro durante a listagem:', error);
    process.exit(1);
  });
