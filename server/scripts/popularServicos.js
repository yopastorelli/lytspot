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
 * @version 1.3.1 - 2025-03-14 - Corrigido tratamento do campo detalhes para compatibilidade com Prisma
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
  
  // Garantir que o campo detalhes seja sempre um objeto
  let detalhesObj = {};
  
  // Se detalhes já existir como objeto, usá-lo
  if (data.detalhes && typeof data.detalhes === 'object') {
    detalhesObj = { ...data.detalhes };
  } 
  // Se detalhes for uma string, tentar fazer parse
  else if (data.detalhes && typeof data.detalhes === 'string') {
    try {
      detalhesObj = JSON.parse(data.detalhes);
    } catch (error) {
      console.error(`Erro ao fazer parse do campo detalhes: ${error.message}`);
      detalhesObj = {};
    }
  }
  
  // Garantir que os campos de duração estejam presentes no objeto detalhes
  detalhesObj.captura = detalhesObj.captura || data.duracao_media_captura || 'Sob consulta';
  detalhesObj.tratamento = detalhesObj.tratamento || data.duracao_media_tratamento || 'Sob consulta';
  
  // Garantir que os campos de entregáveis e adicionais estejam presentes no objeto detalhes
  detalhesObj.entregaveis = detalhesObj.entregaveis || data.entregaveis || 'Sob consulta';
  detalhesObj.adicionais = detalhesObj.adicionais || data.possiveis_adicionais || '';
  detalhesObj.deslocamento = detalhesObj.deslocamento || data.valor_deslocamento || '';
  
  // Atualizar os campos diretos também para compatibilidade
  data.duracao_media_captura = detalhesObj.captura;
  data.duracao_media_tratamento = detalhesObj.tratamento;
  data.entregaveis = detalhesObj.entregaveis;
  data.possiveis_adicionais = detalhesObj.adicionais;
  data.valor_deslocamento = detalhesObj.deslocamento;
  
  // Converter o objeto detalhes para string JSON para o Prisma
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
 * @version 1.4.0 - 2025-03-14 - Adicionados logs detalhados para diagnóstico
 */
async function atualizarServicosExistentes(forceUpdate = true) {
  log('=== ATUALIZANDO SERVIÇOS EXISTENTES ===');
  log(`Data e hora: ${new Date().toISOString()}`);
  log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
  log(`Render: ${process.env.RENDER ? 'Sim' : 'Não'}`);
  log(`Modo: ${forceUpdate ? 'Forçado' : 'Normal'}`);
  log(`Nível de debug: ${process.env.DEBUG_LEVEL || 'padrão'}`);
  
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
    
    // Listar nomes dos serviços para verificação
    if (process.env.DEBUG_LEVEL === 'verbose') {
      log('Lista de serviços a serem criados:');
      servicosAtualizados.forEach((servico, index) => {
        log(`${index + 1}. ${servico.nome}`);
      });
    }
    
    // Verificar se existem serviços no banco de dados
    log('Verificando serviços existentes no banco de dados...');
    const servicosExistentes = await prisma.servico.findMany();
    log(`Encontrados ${servicosExistentes.length} serviços existentes no banco de dados`);
    
    // Criar backup dos serviços existentes
    if (servicosExistentes.length > 0) {
      log('Criando backup dos serviços existentes...');
      await criarBackupServicos(servicosExistentes);
    }
    
    // Estratégia de limpar e recriar: remover todos os serviços existentes
    if (servicosExistentes.length > 0) {
      log('Removendo todos os serviços existentes para garantir consistência...');
      try {
        await prisma.servico.deleteMany({});
        log('Todos os serviços existentes foram removidos com sucesso');
      } catch (error) {
        log(`Erro ao remover serviços existentes: ${error.message}`, 'error');
        throw error; // Propagar erro para interromper a execução
      }
    }
    
    // Criar todos os serviços a partir das definições atualizadas
    log('Criando todos os serviços a partir das definições atualizadas...');
    const servicosCriados = [];
    
    for (const servicoAtualizado of servicosAtualizados) {
      log(`Criando serviço "${servicoAtualizado.nome}"...`);
      
      // Sanitizar dados para o formato do banco de dados
      const dadosSanitizados = sanitizeServiceData(servicoAtualizado);
      
      // Log detalhado dos dados sanitizados
      if (process.env.DEBUG_LEVEL === 'verbose') {
        log(`Dados sanitizados para "${servicoAtualizado.nome}":`);
        log(JSON.stringify(dadosSanitizados, null, 2));
      }
      
      try {
        const novoServico = await prisma.servico.create({
          data: dadosSanitizados
        });
        
        servicosCriados.push(novoServico);
        log(`Serviço "${servicoAtualizado.nome}" criado com sucesso (ID: ${novoServico.id})`);
      } catch (error) {
        log(`Erro ao criar serviço "${servicoAtualizado.nome}": ${error.message}`, 'error');
        log(`Stack trace: ${error.stack}`, 'error');
        
        // Verificar se o erro está relacionado a um campo específico
        if (error.meta && error.meta.field_name) {
          log(`Campo com problema: ${error.meta.field_name}`, 'error');
        }
        
        // Não interromper a execução, tentar criar os próximos serviços
      }
    }
    
    // Verificar resultado final
    const servicosFinais = await prisma.servico.findMany();
    log(`Total de serviços após atualização: ${servicosFinais.length}`);
    
    if (servicosFinais.length !== servicosAtualizados.length) {
      log(`AVISO: Nem todos os serviços foram criados. Esperado: ${servicosAtualizados.length}, Atual: ${servicosFinais.length}`, 'warn');
      
      // Listar serviços que foram criados com sucesso
      log('Serviços criados com sucesso:');
      servicosFinais.forEach((servico, index) => {
        log(`${index + 1}. ${servico.nome}`);
      });
      
      // Identificar serviços que não foram criados
      const servicosCriadosNomes = servicosFinais.map(s => s.nome);
      const servicosNaoCriados = servicosAtualizados.filter(s => !servicosCriadosNomes.includes(s.nome));
      
      log('Serviços que NÃO foram criados:');
      servicosNaoCriados.forEach((servico, index) => {
        log(`${index + 1}. ${servico.nome}`, 'warn');
      });
    } else {
      log('Todos os serviços foram criados com sucesso!');
    }
    
    log('Atualização de serviços concluída com sucesso');
  } catch (error) {
    log(`Erro durante a atualização de serviços: ${error.message}`, 'error');
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
