/**
 * Script para atualização de serviços no ambiente Render
 * @description Carrega definições de serviços e atualiza no banco de dados
 * @version 1.5.0 - 2025-03-14 - Adicionado suporte explícito para o caminho do SQLite no Render
 */

// Importações
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';
import { PrismaClient } from '@prisma/client';
import { updateServices } from '../utils/databaseUpdater.js';
import axios from 'axios';

// Configuração de ambiente
dotenv.config();
const isRender = process.env.RENDER === 'true';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Caminho do banco de dados SQLite no Render
const RENDER_DB_PATH = 'file:/opt/render/project/src/database.sqlite';

// Função principal
async function main() {
  console.log('='.repeat(80));
  console.log(`[render-update-services] Iniciando atualização de serviços (v1.5.0) - ${new Date().toISOString()}`);
  console.log(`[render-update-services] Ambiente: ${isRender ? 'Render (Produção)' : 'Local (Desenvolvimento)'}`);
  console.log('='.repeat(80));

  try {
    // Determinar a URL do banco de dados a ser usada
    let databaseUrl = process.env.DATABASE_URL;
    
    // Se estiver no Render, usar o caminho específico do SQLite no Render
    if (isRender) {
      databaseUrl = RENDER_DB_PATH;
      console.log(`[render-update-services] Ambiente Render detectado, usando caminho específico do SQLite: ${databaseUrl}`);
    } else if (!databaseUrl) {
      console.error('[render-update-services] ERRO: Variável DATABASE_URL não definida em ambiente local!');
      console.error('[render-update-services] Por favor, defina a variável DATABASE_URL com a URL de conexão do banco de dados.');
      process.exit(1);
    }
    
    console.log(`[render-update-services] Usando conexão de banco de dados: ${databaseUrl}`);
    
    // Determinar caminho para o arquivo de definições de serviços
    const definitionsPath = path.join(__dirname, '../models/seeds/serviceDefinitions.js');
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
    
    // Inicializar cliente Prisma com configuração explícita
    console.log('[render-update-services] Inicializando cliente Prisma com configuração explícita');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    // Testar conexão com o banco de dados
    console.log('[render-update-services] Testando conexão com o banco de dados...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('[render-update-services] Conexão com o banco de dados estabelecida com sucesso!');
    } catch (dbError) {
      console.error(`[render-update-services] ERRO ao conectar ao banco de dados: ${dbError.message}`);
      console.error('[render-update-services] Verifique se a URL de conexão está correta e se o banco de dados está acessível.');
      process.exit(1);
    }
    
    // Verificar serviços existentes no banco de dados
    console.log('[render-update-services] Consultando serviços existentes no banco de dados...');
    const servicosExistentes = await prisma.servico.findMany();
    console.log(`[render-update-services] Encontrados ${servicosExistentes.length} serviços no banco de dados`);
    
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
