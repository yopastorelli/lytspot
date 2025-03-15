/**
 * Script unificado para sincronização de serviços entre ambientes
 * @description Atualiza serviços no banco de dados e nos arquivos estáticos do frontend
 * @version 1.1.0 - 2025-03-15 - Refatorado para usar serviceDataUtils
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

// Caminho do banco de dados SQLite no Render
const RENDER_DB_PATH = 'file:/opt/render/project/src/database.sqlite';

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
async function updateStaticServicesFile() {
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
    
    // Carregar definições de serviços
    const serviceDefinitions = await loadServiceDefinitions();
    
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
  console.log(`[sync-services] Iniciando sincronização de serviços (v1.1.0) - ${new Date().toISOString()}`);
  console.log(`[sync-services] Ambiente: ${isRender ? 'Render (Produção)' : 'Local (Desenvolvimento)'}`);
  console.log('='.repeat(80));

  try {
    // Determinar a URL do banco de dados a ser usada
    let databaseUrl = process.env.DATABASE_URL;
    
    // Se estiver no Render, usar o caminho específico do SQLite no Render
    if (isRender) {
      databaseUrl = RENDER_DB_PATH;
      console.log(`[sync-services] Ambiente Render detectado, usando caminho específico do SQLite: ${databaseUrl}`);
    } else if (!databaseUrl) {
      console.error('[sync-services] ERRO: Variável DATABASE_URL não definida em ambiente local!');
      console.error('[sync-services] Por favor, defina a variável DATABASE_URL com a URL de conexão do banco de dados.');
      process.exit(1);
    }
    
    console.log(`[sync-services] Usando conexão de banco de dados: ${databaseUrl}`);
    
    // Determinar caminho para o arquivo de definições de serviços
    const definitionsPath = path.join(__dirname, '../models/seeds/serviceDefinitions.js');
    console.log(`[sync-services] Carregando definições de serviços de: ${definitionsPath}`);
    
    // Carregar definições de serviços
    const serviceDefinitions = await loadServiceDefinitions(definitionsPath, console.log);
    
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || serviceDefinitions.length === 0) {
      console.error('[sync-services] Erro: Nenhuma definição de serviço encontrada ou formato inválido');
      process.exit(1);
    }
    
    console.log(`[sync-services] Carregadas ${serviceDefinitions.length} definições de serviços`);
    
    // Inicializar cliente Prisma com configuração explícita
    console.log('[sync-services] Inicializando cliente Prisma com configuração explícita');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    // Testar conexão com o banco de dados
    console.log('[sync-services] Testando conexão com o banco de dados...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('[sync-services] Conexão com o banco de dados estabelecida com sucesso!');
    } catch (dbError) {
      console.error(`[sync-services] ERRO ao conectar ao banco de dados: ${dbError.message}`);
      console.error('[sync-services] Verifique se a URL de conexão está correta e se o banco de dados está acessível.');
      process.exit(1);
    }
    
    // Passo 1: Atualizar serviços no banco de dados
    const dbStats = await updateDatabaseServices(serviceDefinitions, prisma);
    
    // Passo 2: Atualizar arquivo de serviços estáticos
    const staticFileUpdated = await updateStaticServicesFile();
    
    // Resumo da operação
    console.log('='.repeat(80));
    console.log('[sync-services] Resumo da sincronização:');
    console.log(`[sync-services] Banco de dados: ${dbStats.atualizados} serviços atualizados, ${dbStats.criados} serviços criados, ${dbStats.erros} erros`);
    console.log(`[sync-services] Arquivo estático: ${staticFileUpdated ? 'Atualizado com sucesso' : 'Falha na atualização'}`);
    console.log('='.repeat(80));
    
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    
    console.log('[sync-services] Sincronização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('[sync-services] Erro durante a sincronização:', error);
    process.exit(1);
  }
}

// Executar função principal
main();
