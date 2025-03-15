/**
 * Script de Seed para Serviços Lytspot
 * @description Atualiza serviços diretamente no banco de dados durante o processo de build/deploy
 * @version 1.0.0 - 2025-03-15
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Configuração de ambiente
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

// Caminho para o arquivo de definições de serviços
const serviceDefinitionsPath = path.join(rootDir, 'server', 'models', 'seeds', 'serviceDefinitions.js');

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

/**
 * Carrega as definições de serviços do arquivo
 * @returns {Promise<Array>} Array de definições de serviços
 */
async function loadServiceDefinitions() {
  try {
    console.log(`[seed-services] Carregando definições de serviços de: ${serviceDefinitionsPath}`);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(serviceDefinitionsPath);
    } catch (error) {
      console.error(`[seed-services] Arquivo de definições não encontrado: ${serviceDefinitionsPath}`);
      return [];
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = await fs.readFile(serviceDefinitionsPath, 'utf8');
    
    // Extrair o array de definições usando regex
    const match = fileContent.match(/export const serviceDefinitions = (\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
      console.error('[seed-services] Não foi possível extrair as definições de serviços do arquivo');
      return [];
    }
    
    // Avaliar o array extraído como JavaScript
    try {
      // Usar eval com cuidado e apenas para dados confiáveis
      const definitionsArray = eval(match[1]);
      console.log(`[seed-services] ${definitionsArray.length} definições de serviços carregadas`);
      return definitionsArray;
    } catch (evalError) {
      console.error('[seed-services] Erro ao avaliar as definições de serviços:', evalError);
      return [];
    }
  } catch (error) {
    console.error('[seed-services] Erro ao carregar definições de serviços:', error);
    return [];
  }
}

/**
 * Prepara um serviço para armazenamento no banco de dados
 * @param {Object} service Definição do serviço
 * @returns {Object} Serviço formatado para o banco de dados
 */
function prepareServiceForDatabase(service) {
  // Extrair detalhes do serviço
  const detalhes = service.detalhes || {};
  
  // Garantir que campos de duração sejam sempre strings
  const duracao_media_captura = typeof detalhes.captura === 'number' 
    ? String(detalhes.captura) + ' horas' 
    : String(detalhes.captura);
  
  const duracao_media_tratamento = typeof detalhes.tratamento === 'number'
    ? String(detalhes.tratamento) + ' dias'
    : String(detalhes.tratamento);
  
  // Converter adicionais para string (JSON) se for um array
  const possiveis_adicionais = Array.isArray(detalhes.adicionais) 
    ? JSON.stringify(detalhes.adicionais) 
    : (detalhes.adicionais || null);
  
  // Converter valor de deslocamento para string
  const valor_deslocamento = detalhes.deslocamento ? String(detalhes.deslocamento) : null;
  
  // Armazenar detalhes completos como JSON string
  const detalhesJson = JSON.stringify(detalhes);
  
  // Retornar objeto formatado para o banco de dados
  return {
    nome: String(service.nome),
    descricao: String(service.descricao),
    preco_base: parseFloat(service.preco_base),
    duracao_media_captura: duracao_media_captura,
    duracao_media_tratamento: duracao_media_tratamento,
    entregaveis: String(detalhes.entregaveis || ''),
    possiveis_adicionais: possiveis_adicionais,
    valor_deslocamento: valor_deslocamento,
    detalhes: detalhesJson
  };
}

/**
 * Atualiza os serviços no banco de dados usando Prisma
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<Object>} Estatísticas de atualização
 */
async function seedDatabaseServices(services) {
  console.log('[seed-services] Atualizando serviços no banco de dados...');
  
  let stats = {
    atualizados: 0,
    criados: 0,
    erros: 0
  };
  
  try {
    // Obter todos os serviços existentes
    const existingServices = await prisma.servico.findMany();
    console.log(`[seed-services] Encontrados ${existingServices.length} serviços no banco de dados`);
    
    // Mapear serviços existentes por nome para facilitar a busca
    const servicesByName = {};
    existingServices.forEach(service => {
      servicesByName[service.nome] = service;
    });
    
    // Para cada serviço nas definições, criar ou atualizar no banco
    for (const service of services) {
      try {
        const serviceData = prepareServiceForDatabase(service);
        const existingService = servicesByName[service.nome];
        
        if (existingService) {
          // Atualizar serviço existente
          console.log(`[seed-services] Atualizando serviço: ${service.nome}`);
          await prisma.servico.update({
            where: { id: existingService.id },
            data: serviceData
          });
          stats.atualizados++;
        } else {
          // Criar novo serviço
          console.log(`[seed-services] Criando serviço: ${service.nome}`);
          await prisma.servico.create({
            data: serviceData
          });
          stats.criados++;
        }
      } catch (serviceError) {
        console.error(`[seed-services] Erro ao processar serviço ${service.nome}:`, serviceError);
        stats.erros++;
      }
    }
    
    console.log(`[seed-services] Atualização concluída: ${stats.atualizados} atualizados, ${stats.criados} criados, ${stats.erros} erros`);
    return stats;
  } catch (error) {
    console.error('[seed-services] Erro ao atualizar serviços no banco de dados:', error);
    return { atualizados: 0, criados: 0, erros: services.length };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('==================================================');
  console.log('SEED DE SERVIÇOS LYTSPOT - v1.0.0');
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('==================================================');
  console.log('');
  
  try {
    // 1. Carregar definições de serviços
    console.log('1. Carregando definições de serviços...');
    const serviceDefinitions = await loadServiceDefinitions();
    
    if (serviceDefinitions.length === 0) {
      console.error('Nenhuma definição de serviço encontrada. Abortando.');
      process.exit(1);
    }
    
    // 2. Atualizar banco de dados
    console.log('2. Atualizando banco de dados...');
    const dbStats = await seedDatabaseServices(serviceDefinitions);
    
    // Resumo da atualização
    console.log('');
    console.log('=== RESUMO DA ATUALIZAÇÃO ===');
    console.log('Banco de dados:');
    console.log(`- Serviços atualizados: ${dbStats.atualizados}`);
    console.log(`- Serviços criados: ${dbStats.criados}`);
    console.log(`- Erros: ${dbStats.erros}`);
    console.log('');
    console.log('Seed concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro durante o processo de seed:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Executar função principal
main()
  .catch(e => {
    console.error('Erro fatal durante o seed:', e);
    process.exit(1);
  });
