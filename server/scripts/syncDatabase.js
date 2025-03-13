/**
 * Script de sincronização de banco de dados
 * 
 * Este script permite sincronizar dados entre ambientes (desenvolvimento e produção)
 * Útil para manter consistência entre ambientes e realizar migrações de dados
 * 
 * @version 1.0.0 - 2025-03-13
 * @author Lytspot Team
 */

import { PrismaClient } from '@prisma/client';
import { getServiceDefinitionsForFrontend } from '../models/seeds/serviceDefinitions.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logDir, 'sync-database.log');

/**
 * Registra uma mensagem no log
 * @param {string} message Mensagem a ser registrada
 * @param {string} level Nível do log (info, warn, error)
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  // Escrever no console
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`ℹ️ ${message}`);
  }
  
  // Escrever no arquivo de log
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

/**
 * Sincroniza os serviços de demonstração com o banco de dados
 * @param {boolean} forceUpdate Se true, atualiza serviços existentes
 * @param {boolean} deleteExisting Se true, exclui todos os serviços existentes antes de sincronizar
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncServicesToDatabase(forceUpdate = false, deleteExisting = false) {
  try {
    log('Iniciando sincronização de serviços com o banco de dados...');
    
    // Obter serviços de demonstração
    const demoServices = getServiceDefinitionsForFrontend();
    log(`Obtidos ${demoServices.length} serviços de demonstração para sincronizar`);
    
    // Se solicitado, excluir todos os serviços existentes
    if (deleteExisting) {
      log('Excluindo todos os serviços existentes...', 'warn');
      await prisma.servico.deleteMany({});
      log('Todos os serviços foram excluídos do banco de dados');
    }
    
    // Estatísticas para o relatório
    const stats = {
      total: demoServices.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    // Processar cada serviço
    for (const demoService of demoServices) {
      try {
        // Verificar se já existe um serviço com o mesmo nome
        const existingService = await prisma.servico.findFirst({
          where: { nome: demoService.nome }
        });
        
        if (existingService) {
          if (forceUpdate) {
            // Atualizar serviço existente
            log(`Atualizando serviço "${demoService.nome}" (ID: ${existingService.id})...`);
            
            // Extrair campos específicos para o modelo Servico
            const { id, duracao_media, detalhes, ...serviceData } = demoService;
            
            // Mapear campos específicos do frontend para o modelo do banco
            const dbServiceData = {
              ...serviceData,
              duracao_media_captura: detalhes?.captura || existingService.duracao_media_captura,
              duracao_media_tratamento: detalhes?.tratamento || existingService.duracao_media_tratamento,
              entregaveis: detalhes?.entregaveis || existingService.entregaveis,
              possiveis_adicionais: detalhes?.adicionais || existingService.possiveis_adicionais,
              valor_deslocamento: detalhes?.deslocamento || existingService.valor_deslocamento
            };
            
            await prisma.servico.update({
              where: { id: existingService.id },
              data: dbServiceData
            });
            
            log(`Serviço "${demoService.nome}" atualizado com sucesso`);
            stats.updated++;
          } else {
            // Pular serviço existente
            log(`Serviço "${demoService.nome}" já existe, pulando (use forceUpdate=true para atualizar)`, 'warn');
            stats.skipped++;
          }
        } else {
          // Criar novo serviço
          log(`Criando novo serviço "${demoService.nome}"...`);
          
          // Extrair campos específicos para o modelo Servico
          const { id, duracao_media, detalhes, ...serviceData } = demoService;
          
          // Mapear campos específicos do frontend para o modelo do banco
          const dbServiceData = {
            ...serviceData,
            duracao_media_captura: detalhes?.captura || '',
            duracao_media_tratamento: detalhes?.tratamento || '',
            entregaveis: detalhes?.entregaveis || '',
            possiveis_adicionais: detalhes?.adicionais || '',
            valor_deslocamento: detalhes?.deslocamento || ''
          };
          
          await prisma.servico.create({
            data: dbServiceData
          });
          
          log(`Serviço "${demoService.nome}" criado com sucesso`);
          stats.created++;
        }
      } catch (serviceError) {
        log(`Erro ao processar serviço "${demoService.nome}": ${serviceError.message}`, 'error');
        stats.errors++;
      }
    }
    
    // Gerar relatório
    const report = {
      timestamp: new Date().toISOString(),
      success: true,
      message: `Sincronização concluída: ${stats.created} criados, ${stats.updated} atualizados, ${stats.skipped} ignorados, ${stats.errors} erros`,
      stats
    };
    
    log(report.message);
    return report;
  } catch (error) {
    log(`Erro ao sincronizar serviços: ${error.message}`, 'error');
    return {
      timestamp: new Date().toISOString(),
      success: false,
      message: `Erro ao sincronizar serviços: ${error.message}`,
      error: error.message
    };
  } finally {
    // Garantir que a conexão com o banco seja fechada
    await prisma.$disconnect();
  }
}

/**
 * Sincroniza os serviços do banco de dados com o arquivo de dados de demonstração
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncDatabaseToDemo() {
  try {
    log('Iniciando sincronização do banco de dados para arquivo de demonstração...');
    
    // Buscar todos os serviços do banco de dados
    const services = await prisma.servico.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    
    if (services.length === 0) {
      log('Nenhum serviço encontrado no banco de dados.', 'warn');
      return {
        timestamp: new Date().toISOString(),
        success: false,
        message: 'Nenhum serviço encontrado no banco de dados.'
      };
    }
    
    log(`Encontrados ${services.length} serviços no banco de dados`);
    
    // Transformar os serviços para o formato do frontend
    const transformedServices = services.map((service, index) => {
      // Calcula a duração média aproximada baseada nos campos individuais
      const duracaoCaptura = parseInt(service.duracao_media_captura?.split(' ')[0] || 0);
      const duracaoTratamento = parseInt(service.duracao_media_tratamento?.split(' ')[0] || 0);
      const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
      
      return {
        id: index + 1, // Gerar IDs sequenciais para o frontend
        nome: service.nome,
        descricao: service.descricao,
        preco_base: service.preco_base,
        duracao_media: duracaoMedia,
        detalhes: {
          captura: service.duracao_media_captura || '',
          tratamento: service.duracao_media_tratamento || '',
          entregaveis: service.entregaveis || '',
          adicionais: service.possiveis_adicionais || '',
          deslocamento: service.valor_deslocamento || ''
        }
      };
    });
    
    // Ordenar serviços conforme a ordem específica solicitada
    const orderPreference = [
      'VLOG - Aventuras em Família',
      'VLOG - Amigos e Comunidade',
      'Cobertura Fotográfica de Evento Social',
      'Filmagem de Evento Social',
      'Ensaio Fotográfico de Família',
      'Filmagem Aérea com Drone',
      'Fotografia Aérea com Drone'
    ];
    
    // Função para determinar a posição na ordem de preferência
    const getOrderPosition = (serviceName) => {
      const index = orderPreference.findIndex(name => 
        serviceName.toLowerCase().includes(name.toLowerCase())
      );
      return index >= 0 ? index : orderPreference.length;
    };
    
    // Ordenar os serviços conforme a preferência
    transformedServices.sort((a, b) => {
      const posA = getOrderPosition(a.nome);
      const posB = getOrderPosition(b.nome);
      return posA - posB;
    });
    
    // Caminho para o arquivo de dados de demonstração
    const demoFilePath = path.resolve(rootDir, '../src/components/pricing/dadosDemonstracao.js');
    
    // Criar o conteúdo do arquivo
    const currentDate = new Date().toISOString();
    const fileContent = `/**
 * Dados de demonstração para o simulador de preços
 * Gerado automaticamente em ${currentDate}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE
 */

export const dadosDemonstracao = ${JSON.stringify(transformedServices, null, 2)};

export const servicos = dadosDemonstracao;

export default dadosDemonstracao;
`;
    
    // Escrever o arquivo
    fs.writeFileSync(demoFilePath, fileContent, 'utf8');
    
    log(`Arquivo de dados de demonstração atualizado com sucesso: ${demoFilePath}`);
    
    return {
      timestamp: new Date().toISOString(),
      success: true,
      message: `Sincronização concluída: ${transformedServices.length} serviços exportados para o arquivo de demonstração`,
      count: transformedServices.length
    };
  } catch (error) {
    log(`Erro ao sincronizar banco de dados para arquivo de demonstração: ${error.message}`, 'error');
    return {
      timestamp: new Date().toISOString(),
      success: false,
      message: `Erro ao sincronizar: ${error.message}`,
      error: error.message
    };
  } finally {
    // Garantir que a conexão com o banco seja fechada
    await prisma.$disconnect();
  }
}

// Exportar funções para uso em outros módulos
export default {
  syncServicesToDatabase,
  syncDatabaseToDemo
};
