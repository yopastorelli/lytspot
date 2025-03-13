/**
 * Sistema de seed unificado para o Lytspot
 * @description Este módulo centraliza a lógica de população do banco de dados
 * @version 1.0.0 - 2025-03-12
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { serviceDefinitions, getServiceDefinitionsForFrontend } from './serviceDefinitions.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função principal para popular o banco de dados
 * @param {Object} options Opções de configuração
 * @param {boolean} options.force Se verdadeiro, força a recriação dos dados mesmo se já existirem
 * @param {string} options.environment Ambiente para execução (development, test, production)
 * @returns {Promise<boolean>} Verdadeiro se a operação foi concluída com sucesso
 */
export async function seedDatabase(options = {}) {
  const { 
    force = false, 
    environment = process.env.NODE_ENV || 'development',
    syncDemoData = true
  } = options;
  
  console.log(`🔄 Iniciando seed do banco de dados (ambiente: ${environment})...`);
  
  try {
    // Verificar ambiente
    if (environment === 'production' && !force) {
      console.warn('⚠️ Tentativa de seed em produção sem flag force. Operação cancelada.');
      return false;
    }
    
    // Conectar ao banco de dados
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Seed de serviços
    await seedServices(force);
    
    // Sincronizar dados de demonstração se solicitado
    if (syncDemoData) {
      await syncDemonstrationData();
    }
    
    console.log('✅ Banco de dados populado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Popula a tabela de serviços com os dados definidos
 * @param {boolean} force Se verdadeiro, força a recriação dos serviços mesmo se já existirem
 */
async function seedServices(force = false) {
  // Verificar se já existem serviços
  const existingServices = await prisma.servico.count();
  
  if (existingServices > 0 && !force) {
    console.log(`ℹ️ ${existingServices} serviços já existem. Pulando seed.`);
    return;
  }
  
  // Limpar serviços existentes se force=true ou se não houver serviços
  if (force || existingServices === 0) {
    if (existingServices > 0) {
      await prisma.servico.deleteMany({});
      console.log('🗑️ Serviços existentes removidos');
    }
    
    // Inserir serviços
    console.log('📝 Inserindo serviços no banco de dados...');
    for (const service of serviceDefinitions) {
      await prisma.servico.create({ data: service });
    }
    
    const insertedServices = await prisma.servico.count();
    console.log(`✅ ${insertedServices} serviços inseridos com sucesso!`);
  }
}

/**
 * Sincroniza os dados de demonstração com os dados do banco
 * Garante que o simulador de preços use os mesmos dados do painel administrativo
 * mesmo quando a API não estiver disponível
 */
async function syncDemonstrationData() {
  try {
    console.log('🔄 Sincronizando dados de demonstração...');
    
    // Gerar dados de demonstração a partir das definições centralizadas
    const demoData = getServiceDefinitionsForFrontend();
    
    // Caminho para o arquivo de dados de demonstração
    const demoFilePath = path.resolve(process.cwd(), 'src', 'components', 'pricing', 'dadosDemonstracao.js');
    
    // Verificar se o diretório existe
    const demoFileDir = path.dirname(demoFilePath);
    try {
      await fs.access(demoFileDir);
    } catch (error) {
      console.log(`⚠️ Diretório ${demoFileDir} não encontrado. Criando...`);
      await fs.mkdir(demoFileDir, { recursive: true });
    }
    
    // Gerar conteúdo do arquivo
    const timestamp = new Date().toISOString();
    const fileContent = `/**
 * Dados de demonstração para o simulador de preços
 * Gerado automaticamente em ${timestamp}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE
 */

export const dadosDemonstracao = ${JSON.stringify(demoData, null, 2)};
export const servicos = dadosDemonstracao;

export default dadosDemonstracao;
`;

    // Escrever arquivo
    await fs.writeFile(demoFilePath, fileContent, 'utf8');
    console.log(`✅ Dados de demonstração atualizados em: ${demoFilePath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar dados de demonstração:', error);
    return false;
  }
}

// Exportar funções individuais para uso específico
export { seedServices, syncDemonstrationData };

// Se este arquivo for executado diretamente, executar o seed
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes('--force');
  const environment = process.env.NODE_ENV || 'development';
  
  seedDatabase({ force, environment })
    .then(() => {
      console.log('✅ Script de seed concluído com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro durante execução do script de seed:', error);
      process.exit(1);
    });
}
