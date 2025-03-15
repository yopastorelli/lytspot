/**
 * Script unificado para sincronização de serviços entre ambientes
 * @description Atualiza serviços no banco de dados e nos arquivos estáticos do frontend
 * @version 1.3.0 - 2025-03-16 - Melhorada detecção de caminhos e carregamento de definições
 */

// Importações
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';
import { PrismaClient } from '@prisma/client';
import { prepareServiceDataForDatabase, prepareServiceDataForFrontend } from '../utils/serviceDataUtils.js';
import axios from 'axios';

// Configuração de ambiente
dotenv.config();
const isRender = process.env.RENDER === 'true';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

// Caminhos do banco de dados SQLite
const LOCAL_DB_PATH = 'file:./server/database.sqlite';
const RENDER_DB_PATH = process.env.DATABASE_URL || 'file:/opt/render/project/src/database.sqlite';

// Caminho para o arquivo de serviços do simulador
const simulatorServicesPath = path.join(rootDir, 'src', 'data', 'servicos.js');

/**
 * Atualiza os serviços no banco de dados
 * @param {Array} serviceDefinitions - Definições de serviços
 * @param {PrismaClient} prisma - Cliente Prisma
 * @returns {Object} Estatísticas de atualização
 */
async function updateDatabaseServices(serviceDefinitions, prisma) {
  console.log('[sync-services] Iniciando atualização de serviços no banco de dados');
  
  // Verificar serviços existentes no banco de dados
  console.log('[sync-services] Consultando serviços existentes no banco de dados...');
  const servicosExistentes = await prisma.servico.findMany();
  console.log(`[sync-services] Encontrados ${servicosExistentes.length} serviços no banco de dados`);
  
  // Criar um mapa de serviços existentes por nome para facilitar a busca
  const servicosPorNome = {};
  servicosExistentes.forEach(servico => {
    servicosPorNome[servico.nome] = servico;
  });
  
  let stats = {
    atualizados: 0,
    criados: 0,
    erros: 0
  };
  
  for (const serviceDefinition of serviceDefinitions) {
    try {
      // Verificar se já existe um serviço com este nome
      const servicoExistente = servicosPorNome[serviceDefinition.nome];
      
      // Usar a função utilitária para preparar os dados de forma consistente
      const dadosServico = prepareServiceDataForDatabase(serviceDefinition);
      
      // Se o serviço já existe, atualizar
      if (servicoExistente) {
        console.log(`[sync-services] Atualizando serviço existente: ${serviceDefinition.nome} (ID: ${servicoExistente.id})`);
        await prisma.servico.update({
          where: { id: servicoExistente.id },
          data: dadosServico
        });
        stats.atualizados++;
      } 
      // Se não existe, criar novo
      else {
        console.log(`[sync-services] Criando novo serviço: ${serviceDefinition.nome}`);
        const novoServico = await prisma.servico.create({
          data: dadosServico
        });
        console.log(`[sync-services] Novo serviço criado com ID: ${novoServico.id}`);
        stats.criados++;
      }
    } catch (error) {
      console.error(`[sync-services] Erro ao processar serviço ${serviceDefinition.nome}:`, error.message);
      stats.erros++;
    }
  }
  
  return stats;
}

/**
 * Atualiza o arquivo de serviços estáticos para o frontend
 * @returns {boolean} Sucesso da operação
 */
async function updateStaticServicesFile(serviceDefinitions) {
  try {
    console.log('[sync-services] Atualizando arquivo de serviços estáticos para o frontend...');
    
    // Verificar se o arquivo existe
    try {
      await fs.access(simulatorServicesPath);
      console.log(`[sync-services] Arquivo encontrado: ${simulatorServicesPath}`);
    } catch (error) {
      console.error(`[sync-services] Arquivo não encontrado: ${simulatorServicesPath}`);
      console.log(`[sync-services] Criando novo arquivo...`);
    }
    
    // Fazer backup do arquivo original se existir
    try {
      const backupPath = `${simulatorServicesPath}.bak`;
      await fs.copyFile(simulatorServicesPath, backupPath);
      console.log(`[sync-services] Backup criado em: ${backupPath}`);
    } catch (error) {
      console.log(`[sync-services] Não foi possível criar backup: arquivo original não existe`);
    }
    
    // Transformar as definições para o formato do frontend usando a função utilitária
    const servicosFormatados = serviceDefinitions.map((servico, index) => {
      // Usar a função utilitária para preparar os dados de forma consistente
      const servicoFormatado = prepareServiceDataForFrontend(servico);
      
      // Garantir que o ID seja um número sequencial se não existir
      if (!servicoFormatado.id) {
        servicoFormatado.id = index + 1;
      }
      
      return servicoFormatado;
    });
    
    // Gerar e escrever o novo conteúdo
    const dataAtual = new Date().toISOString().split('T')[0];
    
    const novoConteudo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 2.2
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script sync-services.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(servicosFormatados, null, 2)};
`;
    
    await fs.writeFile(simulatorServicesPath, novoConteudo, 'utf8');
    console.log(`[sync-services] Arquivo de serviços estáticos atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    console.error('[sync-services] Erro ao atualizar arquivo de serviços estáticos:', error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(80));
  console.log(`[sync-services] Iniciando sincronização de serviços (v1.3.0) - ${new Date().toISOString()}`);
  console.log(`[sync-services] Ambiente: ${isRender ? 'Render (Produção)' : 'Local (Desenvolvimento)'}`);
  console.log('='.repeat(80));

  try {
    // Determinar a URL do banco de dados a ser usada
    let databaseUrl = process.env.DATABASE_URL;
    
    // Se estiver no Render, usar o caminho específico do SQLite no Render
    if (isRender) {
      if (!databaseUrl) {
        databaseUrl = RENDER_DB_PATH;
        console.log(`[sync-services] Ambiente Render detectado, usando caminho padrão do SQLite: ${databaseUrl}`);
      } else {
        console.log(`[sync-services] Ambiente Render detectado, usando DATABASE_URL: ${databaseUrl}`);
      }
    } else if (!databaseUrl) {
      databaseUrl = LOCAL_DB_PATH;
      console.log(`[sync-services] Ambiente local detectado, usando caminho padrão do SQLite: ${databaseUrl}`);
    }
    
    console.log(`[sync-services] Usando conexão de banco de dados: ${databaseUrl}`);
    
    // Determinar caminho para o arquivo de definições de serviços
    // Tenta múltiplos caminhos possíveis para maior robustez
    const possiblePaths = [
      path.join(__dirname, '../models/seeds/serviceDefinitions.js'),
      path.join(rootDir, 'server/models/seeds/serviceDefinitions.js'),
      isRender ? '/opt/render/project/src/server/models/seeds/serviceDefinitions.js' : null,
      isRender ? path.join(rootDir, '/opt/render/project/src/server/models/seeds/serviceDefinitions.js') : null
    ].filter(Boolean); // Remove valores null
    
    console.log(`[sync-services] Tentando carregar definições de serviços...`);
    console.log(`[sync-services] Diretório atual: ${__dirname}`);
    console.log(`[sync-services] Diretório raiz: ${rootDir}`);
    
    // Verificar quais caminhos existem
    let existingPaths = [];
    for (const p of possiblePaths) {
      try {
        await fs.access(p);
        existingPaths.push(p);
        console.log(`[sync-services] ✅ Caminho encontrado: ${p}`);
      } catch (e) {
        console.log(`[sync-services] ❌ Caminho não encontrado: ${p}`);
      }
    }
    
    if (existingPaths.length === 0) {
      console.error('[sync-services] ERRO CRÍTICO: Nenhum caminho válido encontrado para serviceDefinitions.js');
      throw new Error('Nenhum caminho válido encontrado para serviceDefinitions.js');
    }
    
    // Usar o primeiro caminho válido encontrado
    const definitionsPath = existingPaths[0];
    console.log(`[sync-services] Usando caminho: ${definitionsPath}`);
    
    // Tentar carregar as definições de serviços
    console.log(`[sync-services] Carregando definições de serviços de: ${definitionsPath}`);
    
    // Tentar importar diretamente o módulo para obter as definições
    let serviceDefinitions = [];
    let loadMethod = '';
    
    try {
      // Importar o módulo diretamente
      const importPath = `file://${definitionsPath}`;
      console.log(`[sync-services] Tentando importar diretamente de: ${importPath}`);
      
      const serviceDefinitionsModule = await import(importPath);
      console.log(`[sync-services] Módulo importado com sucesso`);
      console.log(`[sync-services] Chaves disponíveis: ${Object.keys(serviceDefinitionsModule).join(', ')}`);
      
      if (serviceDefinitionsModule.serviceDefinitions) {
        serviceDefinitions = serviceDefinitionsModule.serviceDefinitions;
        loadMethod = 'via serviceDefinitions';
      } else if (serviceDefinitionsModule.default) {
        serviceDefinitions = serviceDefinitionsModule.default;
        loadMethod = 'via export default';
      } else if (serviceDefinitionsModule.getServiceDefinitionsForFrontend) {
        serviceDefinitions = serviceDefinitionsModule.getServiceDefinitionsForFrontend();
        loadMethod = 'via getServiceDefinitionsForFrontend()';
      }
    } catch (importError) {
      console.error(`[sync-services] Erro ao importar módulo: ${importError.message}`);
      console.log(`[sync-services] Tentando método alternativo via loadServiceDefinitions...`);
      
      try {
        // Se falhar, usar o método loadServiceDefinitions
        serviceDefinitions = await loadServiceDefinitions(definitionsPath, console.log);
        loadMethod = 'via loadServiceDefinitions';
      } catch (loaderError) {
        console.error(`[sync-services] Erro ao carregar definições: ${loaderError.message}`);
        throw new Error(`Falha ao carregar definições de serviços: ${loaderError.message}`);
      }
    }
    
    // Verificar se as definições foram carregadas corretamente
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions)) {
      throw new Error('[sync-services] Erro: Definições de serviço não são um array válido');
    }
    
    if (serviceDefinitions.length === 0) {
      throw new Error('[sync-services] Erro: Nenhuma definição de serviço encontrada');
    }
    
    console.log(`[sync-services] ✅ Carregadas ${serviceDefinitions.length} definições de serviços ${loadMethod}`);
    console.log(`[sync-services] Primeiro serviço: ${serviceDefinitions[0].nome}`);
    console.log(`[sync-services] Último serviço: ${serviceDefinitions[serviceDefinitions.length - 1].nome}`);
    
    // Verificar se os dados têm a estrutura esperada
    const validationErrors = [];
    serviceDefinitions.forEach((service, index) => {
      if (!service.nome) validationErrors.push(`Serviço #${index + 1} não tem nome`);
      if (!service.preco_base) validationErrors.push(`Serviço "${service.nome || index + 1}" não tem preço base`);
    });
    
    if (validationErrors.length > 0) {
      console.error('[sync-services] Erros de validação nas definições de serviços:');
      validationErrors.forEach(err => console.error(`- ${err}`));
      throw new Error('Definições de serviços inválidas');
    }
    
    // Inicializar cliente Prisma com configuração explícita
    console.log('[sync-services] Inicializando cliente Prisma com configuração explícita');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
    
    try {
      // Atualizar serviços no banco de dados
      console.log('[sync-services] Atualizando serviços no banco de dados...');
      const dbStats = await updateDatabaseServices(serviceDefinitions, prisma);
      console.log(`[sync-services] Estatísticas de atualização do banco de dados: ${JSON.stringify(dbStats)}`);
      
      if (dbStats.erros > 0) {
        console.warn(`[sync-services] Atenção: ${dbStats.erros} erros ocorreram durante a atualização do banco de dados`);
      }
      
      // Atualizar arquivo de serviços estáticos
      console.log('[sync-services] Atualizando arquivo de serviços estáticos...');
      const staticSuccess = await updateStaticServicesFile(serviceDefinitions);
      
      if (!staticSuccess) {
        throw new Error('[sync-services] Falha ao atualizar arquivo de serviços estáticos');
      }
      
      console.log('[sync-services] ✅ Sincronização concluída com sucesso!');
    } finally {
      // Sempre desconectar o cliente Prisma ao final
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error(`[sync-services] ERRO FATAL: ${error.message}`);
    console.error(error.stack);
    process.exit(1); // Sair com código de erro
  }
}

// Executar função principal
main();
