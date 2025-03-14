/**
 * Script de atualização de serviços específico para ambiente Render
 * @version 2.0.1 - 2025-03-14 - Melhorado tratamento de erros para ambiente de desenvolvimento
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Importar módulos utilitários
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';
import { clearApiCache, checkCacheStatus } from '../utils/cacheManager.js';
import { initializePrisma, updateServices } from '../utils/databaseUpdater.js';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar ambiente de desenvolvimento
if (!process.env.RENDER) {
  process.env.NODE_ENV = 'development';
  process.env.DEBUG = 'true';
}

// Configurar diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.env.RENDER ? '/opt/render/project/src' : path.resolve(__dirname, '..', '..');

// Caminho para o arquivo de definições de serviços (usando caminho absoluto no Render)
const serviceDefinitionsPath = process.env.SERVICE_DEFINITIONS_PATH || (
  process.env.RENDER 
    ? path.join(projectRoot, 'server', 'models', 'seeds', 'updatedServiceDefinitions.js')
    : path.join(__dirname, '..', 'models', 'seeds', 'updatedServiceDefinitions.js')
);

// Configurar logger
const logDir = path.join(process.env.RENDER ? projectRoot : __dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'render-update-services.log');

/**
 * Função para registrar logs com timestamp
 * @param {string} level - Nível do log (INFO, ERROR, etc)
 * @param {string} message - Mensagem do log
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // Registrar no console
  console.log(logMessage);
  
  // Registrar no arquivo
  try {
    fs.appendFileSync(logFilePath, logMessage);
  } catch (error) {
    console.error(`Erro ao escrever no arquivo de log: ${error.message}`);
  }
}

/**
 * Carrega as definições de serviços do arquivo especificado
 * @param {string} filePath Caminho do arquivo de definições
 * @param {Function} logFunction Função para registrar logs
 * @returns {Promise<Array>} Array com as definições de serviços
 */
async function loadServiceDefinitions(filePath, logFunction) {
  try {
    logFunction('INFO', `Tentando carregar definições de: ${filePath}`);
    
    // Importar definições de serviços
    const servicosModule = await import(filePath);
    const servicos = servicosModule.default || servicosModule;
    
    if (!Array.isArray(servicos)) {
      logFunction('ERROR', `Formato inválido de definições de serviços: ${typeof servicos}`);
      return [];
    }
    
    // Registrar detalhes de cada serviço para diagnóstico
    servicos.forEach((servico, index) => {
      logFunction('DEBUG', `Serviço #${index + 1}: ${servico.nome}`);
      logFunction('DEBUG', `  - Detalhes: ${typeof servico.detalhes === 'object' ? 
        JSON.stringify(servico.detalhes).substring(0, 100) + '...' : 
        (servico.detalhes || 'não definido')}`);
      logFunction('DEBUG', `  - Campos individuais: captura=${servico.duracao_media_captura || 'não definido'}, tratamento=${servico.duracao_media_tratamento || 'não definido'}`);
    });
    
    return servicos;
  } catch (error) {
    logFunction('ERROR', `Erro ao carregar definições de serviços: ${error.message}`);
    logFunction('ERROR', `Stack: ${error.stack}`);
    return [];
  }
}

/**
 * Inicializa o cliente Prisma
 * @param {Object} options Opções de inicialização
 * @returns {Object} Cliente Prisma inicializado
 */
function initializePrisma({ prismaOptions = {}, logFunction = console.log }) {
  try {
    // Importar PrismaClient
    const { PrismaClient } = require('@prisma/client');
    
    // Criar instância do cliente
    const prisma = new PrismaClient(prismaOptions);
    
    // Adicionar middleware para logging de queries
    prisma.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const end = Date.now();
      
      logFunction('DEBUG', `Prisma Query: ${params.model}.${params.action} - ${end - start}ms`);
      
      // Para operações de update, registrar os dados enviados
      if (params.action === 'update' && params.args.data) {
        logFunction('DEBUG', `Update data para ${params.model}: ${JSON.stringify(params.args.data).substring(0, 200)}...`);
        
        // Verificar especificamente o campo detalhes
        if (params.args.data.detalhes) {
          logFunction('DEBUG', `Campo detalhes: ${typeof params.args.data.detalhes} - ${params.args.data.detalhes.substring(0, 100)}...`);
        }
      }
      
      return result;
    });
    
    return prisma;
  } catch (error) {
    logFunction('ERROR', `Erro ao inicializar Prisma: ${error.message}`);
    throw error;
  }
}

/**
 * Função principal para atualizar serviços
 */
async function atualizarServicos() {
  try {
    log('INFO', '=== INICIANDO ATUALIZAÇÃO DE SERVIÇOS ===');
    log('INFO', `Ambiente: ${process.env.RENDER ? 'Render (Produção)' : 'Local (Desenvolvimento)'}`);
    log('INFO', `Diretório do projeto: ${projectRoot}`);
    log('INFO', `Caminho das definições: ${serviceDefinitionsPath}`);
    
    // Inicializar cliente Prisma
    const prisma = initializePrisma({
      prismaOptions: {
        log: ['error', 'warn'],
        errorFormat: 'pretty'
      },
      logFunction: log
    });
    
    log('INFO', 'Cliente Prisma inicializado com sucesso');
    
    // Carregar definições de serviços
    log('INFO', 'Carregando definições de serviços...');
    const servicosDefinicoes = await loadServiceDefinitions(serviceDefinitionsPath, log);
    
    if (!servicosDefinicoes || servicosDefinicoes.length === 0) {
      log('ERROR', 'Não foi possível carregar as definições de serviços');
      process.exit(1);
    }
    
    log('INFO', `${servicosDefinicoes.length} definições de serviços carregadas com sucesso`);
    
    // Verificar estrutura dos serviços antes da atualização
    log('INFO', 'Verificando estrutura dos serviços antes da atualização...');
    const servicosAtuais = await prisma.servico.findMany();
    
    log('INFO', `${servicosAtuais.length} serviços encontrados no banco de dados`);
    
    // Registrar detalhes de alguns serviços para diagnóstico
    if (servicosAtuais.length > 0) {
      const amostra = servicosAtuais.slice(0, 2); // Analisar apenas os 2 primeiros para não sobrecarregar os logs
      
      amostra.forEach(servico => {
        log('DEBUG', `Serviço atual ID ${servico.id}: ${servico.nome}`);
        log('DEBUG', `  - Detalhes: ${typeof servico.detalhes === 'string' ? 
          servico.detalhes.substring(0, 100) + '...' : 
          JSON.stringify(servico.detalhes).substring(0, 100) + '...'}`);
        log('DEBUG', `  - Campos individuais: captura=${servico.duracao_media_captura || 'não definido'}, tratamento=${servico.duracao_media_tratamento || 'não definido'}`);
        
        // Tentar fazer parse do campo detalhes se for string
        if (typeof servico.detalhes === 'string') {
          try {
            const detalhesObj = JSON.parse(servico.detalhes);
            log('DEBUG', `  - Detalhes parseados: ${JSON.stringify(detalhesObj).substring(0, 100)}...`);
          } catch (e) {
            log('WARN', `  - Erro ao fazer parse do campo detalhes: ${e.message}`);
          }
        }
      });
    }
    
    // Atualizar serviços no banco de dados
    log('INFO', 'Atualizando serviços no banco de dados...');
    const resultado = await updateServices({
      services: servicosDefinicoes,
      forceUpdate: process.env.FORCE_UPDATE === 'true',
      prismaClient: prisma,
      logFunction: log
    });
    
    // Exibir resumo da atualização
    log('INFO', `Resumo da atualização: ${resultado.created} criados, ${resultado.updated} atualizados, ${resultado.unchanged} inalterados, ${resultado.errors} erros`);
    
    // Verificar detalhes dos erros, se houver
    if (resultado.errors > 0) {
      log('WARN', 'Detalhes dos erros:');
      resultado.details
        .filter(d => d.action === 'error')
        .forEach(d => {
          log('ERROR', `  - Serviço: ${d.nome}, Erro: ${d.error}`);
        });
    }
    
    // Limpar cache da API
    log('INFO', 'Limpando cache da API...');
    const cacheCleared = await clearApiCache({
      baseUrl: process.env.BASE_URL || 'https://lytspot.onrender.com',
      cacheSecret: process.env.CACHE_SECRET,
      logFunction: log
    });
    
    if (cacheCleared) {
      log('INFO', 'Cache da API limpo com sucesso');
      
      // Verificar status do cache após limpeza
      const cacheStatus = await checkCacheStatus({
        baseUrl: process.env.BASE_URL || 'https://lytspot.onrender.com',
        cacheSecret: process.env.CACHE_SECRET,
        logFunction: log
      });
      
      if (cacheStatus) {
        log('INFO', `Status do cache após limpeza: ${JSON.stringify(cacheStatus)}`);
      }
    } else {
      log('WARN', 'Não foi possível limpar o cache da API');
    }
    
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    log('INFO', 'Conexão com o banco de dados fechada');
    
    log('INFO', '=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===');
    return true;
  } catch (error) {
    log('ERROR', `Erro durante a atualização de serviços: ${error.message}`);
    log('ERROR', error.stack || 'Sem stack trace disponível');
    
    try {
      // Tentar fechar a conexão com o banco de dados em caso de erro
      const prisma = global.prisma;
      if (prisma) {
        await prisma.$disconnect();
        log('INFO', 'Conexão com o banco de dados fechada após erro');
      }
    } catch (disconnectError) {
      log('ERROR', `Erro ao fechar conexão com o banco de dados: ${disconnectError.message}`);
    }
    
    log('ERROR', '=== ATUALIZAÇÃO FALHOU ===');
    return false;
  }
}

// Executar a função principal
atualizarServicos().then((success) => {
  if (success) {
    log('INFO', 'Script finalizado com sucesso');
    process.exit(0);
  } else {
    log('ERROR', 'Script finalizado com erros');
    process.exit(1);
  }
}).catch((error) => {
  log('ERROR', `Erro fatal: ${error.message}`);
  process.exit(1);
});
