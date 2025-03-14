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
 * Sanitiza os dados de um serviço para o formato do banco de dados
 * @param {Object} servicoData Dados do serviço
 * @returns {Object} Dados sanitizados
 * @version 1.2.0 - 2025-03-14 - Melhorada para garantir a estrutura aninhada detalhes
 */
function sanitizeServiceData(servicoData) {
  // Criar cópia para não modificar o original
  const data = { ...servicoData };
  
  // Garantir que todos os campos obrigatórios estejam presentes
  if (!data.nome) {
    throw new Error('Nome do serviço é obrigatório');
  }
  
  if (!data.descricao) {
    throw new Error('Descrição do serviço é obrigatória');
  }
  
  if (data.preco_base === undefined || data.preco_base === null) {
    throw new Error('Preço base do serviço é obrigatório');
  }
  
  // Garantir que o preço base seja um número
  data.preco_base = Number(data.preco_base);
  
  // Criar estrutura detalhes se não existir
  const detalhes = data.detalhes || {};
  
  // Garantir que os campos de duração estejam presentes
  if (!data.duracao_media_captura) {
    data.duracao_media_captura = detalhes.captura || 'Sob consulta';
  }
  
  if (!data.duracao_media_tratamento) {
    data.duracao_media_tratamento = detalhes.tratamento || 'Sob consulta';
  }
  
  // Garantir que os campos de entregáveis e adicionais estejam presentes
  if (!data.entregaveis) {
    data.entregaveis = detalhes.entregaveis || 'Sob consulta';
  }
  
  if (!data.possiveis_adicionais) {
    data.possiveis_adicionais = detalhes.adicionais || '';
  }
  
  if (!data.valor_deslocamento) {
    data.valor_deslocamento = detalhes.deslocamento || 'Sob consulta';
  }
  
  // Criar estrutura aninhada detalhes como JSON string
  const detalhesObj = {
    captura: data.duracao_media_captura,
    tratamento: data.duracao_media_tratamento,
    entregaveis: data.entregaveis,
    adicionais: data.possiveis_adicionais,
    deslocamento: data.valor_deslocamento
  };
  
  // Converter para JSON string
  data.detalhes = JSON.stringify(detalhesObj);
  
  return data;
}

/**
 * Estima a duração em dias com base na string de duração
 * @param {string} durationStr String de duração (ex: "até 10 dias")
 * @returns {number} Duração estimada em dias
 */
function estimateDurationInDays(durationStr) {
  if (!durationStr) return 7; // Valor padrão
  
  // Extrair números da string
  const matches = durationStr.match(/\d+/g);
  if (matches && matches.length > 0) {
    return parseInt(matches[matches.length - 1], 10);
  }
  
  // Mapeamento de termos para valores numéricos
  const durationMap = {
    'imediato': 1,
    'mesmo dia': 1,
    'próximo dia': 2,
    'poucos dias': 3,
    'uma semana': 7,
    'duas semanas': 14,
    'três semanas': 21,
    'um mês': 30,
    'dois meses': 60
  };
  
  // Verificar se algum termo conhecido está na string
  for (const [term, days] of Object.entries(durationMap)) {
    if (durationStr.toLowerCase().includes(term)) {
      return days;
    }
  }
  
  return 7; // Valor padrão se não conseguir estimar
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
 * Compara dois serviços e retorna uma lista de campos que são diferentes
 * @param {Object} servicoExistente Serviço existente no banco de dados
 * @param {Object} servicoAtualizado Serviço atualizado
 * @returns {Array} Lista de campos que são diferentes
 * @version 1.0.0 - 2025-03-14
 */
function compararServicos(servicoExistente, servicoAtualizado) {
  const diferencas = [];
  const camposParaComparar = [
    'nome',
    'descricao',
    'preco_base',
    'duracao_media',
    'duracao_media_captura',
    'duracao_media_tratamento',
    'entregaveis',
    'possiveis_adicionais',
    'valor_deslocamento'
  ];
  
  // Comparar campos simples
  for (const campo of camposParaComparar) {
    if (servicoExistente[campo] !== servicoAtualizado[campo]) {
      diferencas.push(campo);
    }
  }
  
  // Comparar estrutura detalhes (se existir)
  if (servicoExistente.detalhes || servicoAtualizado.detalhes) {
    const detalhesExistente = servicoExistente.detalhes || {};
    const detalhesAtualizado = servicoAtualizado.detalhes || {};
    
    const camposDetalhes = [
      'captura',
      'tratamento',
      'entregaveis',
      'adicionais',
      'deslocamento'
    ];
    
    for (const campo of camposDetalhes) {
      if (detalhesExistente[campo] !== detalhesAtualizado[campo]) {
        diferencas.push(`detalhes.${campo}`);
      }
    }
  }
  
  return diferencas;
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
 * @version 1.2.0 - 2025-03-14 - Melhorada para preservar campo detalhes e garantir compatibilidade com frontend
 */
async function atualizarServicosExistentes(forceUpdate = false) {
  log('=== ATUALIZANDO SERVIÇOS EXISTENTES ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${process.env.RENDER ? 'Sim' : 'Não'}`);
  log(`Modo: ${forceUpdate ? 'Forçado' : 'Normal'}`);
  
  try {
    // Conectar ao banco de dados
    log('Conectando ao banco de dados...');
    await prisma.$connect();
    log('Conexão estabelecida com sucesso');
    
    // Importar definições atualizadas
    log('Importando definições atualizadas de serviços...');
    const { getUpdatedServiceDefinitions } = await import('../models/seeds/updatedServiceDefinitions.js');
    const servicosAtualizados = getUpdatedServiceDefinitions();
    log(`Obtidos ${servicosAtualizados.length} serviços atualizados`);
    
    // Verificar se existem serviços no banco de dados
    log('Verificando serviços existentes no banco de dados...');
    const servicosExistentes = await prisma.servico.findMany();
    log(`Encontrados ${servicosExistentes.length} serviços existentes no banco de dados`);
    
    // Criar backup dos serviços existentes
    if (servicosExistentes.length > 0) {
      log('Criando backup dos serviços existentes...');
      await criarBackupServicos(servicosExistentes);
    }
    
    // Se não existirem serviços no banco de dados, criar todos
    if (servicosExistentes.length === 0) {
      log('Banco de dados vazio, criando todos os serviços atualizados...');
      for (const servicoAtualizado of servicosAtualizados) {
        log(`Criando serviço "${servicoAtualizado.nome}"...`);
        
        // Sanitizar dados para o formato do banco de dados
        const dadosSanitizados = sanitizeServiceData(servicoAtualizado);
        
        try {
          const novoServico = await prisma.servico.create({
            data: dadosSanitizados
          });
          
          log(`Serviço "${servicoAtualizado.nome}" criado com sucesso (ID: ${novoServico.id})`);
        } catch (error) {
          log(`Erro ao criar serviço "${servicoAtualizado.nome}": ${error.message}`);
        }
      }
    } else {
      // Atualizar serviços existentes
      log('Atualizando serviços existentes...');
      
      // Verificar serviços que não existem mais nas definições atualizadas
      const nomesServicosAtualizados = servicosAtualizados.map(s => s.nome);
      const servicosObsoletos = servicosExistentes.filter(s => !nomesServicosAtualizados.includes(s.nome));
      
      if (servicosObsoletos.length > 0) {
        log(`Encontrados ${servicosObsoletos.length} serviços obsoletos que serão removidos:`);
        for (const servicoObsoleto of servicosObsoletos) {
          log(`- ${servicoObsoleto.nome} (ID: ${servicoObsoleto.id})`);
          
          try {
            await prisma.servico.delete({
              where: { id: servicoObsoleto.id }
            });
            
            log(`Serviço obsoleto "${servicoObsoleto.nome}" removido com sucesso`);
          } catch (error) {
            log(`Erro ao remover serviço obsoleto "${servicoObsoleto.nome}": ${error.message}`);
          }
        }
      } else {
        log('Não foram encontrados serviços obsoletos para remover');
      }
      
      // Atualizar serviços existentes ou criar novos
      for (const servicoAtualizado of servicosAtualizados) {
        // Verificar se o serviço já existe
        const servicoExistente = servicosExistentes.find(s => s.nome === servicoAtualizado.nome);
        
        if (servicoExistente) {
          // Verificar se é necessário atualizar
          const dadosSanitizados = sanitizeServiceData({
            ...servicoAtualizado,
            // Preservar o campo detalhes se já existir no serviço existente
            detalhes: servicoExistente.detalhes || servicoAtualizado.detalhes
          });
          
          // Se forceUpdate for true, atualizar mesmo se os dados forem iguais
          if (forceUpdate) {
            log(`Atualizando serviço "${servicoAtualizado.nome}" (modo forçado)...`);
            
            try {
              const servicoAtualizado = await prisma.servico.update({
                where: { id: servicoExistente.id },
                data: dadosSanitizados
              });
              
              log(`Serviço "${servicoAtualizado.nome}" atualizado com sucesso (ID: ${servicoAtualizado.id})`);
            } catch (error) {
              log(`Erro ao atualizar serviço "${servicoAtualizado.nome}": ${error.message}`);
            }
          } else {
            // Verificar se há diferenças significativas
            const diferencas = compararServicos(servicoExistente, dadosSanitizados);
            
            if (diferencas.length > 0) {
              log(`Atualizando serviço "${servicoAtualizado.nome}" (${diferencas.length} diferenças encontradas)...`);
              log(`Diferenças: ${diferencas.join(', ')}`);
              
              try {
                const servicoAtualizado = await prisma.servico.update({
                  where: { id: servicoExistente.id },
                  data: dadosSanitizados
                });
                
                log(`Serviço "${servicoAtualizado.nome}" atualizado com sucesso (ID: ${servicoAtualizado.id})`);
              } catch (error) {
                log(`Erro ao atualizar serviço "${servicoAtualizado.nome}": ${error.message}`);
              }
            } else {
              log(`Serviço "${servicoAtualizado.nome}" já está atualizado, nenhuma alteração necessária`);
            }
          }
        } else {
          // Criar novo serviço
          log(`Criando novo serviço "${servicoAtualizado.nome}"...`);
          
          // Sanitizar dados para o formato do banco de dados
          const dadosSanitizados = sanitizeServiceData(servicoAtualizado);
          
          try {
            const novoServico = await prisma.servico.create({
              data: dadosSanitizados
            });
            
            log(`Serviço "${servicoAtualizado.nome}" criado com sucesso (ID: ${novoServico.id})`);
          } catch (error) {
            log(`Erro ao criar serviço "${servicoAtualizado.nome}": ${error.message}`);
          }
        }
      }
    }
    
    // Verificar resultado final
    const servicosFinais = await prisma.servico.findMany();
    log(`Total de serviços após atualização: ${servicosFinais.length}`);
    
    log('Atualização de serviços concluída com sucesso');
  } catch (error) {
    log(`Erro durante a atualização de serviços: ${error.message}`);
    console.error('Detalhes do erro:', error);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('Desconectado do banco de dados');
  }
  
  log('=== ATUALIZAÇÃO CONCLUÍDA ===');
}

/**
 * Exportar a função para uso em outros scripts
 */
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
