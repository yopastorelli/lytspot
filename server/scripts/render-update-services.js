/**
 * Script de atualização de serviços específico para ambiente Render
 * @version 1.0.0 - 2025-03-14
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de definições de serviços
const serviceDefinitionsPath = path.join(__dirname, '..', 'models', 'seeds', 'updatedServiceDefinitions.js');

// Configurar logger
const logDir = path.join(__dirname, '..', 'logs');
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
 * Função para obter definições de serviços
 * @returns {Array} Array de definições de serviços
 */
async function obterDefinicaoServicos() {
  log('INFO', `Carregando definições de serviços de: ${serviceDefinitionsPath}`);
  
  try {
    // Importar dinamicamente o módulo de definições de serviços
    const serviceDefinitionsModule = await import(serviceDefinitionsPath);
    
    // Verificar se o módulo exporta a função getUpdatedServiceDefinitions
    if (typeof serviceDefinitionsModule.getUpdatedServiceDefinitions === 'function') {
      return serviceDefinitionsModule.getUpdatedServiceDefinitions();
    } else if (typeof serviceDefinitionsModule.updatedServiceDefinitions !== 'undefined') {
      return serviceDefinitionsModule.updatedServiceDefinitions;
    } else if (typeof serviceDefinitionsModule.default === 'function') {
      return serviceDefinitionsModule.default();
    } else if (Array.isArray(serviceDefinitionsModule.default)) {
      return serviceDefinitionsModule.default;
    } else {
      // Fallback para serviços básicos
      log('WARN', 'Módulo de definições de serviços não exporta a função esperada, usando serviços básicos');
      return getBasicServices();
    }
  } catch (error) {
    log('ERROR', `Erro ao carregar definições de serviços: ${error.message}`);
    log('WARN', 'Usando serviços básicos como fallback');
    return getBasicServices();
  }
}

/**
 * Função para obter serviços básicos (fallback)
 * @returns {Array} Array de serviços básicos
 */
function getBasicServices() {
  return [
    {
      nome: 'Ensaio Fotográfico Pessoal',
      descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal.',
      preco_base: 200.00,
      duracao_media_captura: '2 a 3 horas',
      duracao_media_tratamento: 'até 7 dias úteis',
      entregaveis: '20 fotos editadas em alta resolução',
      possiveis_adicionais: 'Edição avançada, maquiagem profissional',
      valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
      detalhes: JSON.stringify({
        captura: '2 a 3 horas',
        tratamento: 'até 7 dias úteis',
        entregaveis: '20 fotos editadas em alta resolução',
        adicionais: 'Edição avançada, maquiagem profissional',
        deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      })
    },
    {
      nome: 'Ensaio Externo de Casal ou Família',
      descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos.',
      preco_base: 350.00,
      duracao_media_captura: '2 a 4 horas',
      duracao_media_tratamento: 'até 10 dias úteis',
      entregaveis: '30 fotos editadas em alta resolução',
      possiveis_adicionais: 'Álbum impresso, fotos adicionais',
      valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
      detalhes: JSON.stringify({
        captura: '2 a 4 horas',
        tratamento: 'até 10 dias úteis',
        entregaveis: '30 fotos editadas em alta resolução',
        adicionais: 'Álbum impresso, fotos adicionais',
        deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      })
    },
    {
      nome: 'Fotografia de Eventos',
      descricao: 'Cobertura fotográfica de eventos sociais, corporativos ou festas, com entrega de galeria digital.',
      preco_base: 500.00,
      duracao_media_captura: '4 a 8 horas',
      duracao_media_tratamento: 'até 14 dias úteis',
      entregaveis: '100+ fotos editadas em alta resolução, galeria online',
      possiveis_adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
      valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km',
      detalhes: JSON.stringify({
        captura: '4 a 8 horas',
        tratamento: 'até 14 dias úteis',
        entregaveis: '100+ fotos editadas em alta resolução, galeria online',
        adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
        deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
      })
    }
  ];
}

/**
 * Função para limpar o cache da API
 */
async function limparCacheAPI() {
  log('INFO', 'Limpando cache da API...');
  
  // Determinar a URL base da API
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    // Limpar cache específico de pricing
    log('INFO', 'Limpando cache de pricing...');
    await axios.get(`${baseUrl}/api/cache/clear?key=/api/pricing`);
    
    // Limpar cache completo para garantir
    log('INFO', 'Limpando cache completo...');
    await axios.get(`${baseUrl}/api/cache/clear`);
    
    // Verificar status do cache
    log('INFO', 'Verificando status do cache após limpeza...');
    const response = await axios.get(`${baseUrl}/api/cache/status`);
    log('INFO', `Status do cache: ${JSON.stringify(response.data)}`);
    
    log('INFO', 'Cache limpo com sucesso!');
  } catch (error) {
    log('ERROR', `Erro ao limpar cache: ${error.message}`);
    log('INFO', 'Aguardando 2 segundos para garantir que o cache seja limpo...');
    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Função principal para atualizar serviços
 */
async function atualizarServicos() {
  log('INFO', '=== ATUALIZANDO SERVIÇOS NO AMBIENTE RENDER ===');
  log('INFO', `Data e hora: ${new Date().toISOString()}`);
  log('INFO', `Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar o caminho do banco de dados
  const databaseUrl = process.env.DATABASE_URL || 'file:../database.sqlite';
  log('INFO', `DATABASE_URL: ${databaseUrl}`);
  
  // Inicializar Prisma Client
  const prisma = new PrismaClient();
  
  try {
    // Testar conexão com o banco de dados
    log('INFO', 'Testando conexão com o banco de dados...');
    await prisma.$connect();
    log('INFO', 'Conexão estabelecida com sucesso');
    
    // Obter definições de serviços
    const servicosDemo = await obterDefinicaoServicos();
    log('INFO', `Obtidos ${servicosDemo.length} serviços de demonstração`);
    
    // Atualizar serviços no banco de dados
    for (const servico of servicosDemo) {
      // Verificar se o serviço já existe
      const servicoExistente = await prisma.servico.findFirst({
        where: {
          nome: servico.nome
        }
      });
      
      if (servicoExistente) {
        // Atualizar serviço existente
        await prisma.servico.update({
          where: {
            id: servicoExistente.id
          },
          data: servico
        });
        log('INFO', `Serviço "${servico.nome}" atualizado com sucesso (ID: ${servicoExistente.id})`);
      } else {
        // Criar novo serviço
        const novoServico = await prisma.servico.create({
          data: servico
        });
        log('INFO', `Serviço "${servico.nome}" criado com sucesso (ID: ${novoServico.id})`);
      }
    }
    
    // Contar total de serviços após atualização
    const totalServicos = await prisma.servico.count();
    log('INFO', `Total de serviços após atualização: ${totalServicos}`);
    
    // Limpar cache da API
    await limparCacheAPI();
    
    log('INFO', '=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===');
  } catch (error) {
    log('ERROR', `Erro durante a atualização: ${error.message}`);
    log('ERROR', error.stack);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('INFO', 'Desconectado do banco de dados');
  }
}

// Executar a função principal
atualizarServicos().catch(error => {
  log('ERROR', `Erro fatal: ${error.message}`);
  log('ERROR', error.stack);
  process.exit(1);
});
