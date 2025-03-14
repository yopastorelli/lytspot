/**
 * Script para popular o banco de dados com serviços de demonstração
 * 
 * Este script utiliza as definições de serviços do módulo serviceDefinitions.js
 * para popular o banco de dados com serviços de demonstração.
 * 
 * @version 1.0.0 - 2025-03-13
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getServiceDefinitionsForFrontend } from '../models/seeds/serviceDefinitions.js';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Diretório de logs
const logsDir = path.resolve(rootDir, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logsDir, 'popular-servicos.log');

/**
 * Escreve uma mensagem no arquivo de log
 * @param {string} message Mensagem a ser registrada
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Escrever no console
  console.log(message);
  
  // Escrever no arquivo de log
  fs.appendFileSync(logFile, logMessage);
}

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

/**
 * Sanitiza os dados de um serviço para salvar no banco de dados
 * @param {Object} service Dados do serviço
 * @returns {Object} Dados sanitizados
 */
function sanitizeServiceData(service) {
  // Remover campos que não existem no modelo Prisma
  const { id, ...sanitizedData } = service;
  
  // Converter preço para número
  if (sanitizedData.preco_base !== undefined) {
    sanitizedData.preco_base = typeof sanitizedData.preco_base === 'string' 
      ? parseFloat(sanitizedData.preco_base) 
      : sanitizedData.preco_base;
  }
  
  return sanitizedData;
}

/**
 * Cria um backup dos serviços existentes no banco de dados
 * @param {Array} servicos Lista de serviços para backup
 * @returns {string} Caminho do arquivo de backup
 */
async function criarBackupServicos(servicos) {
  try {
    // Verificar ambiente para determinar o diretório de backup
    const isRenderEnvironment = process.env.RENDER === 'true';
    let backupDir;
    
    if (isRenderEnvironment) {
      // No Render, usar o diretório persistente
      backupDir = path.resolve('/opt/render/project/data', 'backups', 'servicos');
    } else {
      // Em ambiente local, usar o diretório do projeto
      backupDir = path.resolve(rootDir, 'backups', 'servicos');
    }
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      log(`Diretório de backup criado: ${backupDir}`);
    }
    
    // Gerar nome do arquivo com timestamp e informações do ambiente
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const ambiente = process.env.NODE_ENV || 'desenvolvimento';
    const backupFilename = `servicos_backup_${ambiente}_${timestamp}.json`;
    const backupPath = path.resolve(backupDir, backupFilename);
    
    // Adicionar metadados ao backup
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        ambiente: ambiente,
        totalServicos: servicos.length,
        versao: '1.0.0'
      },
      servicos: servicos
    };
    
    // Salvar dados em formato JSON
    fs.writeFileSync(
      backupPath, 
      JSON.stringify(backupData, null, 2), 
      'utf8'
    );
    
    log(`Backup criado com sucesso: ${backupPath}`);
    return backupPath;
  } catch (error) {
    log(`Erro ao criar backup: ${error.message}`);
    console.error('Detalhes do erro:', error);
    return null;
  }
}

/**
 * Popula o banco de dados com serviços de demonstração
 */
async function popularServicos() {
  log('=== POPULANDO BANCO DE DADOS COM SERVIÇOS ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    log('Conexão estabelecida com sucesso');
    
    // Obter serviços de demonstração
    const servicosDemo = getServiceDefinitionsForFrontend();
    log(`Obtidos ${servicosDemo.length} serviços de demonstração`);
    
    // Verificar se já existem serviços no banco de dados
    const countServicos = await prisma.servico.count();
    log(`Encontrados ${countServicos} serviços no banco de dados`);
    
    if (countServicos > 0) {
      log('Banco de dados já possui serviços, verificando consistência...');
      
      // Verificar cada serviço de demonstração
      for (const servicoDemo of servicosDemo) {
        // Verificar se o serviço existe no banco de dados
        const servicoExistente = await prisma.servico.findFirst({
          where: {
            nome: servicoDemo.nome
          }
        });
        
        if (servicoExistente) {
          log(`Serviço "${servicoDemo.nome}" já existe no banco de dados (ID: ${servicoExistente.id})`);
        } else {
          // Criar serviço
          log(`Criando serviço "${servicoDemo.nome}"...`);
          const sanitizedData = sanitizeServiceData(servicoDemo);
          
          try {
            const novoServico = await prisma.servico.create({
              data: sanitizedData
            });
            
            log(`Serviço criado com sucesso (ID: ${novoServico.id})`);
          } catch (error) {
            log(`Erro ao criar serviço "${servicoDemo.nome}": ${error.message}`);
          }
        }
      }
    } else {
      log('Banco de dados vazio, populando com todos os serviços de demonstração...');
      
      // Criar todos os serviços
      for (const servicoDemo of servicosDemo) {
        log(`Criando serviço "${servicoDemo.nome}"...`);
        const sanitizedData = sanitizeServiceData(servicoDemo);
        
        try {
          const novoServico = await prisma.servico.create({
            data: sanitizedData
          });
          
          log(`Serviço criado com sucesso (ID: ${novoServico.id})`);
        } catch (error) {
          log(`Erro ao criar serviço "${servicoDemo.nome}": ${error.message}`);
        }
      }
    }
    
    // Verificar resultado final
    const countFinal = await prisma.servico.count();
    log(`Total de serviços após população: ${countFinal}`);
    
    log('População de serviços concluída com sucesso');
  } catch (error) {
    log(`Erro durante a população de serviços: ${error.message}`);
    console.error('Detalhes do erro:', error);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('Desconectado do banco de dados');
  }
  
  log('=== POPULAÇÃO CONCLUÍDA ===');
}

/**
 * Atualiza serviços existentes no banco de dados
 * @param {boolean} forceUpdate Se true, força a atualização mesmo se os dados forem iguais
 */
async function atualizarServicosExistentes(forceUpdate = false) {
  log('=== ATUALIZANDO SERVIÇOS EXISTENTES ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Modo: ${forceUpdate ? 'Forçado' : 'Normal'}`);
  
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    log('Conexão estabelecida com sucesso');
    
    // Importar definições atualizadas
    const { getUpdatedServiceDefinitions } = await import('../models/seeds/updatedServiceDefinitions.js');
    const servicosAtualizados = getUpdatedServiceDefinitions();
    log(`Obtidos ${servicosAtualizados.length} serviços para atualização`);
    
    // Obter todos os serviços existentes
    const servicosExistentes = await prisma.servico.findMany();
    log(`Encontrados ${servicosExistentes.length} serviços existentes no banco de dados`);
    
    // Criar backup dos serviços existentes
    const backupPath = await criarBackupServicos(servicosExistentes);
    if (backupPath) {
      log(`Backup dos serviços existentes criado em: ${backupPath}`);
    } else {
      log('Aviso: Não foi possível criar backup dos serviços existentes');
    }
    
    // Lista de nomes de serviços atualizados para comparação
    const nomesServicosAtualizados = servicosAtualizados.map(servico => servico.nome);
    
    // Identificar serviços para remover (existentes mas não presentes na lista atualizada)
    const servicosParaRemover = servicosExistentes.filter(
      servico => !nomesServicosAtualizados.includes(servico.nome)
    );
    
    // Remover serviços que não estão mais na lista atualizada
    if (servicosParaRemover.length > 0) {
      log(`Removendo ${servicosParaRemover.length} serviços que não estão mais na lista atualizada:`);
      
      for (const servico of servicosParaRemover) {
        log(`- Removendo serviço "${servico.nome}" (ID: ${servico.id})...`);
        
        try {
          await prisma.servico.delete({
            where: { id: servico.id }
          });
          
          log(`  Serviço removido com sucesso`);
        } catch (error) {
          log(`  Erro ao remover serviço: ${error.message}`);
        }
      }
    } else {
      log('Não há serviços para remover');
    }
    
    // Verificar e atualizar cada serviço
    for (const servicoAtualizado of servicosAtualizados) {
      // Verificar se o serviço existe no banco de dados
      const servicoExistente = await prisma.servico.findFirst({
        where: {
          nome: servicoAtualizado.nome
        }
      });
      
      if (servicoExistente) {
        // Se forçar atualização ou se houver diferenças, atualizar
        if (forceUpdate || JSON.stringify(servicoExistente) !== JSON.stringify({...servicoExistente, ...sanitizeServiceData(servicoAtualizado)})) {
          log(`Atualizando serviço "${servicoAtualizado.nome}" (ID: ${servicoExistente.id})...`);
          
          try {
            const servicoAtual = await prisma.servico.update({
              where: { id: servicoExistente.id },
              data: sanitizeServiceData(servicoAtualizado)
            });
            
            log(`Serviço atualizado com sucesso (ID: ${servicoAtual.id})`);
          } catch (error) {
            log(`Erro ao atualizar serviço "${servicoAtualizado.nome}": ${error.message}`);
          }
        } else {
          log(`Serviço "${servicoAtualizado.nome}" já está atualizado (ID: ${servicoExistente.id})`);
        }
      } else {
        // Criar serviço se não existir
        log(`Criando serviço "${servicoAtualizado.nome}"...`);
        const sanitizedData = sanitizeServiceData(servicoAtualizado);
        
        try {
          const novoServico = await prisma.servico.create({
            data: sanitizedData
          });
          
          log(`Serviço criado com sucesso (ID: ${novoServico.id})`);
        } catch (error) {
          log(`Erro ao criar serviço "${servicoAtualizado.nome}": ${error.message}`);
        }
      }
    }
    
    // Verificar resultado final
    const countFinal = await prisma.servico.count();
    log(`Total de serviços após atualização: ${countFinal}`);
    
    log('Atualização de serviços concluída com sucesso');
  } catch (error) {
    log(`Erro durante a atualização de serviços: ${error.message}`);
    console.error('Detalhes do erro:', error);
  } finally {
    await prisma.$disconnect();
    log('Desconectado do banco de dados');
  }
  
  log('=== ATUALIZAÇÃO CONCLUÍDA ===');
}

// Exportar a função para uso em outros scripts
export { atualizarServicosExistentes };

// Verificar argumentos da linha de comando para determinar o modo de execução
const args = process.argv.slice(2);
if (args.includes('--update')) {
  const forceUpdate = args.includes('--force');
  atualizarServicosExistentes(forceUpdate)
    .then(() => {
      log('Script de atualização concluído');
      process.exit(0);
    })
    .catch(error => {
      log(`Erro fatal: ${error.message}`);
      process.exit(1);
    });
} else if (!args.includes('--no-run')) {
  // Executar população de serviços por padrão
  popularServicos()
    .catch(error => {
      console.error('Erro fatal durante a população de serviços:', error);
      process.exit(1);
    });
}
