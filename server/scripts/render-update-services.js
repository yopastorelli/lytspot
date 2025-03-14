/**
 * Script para atualização de serviços no ambiente Render
 * @description Carrega definições de serviços e atualiza no banco de dados
 * @version 1.3.0 - 2025-03-14 - Removidas funções duplicadas e adicionados logs detalhados
 */

// Importações
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';
import { initializePrisma, updateServices } from '../utils/databaseUpdater.js';
import axios from 'axios';

// Configuração de ambiente
dotenv.config();
const isRender = process.env.RENDER === 'true';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Função principal
async function main() {
  console.log('='.repeat(80));
  console.log(`[render-update-services] Iniciando atualização de serviços (v1.3.0) - ${new Date().toISOString()}`);
  console.log(`[render-update-services] Ambiente: ${isRender ? 'Render (Produção)' : 'Local (Desenvolvimento)'}`);
  console.log('='.repeat(80));

  try {
    // Determinar caminho para o arquivo de definições de serviços
    const definitionsPath = isRender
      ? path.join(__dirname, '../data/serviceDefinitions.js')
      : path.join(__dirname, '../data/serviceDefinitions.js');
    
    console.log(`[render-update-services] Carregando definições de serviços de: ${definitionsPath}`);
    
    // Carregar definições de serviços
    const serviceDefinitions = await loadServiceDefinitions(definitionsPath, console.log);
    
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || serviceDefinitions.length === 0) {
      console.error('[render-update-services] Erro: Nenhuma definição de serviço encontrada ou formato inválido');
      process.exit(1);
    }
    
    console.log(`[render-update-services] Carregadas ${serviceDefinitions.length} definições de serviços`);
    
    // Log detalhado de cada serviço para diagnóstico
    serviceDefinitions.forEach((service, index) => {
      console.log(`[render-update-services] Serviço #${index + 1}: ${service.nome}`);
      console.log(`[render-update-services] - Tipo do campo detalhes: ${typeof service.detalhes}`);
      
      if (typeof service.detalhes === 'object') {
        console.log(`[render-update-services] - Propriedades do objeto detalhes: ${Object.keys(service.detalhes).join(', ')}`);
        console.log(`[render-update-services] - Valor de detalhes.captura: ${service.detalhes.captura || 'não definido'}`);
        console.log(`[render-update-services] - Valor de detalhes.tratamento: ${service.detalhes.tratamento || 'não definido'}`);
      } else if (typeof service.detalhes === 'string') {
        console.log(`[render-update-services] - Conteúdo do campo detalhes (string): "${service.detalhes.substring(0, 100)}..."`);
        
        try {
          const parsedDetails = JSON.parse(service.detalhes);
          console.log(`[render-update-services] - Parse bem-sucedido, propriedades: ${Object.keys(parsedDetails).join(', ')}`);
        } catch (e) {
          console.log(`[render-update-services] - Erro ao fazer parse do campo detalhes: ${e.message}`);
        }
      }
      
      console.log(`[render-update-services] - Campo duracao_media_captura: ${service.duracao_media_captura || 'não definido'}`);
      console.log(`[render-update-services] - Campo duracao_media_tratamento: ${service.duracao_media_tratamento || 'não definido'}`);
      console.log('-'.repeat(40));
    });
    
    // Inicializar cliente Prisma
    console.log('[render-update-services] Inicializando cliente Prisma');
    const prisma = initializePrisma({
      logFunction: console.log,
      prismaOptions: {
        log: ['query', 'info', 'warn', 'error']
      }
    });
    
    // Atualizar serviços no banco de dados
    console.log('[render-update-services] Iniciando atualização de serviços no banco de dados');
    const updateResult = await updateServices({
      services: serviceDefinitions,
      forceUpdate: true,
      prismaClient: prisma,
      logFunction: console.log
    });
    
    console.log('='.repeat(80));
    console.log('[render-update-services] Resultado da atualização:');
    console.log(`- Total de serviços: ${serviceDefinitions.length}`);
    console.log(`- Atualizados: ${updateResult.updated}`);
    console.log(`- Criados: ${updateResult.created}`);
    console.log(`- Sem alterações: ${updateResult.unchanged}`);
    console.log(`- Erros: ${updateResult.errors}`);
    console.log('='.repeat(80));
    
    // Limpar cache da API, se estiver em produção
    if (isRender && process.env.API_CACHE_PURGE_URL) {
      try {
        console.log('[render-update-services] Limpando cache da API');
        const purgeResponse = await axios.post(process.env.API_CACHE_PURGE_URL, {
          paths: ['/api/pricing', '/api/services']
        });
        console.log(`[render-update-services] Cache limpo com sucesso: ${purgeResponse.status} ${purgeResponse.statusText}`);
      } catch (cacheError) {
        console.error(`[render-update-services] Erro ao limpar cache da API: ${cacheError.message}`);
      }
    }
    
    console.log('[render-update-services] Processo concluído com sucesso');
  } catch (error) {
    console.error(`[render-update-services] Erro durante a execução: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Garantir que o processo termine
    process.exit(0);
  }
}

// Executar função principal
main();
