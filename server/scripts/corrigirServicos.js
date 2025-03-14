/**
 * Script para corrigir a estrutura dos serviços no banco de dados
 * @version 1.0.0 - 2025-03-14
 * @description Recria todos os serviços com a estrutura correta
 */

import { PrismaClient } from '@prisma/client';
import { updatedServiceDefinitions } from '../models/seeds/updatedServiceDefinitions.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função para sanitizar os dados do serviço antes de salvar no banco
 * @param {Object} serviceData Dados do serviço
 * @returns {Object} Dados do serviço sanitizados
 */
function sanitizeServiceData(serviceData) {
  // Criar objeto detalhes estruturado
  const detalhes = {
    captura: serviceData.duracao_media_captura || '',
    tratamento: serviceData.duracao_media_tratamento || '',
    entregaveis: serviceData.entregaveis || '',
    adicionais: serviceData.possiveis_adicionais || '',
    deslocamento: serviceData.valor_deslocamento || ''
  };

  // Garantir que o campo detalhes seja uma string JSON válida
  return {
    ...serviceData,
    detalhes: JSON.stringify(detalhes)
  };
}

/**
 * Função para recriar todos os serviços no banco de dados
 */
async function recriarServicos() {
  try {
    console.log('🔄 Iniciando recriação de serviços...');
    
    // Excluir todos os serviços existentes
    console.log('🗑️ Excluindo serviços existentes...');
    await prisma.servico.deleteMany({});
    console.log('✅ Todos os serviços foram excluídos com sucesso');
    
    // Criar novos serviços a partir das definições atualizadas
    console.log('📝 Criando novos serviços a partir das definições atualizadas...');
    
    const servicosCriados = [];
    
    for (const servicoDefinicao of updatedServiceDefinitions) {
      try {
        // Remover ID para que o banco gere um novo
        const { id, ...servicoData } = servicoDefinicao;
        
        // Sanitizar dados do serviço
        const dadosSanitizados = sanitizeServiceData(servicoData);
        
        // Criar serviço no banco
        const novoServico = await prisma.servico.create({
          data: dadosSanitizados
        });
        
        console.log(`✅ Serviço "${novoServico.nome}" criado com sucesso (ID: ${novoServico.id})`);
        servicosCriados.push(novoServico);
      } catch (error) {
        console.error(`❌ Erro ao criar serviço "${servicoDefinicao.nome}":`, error.message);
      }
    }
    
    console.log(`\n✅ Total de serviços criados: ${servicosCriados.length}`);
    
    // Verificar se todos os serviços foram criados
    if (servicosCriados.length === updatedServiceDefinitions.length) {
      console.log('🎉 Todos os serviços foram criados com sucesso!');
    } else {
      console.warn(`⚠️ Atenção: Apenas ${servicosCriados.length} de ${updatedServiceDefinitions.length} serviços foram criados.`);
    }
    
    // Mostrar exemplo do primeiro serviço criado
    if (servicosCriados.length > 0) {
      console.log('\nExemplo de serviço criado:');
      const exemploServico = { ...servicosCriados[0] };
      
      // Tentar fazer parse do campo detalhes para exibição
      try {
        if (typeof exemploServico.detalhes === 'string') {
          exemploServico.detalhes = JSON.parse(exemploServico.detalhes);
        }
      } catch (error) {
        console.error('Erro ao fazer parse do campo detalhes para exibição:', error.message);
      }
      
      console.log(JSON.stringify(exemploServico, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao recriar serviços:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função
recriarServicos()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
