/**
 * Script para gerenciamento de serviços
 * @version 1.0.0 - 2025-03-13
 * @description Interface de linha de comando para gerenciar serviços do Lytspot
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import readline from 'readline';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface para leitura de entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
const pergunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
};

// Função para executar um comando
const executarComando = (comando) => {
  return new Promise((resolve, reject) => {
    exec(comando, { cwd: __dirname }, (erro, stdout, stderr) => {
      if (erro) {
        reject(erro);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
};

/**
 * Menu principal
 */
async function menuPrincipal() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       LYTSPOT - GERENCIADOR DE SERVIÇOS   ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log('📋 Escolha uma opção:');
  console.log('');
  console.log('1. Listar todos os serviços');
  console.log('2. Atualizar serviços em massa');
  console.log('3. Sincronizar dados de demonstração');
  console.log('4. Executar processo completo (atualização + sincronização)');
  console.log('5. Sair');
  console.log('');
  
  const opcao = await pergunta('👉 Opção: ');
  
  switch (opcao.trim()) {
    case '1':
      await listarServicos();
      break;
    case '2':
      await executarAtualizacaoEmMassa();
      break;
    case '3':
      await executarSincronizacaoDados();
      break;
    case '4':
      await executarProcessoCompleto();
      break;
    case '5':
      console.log('👋 Até logo!');
      process.exit(0);
      break;
    default:
      console.log('❌ Opção inválida. Pressione Enter para continuar...');
      await pergunta('');
      await menuPrincipal();
  }
}

/**
 * Listar todos os serviços
 */
async function listarServicos() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║              LISTA DE SERVIÇOS            ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  
  try {
    // Verificar conexão com o banco de dados
    try {
      const totalServicos = await prisma.servico.count();
      console.log(`✅ Conexão com banco de dados estabelecida. Total de serviços: ${totalServicos}`);
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      await voltarAoMenu();
      return;
    }
    
    // Listar serviços disponíveis
    const servicos = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    if (servicos.length === 0) {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
      await voltarAoMenu();
      return;
    }
    
    console.log('\n📋 Serviços disponíveis:');
    console.log('╔════╦═══════════════════════════════════╦════════════╦═══════════════════════════════════╗');
    console.log('║ ID ║ Nome                              ║ Preço Base ║ Descrição                         ║');
    console.log('╠════╬═══════════════════════════════════╬════════════╬═══════════════════════════════════╣');
    
    servicos.forEach((servico, index) => {
      const id = servico.id.toString().padEnd(4);
      const nome = servico.nome.padEnd(35).substring(0, 35);
      const preco = `R$ ${servico.preco_base.toFixed(2)}`.padEnd(10);
      const descricao = servico.descricao.substring(0, 35).padEnd(35);
      
      console.log(`║ ${id}║ ${nome}║ ${preco}║ ${descricao}║`);
    });
    
    console.log('╚════╩═══════════════════════════════════╩════════════╩═══════════════════════════════════╝');
    
    await voltarAoMenu();
  } catch (error) {
    console.error('❌ Erro ao listar serviços:', error.message);
    await voltarAoMenu();
  }
}

/**
 * Executar atualização em massa
 */
async function executarAtualizacaoEmMassa() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║         ATUALIZAÇÃO EM MASSA              ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  
  try {
    console.log('🔄 Executando script de atualização em massa...\n');
    
    const scriptPath = path.resolve(__dirname, 'atualizarServicosEmMassa.js');
    
    try {
      const { stdout, stderr } = await executarComando(`node ${scriptPath}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('❌ Erro ao executar script:', error.message);
    }
    
    await voltarAoMenu();
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    await voltarAoMenu();
  }
}

/**
 * Executar sincronização de dados
 */
async function executarSincronizacaoDados() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       SINCRONIZAÇÃO DE DADOS              ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  
  try {
    console.log('🔄 Executando script de sincronização de dados...\n');
    
    const scriptPath = path.resolve(__dirname, 'atualizarDadosDemonstracao.js');
    
    try {
      const { stdout, stderr } = await executarComando(`node ${scriptPath}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('❌ Erro ao executar script:', error.message);
    }
    
    await voltarAoMenu();
  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    await voltarAoMenu();
  }
}

/**
 * Executar processo completo
 */
async function executarProcessoCompleto() {
  console.clear();
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║           PROCESSO COMPLETO               ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  
  try {
    // Primeiro executar atualização em massa
    console.log('🔄 Passo 1: Executando atualização em massa...\n');
    
    const scriptAtualizacao = path.resolve(__dirname, 'atualizarServicosEmMassa.js');
    
    try {
      const { stdout, stderr } = await executarComando(`node ${scriptAtualizacao}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('❌ Erro ao executar script de atualização:', error.message);
      await voltarAoMenu();
      return;
    }
    
    console.log('\n✅ Atualização em massa concluída!\n');
    
    // Depois executar sincronização de dados
    console.log('🔄 Passo 2: Executando sincronização de dados...\n');
    
    const scriptSincronizacao = path.resolve(__dirname, 'atualizarDadosDemonstracao.js');
    
    try {
      const { stdout, stderr } = await executarComando(`node ${scriptSincronizacao}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('❌ Erro ao executar script de sincronização:', error.message);
      await voltarAoMenu();
      return;
    }
    
    console.log('\n✅ Sincronização de dados concluída!\n');
    console.log('✨ Processo completo finalizado com sucesso!');
    
    await voltarAoMenu();
  } catch (error) {
    console.error('❌ Erro durante a execução do processo completo:', error.message);
    await voltarAoMenu();
  }
}

/**
 * Voltar ao menu principal
 */
async function voltarAoMenu() {
  console.log('\n');
  await pergunta('Pressione Enter para voltar ao menu principal...');
  await menuPrincipal();
}

/**
 * Função principal
 */
async function main() {
  try {
    await menuPrincipal();
  } catch (error) {
    console.error('❌ Erro fatal:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Executar a função principal
main();
