/**
 * Script para corrigir o campo detalhes nos serviços existentes
 * @description Atualiza todos os serviços no banco de dados para garantir que o campo detalhes esteja corretamente preenchido
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

/**
 * Função principal para corrigir os serviços
 */
async function fixServiceDetails() {
  console.log('Iniciando correção do campo detalhes nos serviços...');
  
  try {
    // Buscar todos os serviços no banco de dados
    const servicos = await prisma.servico.findMany();
    console.log(`Encontrados ${servicos.length} serviços para processar.`);
    
    // Contador de serviços atualizados
    let atualizados = 0;
    
    // Processar cada serviço
    for (const servico of servicos) {
      console.log(`\nProcessando serviço ID ${servico.id}: ${servico.nome}`);
      
      // Verificar se o campo detalhes está vazio ou inválido
      let detalhesObj = null;
      let precisaAtualizar = false;
      
      // Tentar fazer parse do campo detalhes se existir
      if (servico.detalhes) {
        try {
          detalhesObj = JSON.parse(servico.detalhes);
          console.log(`Campo detalhes existente: ${JSON.stringify(detalhesObj)}`);
          
          // Verificar se os campos necessários existem
          if (!detalhesObj.captura || !detalhesObj.tratamento) {
            console.log('Campo detalhes existe, mas está incompleto. Será atualizado.');
            precisaAtualizar = true;
          }
        } catch (error) {
          console.error(`Erro ao fazer parse do campo detalhes: ${error.message}`);
          console.log('Campo detalhes inválido. Será reconstruído.');
          precisaAtualizar = true;
        }
      } else {
        console.log('Campo detalhes não existe ou é nulo. Será criado.');
        precisaAtualizar = true;
      }
      
      // Se o campo detalhes precisa ser atualizado
      if (precisaAtualizar) {
        // Preparar os dados do serviço para o banco de dados
        const dadosAtualizados = prepareServiceDataForDatabase(servico);
        
        // Atualizar o serviço no banco de dados
        await prisma.servico.update({
          where: { id: servico.id },
          data: {
            detalhes: dadosAtualizados.detalhes
          }
        });
        
        console.log(`Serviço ID ${servico.id} atualizado com sucesso.`);
        console.log(`Novo campo detalhes: ${dadosAtualizados.detalhes}`);
        atualizados++;
      } else {
        console.log(`Serviço ID ${servico.id} já possui o campo detalhes correto. Nenhuma ação necessária.`);
      }
    }
    
    console.log(`\nProcessamento concluído. ${atualizados} serviços foram atualizados.`);
  } catch (error) {
    console.error('Erro ao processar os serviços:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar a função principal
fixServiceDetails()
  .then(() => {
    console.log('Script concluído com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
  });
