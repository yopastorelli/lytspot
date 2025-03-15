/**
 * Script para atualização remota de serviços no ambiente de produção
 * @description Conecta-se diretamente ao banco de dados de produção e atualiza os serviços
 * @version 1.1.0 - 2025-03-15 - Refatorado para usar serviceDataUtils
 * @usage node server/scripts/atualizar-servicos-producao.js
 */

// Importações
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';
import { PrismaClient } from '@prisma/client';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';
import axios from 'axios';
import readline from 'readline';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// URL do banco de dados de produção (SQLite no Render)
const PROD_DB_URL = 'file:/opt/render/project/src/database.sqlite';

// URL da API de produção para verificação
const PROD_API_URL = 'https://lytspot.onrender.com/api/pricing';

// Caminho para o arquivo de serviços estáticos do frontend
const simulatorServicesPath = path.join(rootDir, 'src', 'data', 'servicos.js');

/**
 * Interface de linha de comando para confirmar ações
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Solicita confirmação do usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @returns {Promise<boolean>} - True se confirmado, false caso contrário
 */
function confirmar(mensagem) {
  return new Promise((resolve) => {
    rl.question(`${mensagem} (s/N): `, (resposta) => {
      resolve(resposta.toLowerCase() === 's');
    });
  });
}

/**
 * Atualiza os serviços no banco de dados remoto
 * @param {Array} serviceDefinitions - Definições de serviços
 * @param {PrismaClient} prisma - Cliente Prisma
 * @returns {Object} - Estatísticas de atualização
 */
async function atualizarServicosRemoto(serviceDefinitions, prisma) {
  console.log('[atualizar-producao] Iniciando atualização de serviços no banco de dados remoto');
  
  // Verificar serviços existentes no banco de dados
  console.log('[atualizar-producao] Consultando serviços existentes no banco de dados remoto...');
  const servicosExistentes = await prisma.servico.findMany();
  console.log(`[atualizar-producao] Encontrados ${servicosExistentes.length} serviços no banco de dados remoto`);
  
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
        console.log(`[atualizar-producao] Atualizando serviço existente: ${serviceDefinition.nome} (ID: ${servicoExistente.id})`);
        await prisma.servico.update({
          where: { id: servicoExistente.id },
          data: dadosServico
        });
        stats.atualizados++;
      } 
      // Se não existe, criar novo
      else {
        console.log(`[atualizar-producao] Criando novo serviço: ${serviceDefinition.nome}`);
        const novoServico = await prisma.servico.create({
          data: dadosServico
        });
        console.log(`[atualizar-producao] Novo serviço criado com ID: ${novoServico.id}`);
        stats.criados++;
      }
    } catch (error) {
      console.error(`[atualizar-producao] Erro ao processar serviço ${serviceDefinition.nome}:`, error.message);
      stats.erros++;
    }
  }
  
  return stats;
}

/**
 * Verifica os serviços na API de produção
 * @returns {Promise<Array>} - Serviços da API de produção
 */
async function verificarApiProducao() {
  console.log(`[atualizar-producao] Verificando API de produção: ${PROD_API_URL}`);
  
  try {
    const response = await axios.get(PROD_API_URL);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('[atualizar-producao] Resposta da API de produção não é um array');
      return null;
    }
    
    console.log(`[atualizar-producao] API de produção retornou ${response.data.length} serviços`);
    return response.data;
  } catch (error) {
    console.error('[atualizar-producao] Erro ao verificar API de produção:', error.message);
    return null;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(80));
  console.log(`[atualizar-producao] Iniciando atualização remota de serviços (v1.1.0) - ${new Date().toISOString()}`);
  console.log('='.repeat(80));
  
  // Aviso de segurança
  console.log('\n⚠️  ATENÇÃO: Este script irá modificar diretamente o banco de dados de PRODUÇÃO! ⚠️\n');
  
  const confirmacao = await confirmar('Tem certeza que deseja continuar?');
  
  if (!confirmacao) {
    console.log('[atualizar-producao] Operação cancelada pelo usuário.');
    rl.close();
    return;
  }
  
  try {
    // Determinar caminho para o arquivo de definições de serviços
    const definitionsPath = path.join(__dirname, '../models/seeds/serviceDefinitions.js');
    console.log(`[atualizar-producao] Carregando definições de serviços de: ${definitionsPath}`);
    
    // Carregar definições de serviços
    const serviceDefinitions = await loadServiceDefinitions(definitionsPath, console.log);
    
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || serviceDefinitions.length === 0) {
      console.error('[atualizar-producao] Erro: Nenhuma definição de serviço encontrada ou formato inválido');
      rl.close();
      return;
    }
    
    console.log(`[atualizar-producao] Carregadas ${serviceDefinitions.length} definições de serviços`);
    
    // Verificar API de produção antes da atualização
    console.log('[atualizar-producao] Verificando estado atual da API de produção...');
    const servicosAntes = await verificarApiProducao();
    
    // Inicializar cliente Prisma com URL do banco de dados de produção
    console.log('[atualizar-producao] Inicializando cliente Prisma com URL do banco de dados de produção');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: PROD_DB_URL
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    // Testar conexão com o banco de dados
    console.log('[atualizar-producao] Testando conexão com o banco de dados de produção...');
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('[atualizar-producao] Conexão com o banco de dados de produção estabelecida com sucesso!');
    } catch (dbError) {
      console.error(`[atualizar-producao] ERRO ao conectar ao banco de dados de produção: ${dbError.message}`);
      console.error('[atualizar-producao] Verifique se a URL de conexão está correta e se o banco de dados está acessível.');
      rl.close();
      return;
    }
    
    // Confirmação final
    const confirmacaoFinal = await confirmar(`Pronto para atualizar ${serviceDefinitions.length} serviços no banco de dados de PRODUÇÃO. Continuar?`);
    
    if (!confirmacaoFinal) {
      console.log('[atualizar-producao] Operação cancelada pelo usuário.');
      await prisma.$disconnect();
      rl.close();
      return;
    }
    
    // Atualizar serviços no banco de dados remoto
    const stats = await atualizarServicosRemoto(serviceDefinitions, prisma);
    
    // Resumo da operação
    console.log('='.repeat(80));
    console.log('[atualizar-producao] Resumo da atualização:');
    console.log(`[atualizar-producao] Serviços atualizados: ${stats.atualizados}`);
    console.log(`[atualizar-producao] Serviços criados: ${stats.criados}`);
    console.log(`[atualizar-producao] Erros: ${stats.erros}`);
    console.log('='.repeat(80));
    
    // Verificar API de produção após a atualização
    console.log('[atualizar-producao] Aguardando 5 segundos para que as alterações sejam propagadas...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('[atualizar-producao] Verificando estado da API de produção após a atualização...');
    const servicosDepois = await verificarApiProducao();
    
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    
    console.log('[atualizar-producao] Atualização remota concluída com sucesso!');
    console.log('[atualizar-producao] Nota: Pode ser necessário reiniciar o servidor de produção para que as alterações sejam refletidas na API.');
    
    rl.close();
  } catch (error) {
    console.error('[atualizar-producao] Erro durante a atualização remota:', error);
    rl.close();
  }
}

// Executar função principal
main();
