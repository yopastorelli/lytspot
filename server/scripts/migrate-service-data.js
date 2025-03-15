/**
 * Migrador de Dados de Serviços para Lytspot
 * @description Script para migrar dados existentes para o novo formato unificado
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Configuração de ambiente
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

/**
 * Migra os dados de serviços no banco de dados para o novo formato
 * @returns {Promise<Object>} Estatísticas da migração
 */
async function migrateServiceData() {
  console.log('[migrate-service-data] Iniciando migração de dados de serviços...');
  
  const stats = {
    total: 0,
    atualizados: 0,
    erros: 0,
    ignorados: 0
  };
  
  try {
    // Buscar todos os serviços no banco de dados
    const servicos = await prisma.servico.findMany();
    stats.total = servicos.length;
    
    console.log(`[migrate-service-data] Encontrados ${servicos.length} serviços no banco de dados`);
    
    // Processar cada serviço
    for (const servico of servicos) {
      try {
        console.log(`[migrate-service-data] Processando serviço: ${servico.id} - ${servico.nome}`);
        
        // Verificar se já tem o campo detalhes corretamente formatado
        let detalhesObj = null;
        let precisaAtualizar = false;
        
        if (servico.detalhes) {
          try {
            // Tentar fazer parse do campo detalhes
            detalhesObj = JSON.parse(servico.detalhes);
            
            // Verificar se o objeto detalhes tem todos os campos necessários
            const camposNecessarios = ['captura', 'tratamento', 'entregaveis', 'adicionais', 'deslocamento'];
            const camposFaltantes = camposNecessarios.filter(campo => !detalhesObj[campo]);
            
            if (camposFaltantes.length > 0) {
              console.log(`[migrate-service-data] Serviço ${servico.id} tem detalhes incompletos. Campos faltantes: ${camposFaltantes.join(', ')}`);
              precisaAtualizar = true;
            } else {
              console.log(`[migrate-service-data] Serviço ${servico.id} já tem detalhes completos`);
              stats.ignorados++;
              continue; // Pular para o próximo serviço
            }
          } catch (error) {
            console.error(`[migrate-service-data] Erro ao fazer parse do campo detalhes do serviço ${servico.id}:`, error.message);
            precisaAtualizar = true;
          }
        } else {
          console.log(`[migrate-service-data] Serviço ${servico.id} não tem campo detalhes`);
          precisaAtualizar = true;
        }
        
        if (precisaAtualizar) {
          // Criar objeto detalhes completo
          const detalhesCompletos = {
            captura: servico.duracao_media_captura || detalhesObj?.captura || 'Sob consulta',
            tratamento: servico.duracao_media_tratamento || detalhesObj?.tratamento || 'Sob consulta',
            entregaveis: servico.entregaveis || detalhesObj?.entregaveis || '',
            adicionais: servico.possiveis_adicionais || detalhesObj?.adicionais || '',
            deslocamento: servico.valor_deslocamento || detalhesObj?.deslocamento || 'Sob consulta'
          };
          
          // Atualizar serviço no banco de dados
          await prisma.servico.update({
            where: { id: servico.id },
            data: {
              detalhes: JSON.stringify(detalhesCompletos)
            }
          });
          
          console.log(`[migrate-service-data] Serviço ${servico.id} atualizado com sucesso`);
          stats.atualizados++;
        }
      } catch (error) {
        console.error(`[migrate-service-data] Erro ao processar serviço ${servico.id}:`, error);
        stats.erros++;
      }
    }
    
    console.log(`[migrate-service-data] Migração concluída: ${stats.total} total, ${stats.atualizados} atualizados, ${stats.ignorados} ignorados, ${stats.erros} erros`);
    return stats;
  } catch (error) {
    console.error('[migrate-service-data] Erro durante a migração:', error);
    return stats;
  }
}

/**
 * Atualiza o arquivo de definições de serviços para o novo formato
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function updateServiceDefinitionsFile() {
  const serviceDefinitionsPath = path.join(rootDir, 'server', 'models', 'seeds', 'serviceDefinitions.js');
  
  console.log(`[migrate-service-data] Atualizando arquivo de definições de serviços: ${serviceDefinitionsPath}`);
  
  try {
    // Verificar se o arquivo existe
    try {
      await fs.access(serviceDefinitionsPath);
    } catch (error) {
      console.error(`[migrate-service-data] Arquivo de definições não encontrado: ${serviceDefinitionsPath}`);
      return false;
    }
    
    // Fazer backup do arquivo original
    const backupPath = `${serviceDefinitionsPath}.bak`;
    await fs.copyFile(serviceDefinitionsPath, backupPath);
    console.log(`[migrate-service-data] Backup criado em: ${backupPath}`);
    
    // Ler o conteúdo do arquivo
    const fileContent = await fs.readFile(serviceDefinitionsPath, 'utf8');
    
    // Extrair o array de definições usando regex
    const match = fileContent.match(/export const serviceDefinitions = (\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
      console.error('[migrate-service-data] Não foi possível extrair as definições de serviços do arquivo');
      return false;
    }
    
    // Avaliar o array extraído
    const definitionsArray = eval(match[1]);
    console.log(`[migrate-service-data] Carregadas ${definitionsArray.length} definições de serviços`);
    
    // Atualizar cada definição para o novo formato
    const updatedDefinitions = definitionsArray.map(service => {
      // Garantir que os detalhes estejam no formato correto
      const detalhes = {
        captura: service.duracao_media_captura || service.detalhes?.captura || 'Sob consulta',
        tratamento: service.duracao_media_tratamento || service.detalhes?.tratamento || 'Sob consulta',
        entregaveis: service.entregaveis || service.detalhes?.entregaveis || '',
        adicionais: service.possiveis_adicionais || service.detalhes?.adicionais || '',
        deslocamento: service.valor_deslocamento || service.detalhes?.deslocamento || 'Sob consulta'
      };
      
      // Criar objeto atualizado
      return {
        ...service,
        detalhes: detalhes
      };
    });
    
    // Substituir a seção de definições
    const newContent = fileContent.replace(
      /export const serviceDefinitions = \[[\s\S]*?\];/,
      `export const serviceDefinitions = ${JSON.stringify(updatedDefinitions, null, 2)};`
    );
    
    // Escrever o novo conteúdo
    await fs.writeFile(serviceDefinitionsPath, newContent, 'utf8');
    console.log(`[migrate-service-data] Arquivo de definições de serviços atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    console.error('[migrate-service-data] Erro ao atualizar arquivo de definições de serviços:', error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(50));
  console.log('MIGRADOR DE DADOS DE SERVIÇOS LYTSPOT - v1.0.0');
  console.log('Data: ' + new Date().toISOString());
  console.log('='.repeat(50));
  
  try {
    // Migrar dados no banco de dados
    console.log('\n1. Migrando dados no banco de dados...');
    const dbStats = await migrateServiceData();
    
    // Atualizar arquivo de definições
    console.log('\n2. Atualizando arquivo de definições de serviços...');
    const fileSuccess = await updateServiceDefinitionsFile();
    
    // Exibir resumo
    console.log('\n=== RESUMO DA MIGRAÇÃO ===');
    console.log('Banco de dados:');
    console.log(`- Total de serviços: ${dbStats.total}`);
    console.log(`- Serviços atualizados: ${dbStats.atualizados}`);
    console.log(`- Serviços ignorados: ${dbStats.ignorados}`);
    console.log(`- Erros: ${dbStats.erros}`);
    
    console.log('\nArquivo de definições:');
    console.log(`- Atualizado: ${fileSuccess ? 'Sim' : 'Não'}`);
    
    console.log('\nMigração concluída!');
    
    // Sugerir próximos passos
    console.log('\n=== PRÓXIMOS PASSOS ===');
    console.log('1. Execute o script update-services-all.js para sincronizar os dados em todos os ambientes:');
    console.log('   node server/scripts/update-services-all.js');
    console.log('2. Verifique se os serviços estão sendo exibidos corretamente no simulador de preços.');
    console.log('3. Use o editor de serviços para fazer ajustes, se necessário:');
    console.log('   node server/scripts/service-editor.js');
  } catch (error) {
    console.error('Erro fatal durante a migração:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Verificar se o script está sendo executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
}
