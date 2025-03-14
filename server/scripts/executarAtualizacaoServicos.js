/**
 * Script para executar a atualização de serviços no banco de dados
 * 
 * Este script importa e executa a função atualizarServicosExistentes
 * do módulo popularServicos.js para garantir que todos os serviços
 * definidos em updatedServiceDefinitions.js sejam corretamente
 * refletidos no banco de dados.
 * 
 * @version 1.5.0 - 2025-03-14 - Implementada solução para sincronizar múltiplos bancos de dados
 */

import { atualizarServicosExistentes } from './popularServicos.js';
import { clearCache } from '../middleware/cache.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Configurar log detalhado
process.env.DEBUG_LEVEL = 'verbose';

// Obter o caminho do arquivo atual e calcular caminhos relativos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Função para log com timestamp
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(formattedMessage);
  
  // Registrar logs em arquivo
  const logDir = path.resolve(rootDir, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.resolve(logDir, 'atualizacao-servicos.log');
  fs.appendFileSync(logFile, formattedMessage + '\n');
}

// Verificar quais bancos de dados existem
const possibleDbPaths = [
  path.resolve(rootDir, 'server', 'database.sqlite'),
  path.resolve(rootDir, 'server', 'prisma', 'dev.db'),
  path.resolve(rootDir, 'server', 'prisma', 'server', 'database.sqlite')
];

// Verificar quais bancos de dados existem
console.log('=== VERIFICAÇÃO DE BANCOS DE DADOS ===');
const existingDbs = possibleDbPaths.filter(dbPath => {
  const exists = fs.existsSync(dbPath);
  console.log(`${dbPath} (${exists ? 'EXISTE' : 'NÃO EXISTE'})`);
  return exists;
});

if (existingDbs.length === 0) {
  console.error('ERRO: Nenhum banco de dados encontrado!');
  process.exit(1);
}

// Função para verificar qual banco de dados a API está usando
async function verificarBancoAPI() {
  log('Verificando qual banco de dados a API está usando...');
  
  // Tentar conectar a cada banco de dados e verificar se tem serviços
  for (const dbPath of existingDbs) {
    try {
      process.env.DATABASE_URL = `file:${dbPath}`;
      console.log(`Testando conexão com: ${dbPath}`);
      
      const prisma = new PrismaClient();
      await prisma.$connect();
      
      // Verificar se existem serviços neste banco
      const countServicos = await prisma.servico.count();
      console.log(`Banco ${dbPath}: ${countServicos} serviços encontrados`);
      
      // Desconectar para liberar recursos
      await prisma.$disconnect();
      
      // Se encontrou serviços, este provavelmente é o banco que a API está usando
      if (countServicos > 0) {
        console.log(`Banco de dados da API identificado: ${dbPath}`);
        return dbPath;
      }
    } catch (error) {
      console.error(`Erro ao conectar ao banco ${dbPath}:`, error.message);
    }
  }
  
  // Se não encontrou nenhum banco com serviços, usar o primeiro da lista
  console.log(`Nenhum banco com serviços encontrado. Usando o primeiro da lista: ${existingDbs[0]}`);
  return existingDbs[0];
}

// Função para limpar o cache da API
async function limparCacheAPI() {
  log('Limpando cache da API...');
  
  try {
    // Limpar cache específico da rota de pricing
    clearCache('/api/pricing');
    
    // Limpar também possíveis variações com parâmetros de consulta
    clearCache('/api/pricing?page=1&limit=10');
    clearCache('/api/pricing?limit=10');
    clearCache('/api/pricing?sortBy=nome');
    
    // Para garantir, limpar todo o cache
    console.log('Limpando cache completo para garantir atualização...');
    clearCache();
    
    // Verificar status do cache após limpeza
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/cache/status`;
      log('Verificando status do cache após limpeza...');
      const response = await axios.get(url, { timeout: 5000 });
      log(`Status do cache: ${JSON.stringify(response.data)}`);
    } catch (error) {
      log(`Erro ao verificar status do cache: ${error.message}`, 'error');
    }
    
    // Aguardar um momento para garantir que o cache seja limpo
    log('Aguardando 2 segundos para garantir que o cache seja limpo...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  } catch (error) {
    log(`Erro geral ao limpar cache: ${error.message}`, 'error');
    return false;
  }
}

// Função para atualizar todos os bancos de dados
async function atualizarTodosBancos() {
  log('=== ATUALIZANDO TODOS OS BANCOS DE DADOS ===');
  
  // Primeiro, identificar o banco principal que a API está usando
  const bancoPrincipal = await verificarBancoAPI();
  
  // Atualizar o banco principal primeiro
  process.env.DATABASE_URL = `file:${bancoPrincipal}`;
  console.log(`Atualizando banco principal: ${bancoPrincipal}`);
  await atualizarServicosExistentes(true);
  
  // Agora atualizar os outros bancos
  for (const dbPath of existingDbs) {
    if (dbPath !== bancoPrincipal) {
      process.env.DATABASE_URL = `file:${dbPath}`;
      console.log(`Atualizando banco secundário: ${dbPath}`);
      await atualizarServicosExistentes(true);
    }
  }
  
  // Voltar para o banco principal para garantir que a API use os dados corretos
  process.env.DATABASE_URL = `file:${bancoPrincipal}`;
  console.log(`Configuração final: DATABASE_URL = ${process.env.DATABASE_URL}`);
  
  // Limpar cache da API após todas as atualizações
  await limparCacheAPI();
}

// Executar a atualização em todos os bancos
console.log('Iniciando processo de atualização sincronizada...');
atualizarTodosBancos()
  .then(() => {
    console.log('Atualização de todos os bancos de dados concluída com sucesso.');
    console.log('=== ATUALIZAÇÃO CONCLUÍDA ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro durante a atualização de serviços:', error);
    process.exit(1);
  });
