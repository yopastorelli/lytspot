/**
 * Script para verificar e atualizar as configurações do servidor em produção
 * @version 1.0.0 - 2025-03-12
 * @description Verifica as configurações do servidor em produção e garante que as alterações de CORS sejam aplicadas corretamente
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

/**
 * Verifica a configuração de CORS do servidor
 * @param {string} apiUrl URL base da API
 * @param {Array<string>} origins Lista de origens para testar
 * @returns {Promise<Object>} Resultado dos testes
 */
async function verificarCORS(apiUrl, origins) {
  const resultados = {
    sucessos: 0,
    falhas: 0,
    detalhes: []
  };

  console.log(chalk.blue.bold('\n🔍 Verificando configuração de CORS...\n'));
  
  for (const origin of origins) {
    try {
      console.log(chalk.yellow(`Testando origem: ${origin}`));
      
      // Configurar o axios para incluir a origem
      const config = {
        headers: {
          'Origin': origin
        }
      };
      
      // Testar o endpoint de health check
      const response = await axios.get(`${apiUrl}/health`, config);
      
      // Verificar se a resposta contém os cabeçalhos CORS corretos
      const headers = response.headers;
      const allowOrigin = headers['access-control-allow-origin'];
      const allowMethods = headers['access-control-allow-methods'];
      const allowHeaders = headers['access-control-allow-headers'];
      const allowCredentials = headers['access-control-allow-credentials'];
      
      // Verificar se os cabeçalhos CORS estão corretos
      const corsOk = 
        (allowOrigin === '*' || allowOrigin === origin) && 
        allowMethods && 
        allowHeaders && 
        allowCredentials;
      
      if (corsOk) {
        console.log(chalk.green(`✅ CORS configurado corretamente para ${origin}`));
        resultados.sucessos++;
      } else {
        console.log(chalk.red(`❌ CORS não configurado corretamente para ${origin}`));
        console.log('Cabeçalhos recebidos:');
        console.log(`  Access-Control-Allow-Origin: ${allowOrigin || 'não definido'}`);
        console.log(`  Access-Control-Allow-Methods: ${allowMethods || 'não definido'}`);
        console.log(`  Access-Control-Allow-Headers: ${allowHeaders || 'não definido'}`);
        console.log(`  Access-Control-Allow-Credentials: ${allowCredentials || 'não definido'}`);
        resultados.falhas++;
      }
      
      // Adicionar detalhes do resultado
      resultados.detalhes.push({
        origin,
        sucesso: corsOk,
        cabeçalhos: {
          allowOrigin,
          allowMethods,
          allowHeaders,
          allowCredentials
        }
      });
      
    } catch (error) {
      console.log(chalk.red(`❌ Erro ao testar origem ${origin}:`));
      
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Mensagem: ${error.response.statusText}`);
        
        // Verificar se é um erro de CORS
        if (error.message.includes('CORS') || error.message.includes('cors')) {
          console.log(chalk.red.bold('  ⚠️ ERRO DE CORS DETECTADO!'));
        }
      } else {
        console.log(`  Erro: ${error.message}`);
      }
      
      resultados.falhas++;
      resultados.detalhes.push({
        origin,
        sucesso: false,
        erro: error.message
      });
    }
    
    console.log(''); // Linha em branco para separar os resultados
  }
  
  return resultados;
}

/**
 * Verifica a API em produção
 * @param {string} apiUrl URL base da API
 * @returns {Promise<Object>} Resultado dos testes
 */
async function verificarAPI(apiUrl) {
  console.log(chalk.blue.bold('\n🔍 Verificando API em produção...\n'));
  
  try {
    // Testar o endpoint de health check
    console.log('Testando endpoint de health check...');
    const healthResponse = await axios.get(`${apiUrl}/health`);
    console.log(chalk.green('✅ Endpoint de health check funcionando!'));
    console.log('Resposta:', healthResponse.data);
    
    // Testar o endpoint de serviços
    console.log('\nTestando endpoint de serviços...');
    const servicosResponse = await axios.get(`${apiUrl}/pricing`);
    console.log(chalk.green('✅ Endpoint de serviços funcionando!'));
    console.log(`Total de serviços: ${servicosResponse.data.length}`);
    
    return {
      sucesso: true,
      health: healthResponse.data,
      servicos: servicosResponse.data.length
    };
  } catch (error) {
    console.log(chalk.red('❌ Erro ao verificar API:'));
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Mensagem: ${error.response.statusText}`);
    } else {
      console.log(`Erro: ${error.message}`);
    }
    
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

/**
 * Função principal que executa a verificação
 */
async function main() {
  try {
    console.log(chalk.blue.bold('🚀 Iniciando verificação de configuração em produção...\n'));
    
    // URLs para teste
    const apiUrl = process.env.PRODUCTION_API_URL || 'https://lytspot.onrender.com/api';
    console.log(chalk.yellow(`API URL: ${apiUrl}`));
    
    // Origens para testar
    const origins = [
      'http://localhost:4321',
      'https://lytspot.com.br',
      'https://www.lytspot.com.br',
      'https://lytspot.netlify.app'
    ];
    
    // Verificar API
    const apiResultado = await verificarAPI(apiUrl);
    
    // Verificar CORS
    const corsResultado = await verificarCORS(apiUrl, origins);
    
    // Exibir resumo
    console.log(chalk.blue.bold('\n📊 Resumo da verificação:\n'));
    console.log(`API: ${apiResultado.sucesso ? chalk.green('✅ Funcionando') : chalk.red('❌ Com problemas')}`);
    console.log(`CORS: ${corsResultado.sucessos} sucessos, ${corsResultado.falhas} falhas`);
    
    // Exibir recomendações
    console.log(chalk.blue.bold('\n📋 Recomendações:\n'));
    
    if (corsResultado.falhas > 0) {
      console.log(chalk.yellow('1. Verifique a configuração de CORS no servidor:'));
      console.log('   - Certifique-se de que todas as origens necessárias estão na lista de origens permitidas');
      console.log('   - Verifique se os cabeçalhos CORS estão sendo definidos corretamente');
      console.log('   - Reinicie o servidor após fazer alterações na configuração');
    } else {
      console.log(chalk.green('✅ Configuração de CORS está correta!'));
    }
    
    if (!apiResultado.sucesso) {
      console.log(chalk.yellow('\n2. Verifique se o servidor está online e funcionando corretamente:'));
      console.log('   - Verifique os logs do servidor para identificar possíveis erros');
      console.log('   - Reinicie o servidor se necessário');
    } else {
      console.log(chalk.green('\n✅ API está funcionando corretamente!'));
    }
    
    console.log(chalk.green('\n✨ Verificação concluída!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erro durante a verificação:'), error.message);
    process.exit(1);
  }
}

// Executar a função principal
main();
