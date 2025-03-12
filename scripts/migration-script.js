/**
 * Script de migração de dados de desenvolvimento para produção
 * @version 1.0.0 - 2025-03-12
 * @description Migra serviços de precificação de dev para prod
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dadosDemonstracao } from '../src/components/pricing/dadosDemonstracao.js';

// Obter o diretório atual em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const config = {
  dev: {
    baseUrl: 'http://localhost:3000',
    authToken: '' // Será preenchido via parâmetro de linha de comando
  },
  prod: {
    baseUrl: 'https://lytspot.onrender.com',
    authToken: '' // Será preenchido via parâmetro de linha de comando
  },
  logPath: path.join(__dirname, 'migration-log.txt')
};

// Obter tokens da linha de comando
const args = process.argv.slice(2);
if (args.length >= 1) {
  config.prod.authToken = args[0];
}
if (args.length >= 2) {
  config.dev.authToken = args[1];
}

// Função para log
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(config.logPath, logMessage);
};

// Função principal de migração
async function migrateData() {
  log('Iniciando migração de dados...');
  
  try {
    // 1. Obter dados do ambiente de desenvolvimento
    log('Obtendo dados do ambiente de desenvolvimento...');
    let devData;
    
    try {
      devData = await fetchDevData();
      log(`Obtidos ${devData.length} registros do ambiente de desenvolvimento.`);
    } catch (error) {
      log(`Erro ao obter dados de desenvolvimento: ${error.message}`);
      log('Usando dados de demonstração como alternativa...');
      // Usar dados de demonstração se o servidor de desenvolvimento não estiver disponível
      devData = dadosDemonstracao;
      log(`Carregados ${devData.length} registros dos dados de demonstração.`);
    }
    
    // 2. Salvar backup dos dados
    const backupPath = path.join(__dirname, `backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(devData, null, 2));
    log(`Backup salvo em ${backupPath}`);
    
    // 3. Verificar dados existentes em produção
    log('Verificando dados existentes em produção...');
    const prodData = await fetchProdData();
    log(`Encontrados ${prodData.length} registros no ambiente de produção.`);
    
    // 4. Identificar novos dados para inserção
    const newData = identifyNewData(devData, prodData);
    log(`${newData.length} novos registros identificados para migração.`);
    
    // 5. Migrar dados para produção
    if (newData.length > 0) {
      log('Iniciando migração para produção...');
      const results = await migrateToProduction(newData);
      log(`Migração concluída. ${results.success} registros migrados com sucesso, ${results.failed} falhas.`);
    } else {
      log('Nenhum novo dado para migrar.');
    }
    
    log('Processo de migração finalizado com sucesso.');
  } catch (error) {
    log(`ERRO: ${error.message}`);
    log('Migração interrompida devido a erros.');
  }
}

// Função para obter dados do ambiente de desenvolvimento
async function fetchDevData() {
  const response = await axios.get(`${config.dev.baseUrl}/api/pricing`, {
    headers: config.dev.authToken ? { 'Authorization': `Bearer ${config.dev.authToken}` } : {},
    timeout: 5000 // 5 segundos de timeout
  });
  return response.data;
}

// Função para obter dados do ambiente de produção
async function fetchProdData() {
  const response = await axios.get(`${config.prod.baseUrl}/api/pricing`, {
    headers: config.prod.authToken ? { 'Authorization': `Bearer ${config.prod.authToken}` } : {},
    timeout: 10000 // 10 segundos de timeout
  });
  return response.data;
}

// Função para identificar novos dados
function identifyNewData(devData, prodData) {
  // Se não houver dados em produção, todos os dados de dev são novos
  if (!prodData.length) return devData;
  
  // Identificar dados que não existem em produção
  return devData.filter(devItem => {
    return !prodData.some(prodItem => prodItem.id === devItem.id);
  });
}

// Função para migrar dados para produção
async function migrateToProduction(data) {
  let success = 0;
  let failed = 0;
  
  for (const item of data) {
    try {
      await axios.post(`${config.prod.baseUrl}/api/pricing`, item, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.prod.authToken}`
        }
      });
      success++;
      log(`Migrado com sucesso: ${item.nome} (ID: ${item.id})`);
    } catch (error) {
      failed++;
      log(`Falha ao migrar: ${item.nome} (ID: ${item.id}) - Erro: ${error.message}`);
      
      // Detalhes adicionais do erro para diagnóstico
      if (error.response) {
        log(`Detalhes do erro: Status ${error.response.status}, Mensagem: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  
  return { success, failed };
}

// Executar migração
migrateData();
