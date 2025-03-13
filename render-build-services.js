/**
 * Script de build para o Render
 * @version 1.0.0 - 2025-03-13
 * @description Executado durante o processo de build no Render para sincronizar dados de serviços
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();

// Definir variável de ambiente para indicar que estamos no Render
process.env.RENDER = 'true';

console.log('🚀 Iniciando processo de build de serviços para o Render...');

// Executar o script de sincronização de dados
const syncProcess = spawn('node', ['server/scripts/atualizarDadosDemonstracao.js', '--build'], {
  stdio: 'inherit',
  env: { ...process.env }
});

syncProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Sincronização de dados de serviços concluída com sucesso!');
    console.log('✨ Processo de build de serviços finalizado.');
  } else {
    console.error(`❌ Erro durante a sincronização de dados (código ${code})`);
    console.log('⚠️ Continuando o processo de build...');
  }
});

// Capturar sinais para encerramento limpo
process.on('SIGINT', () => {
  console.log('⚠️ Processo interrompido pelo usuário.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('⚠️ Processo terminado pelo sistema.');
  process.exit(0);
});
