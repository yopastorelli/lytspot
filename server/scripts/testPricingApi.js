/**
 * Script para testar a API de preços
 * @description Verifica se a API de preços está funcionando corretamente com o mecanismo de fallback
 * @version 1.1.0 - 2025-03-12 - Atualizado para compatibilidade com node-fetch v2
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// Obter a URL base da API - usando 127.0.0.1 em vez de localhost para evitar problemas de IPv6
const BASE_URL = 'http://127.0.0.1:3000';
const API_URL = `${BASE_URL}/api/pricing`;

/**
 * Testa a API de preços
 */
async function testPricingApi() {
  console.log('🚀 Iniciando teste da API de preços...');
  console.log(`📌 URL da API: ${API_URL}`);
  
  try {
    // Testar endpoint de listagem de serviços
    console.log('\n🔍 Testando endpoint GET /api/pricing...');
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Resposta inválida: esperava um array de serviços');
    }
    
    console.log(`✅ Sucesso! Recebidos ${data.length} serviços.`);
    console.log('\n📊 Amostra de dados:');
    
    // Mostrar os primeiros 2 serviços como amostra
    data.slice(0, 2).forEach((service, index) => {
      console.log(`\n🔹 Serviço ${index + 1}:`);
      console.log(`   Nome: ${service.nome || 'N/A'}`);
      console.log(`   Preço base: R$ ${service.preco_base ? service.preco_base.toFixed(2) : 'N/A'}`);
      console.log(`   Descrição: ${service.descricao ? service.descricao.substring(0, 100) + '...' : 'N/A'}`);
    });
    
    // Verificar se os dados são de demonstração ou do banco de dados
    const isDemoData = data.some(service => service.isDemoData === true);
    
    console.log(`\n🔍 Origem dos dados: ${isDemoData ? '📚 Dados de demonstração (fallback)' : '💾 Banco de dados'}`);
    
    if (isDemoData) {
      console.log('ℹ️ Os dados de demonstração estão sendo usados como fallback.');
      console.log('ℹ️ Isso indica que o banco de dados não está acessível ou ocorreu um erro na consulta.');
    } else {
      console.log('ℹ️ Os dados estão sendo carregados corretamente do banco de dados.');
    }
    
    // Salvar resultado em um arquivo de log
    const logContent = `
=== Teste da API de Preços (${new Date().toISOString()}) ===
URL: ${API_URL}
Status: ${response.status} ${response.statusText}
Serviços recebidos: ${data.length}
Origem dos dados: ${isDemoData ? 'Dados de demonstração (fallback)' : 'Banco de dados'}
Amostra: ${JSON.stringify(data.slice(0, 1), null, 2)}
    `;
    
    const logDir = path.join(rootDir, 'server', 'logs');
    
    // Criar diretório de logs se não existir
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(logDir, 'api-test.log'), logContent, 'utf8');
    
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('📝 Log salvo em server/logs/api-test.log');
    
    return true;
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️ Não foi possível conectar ao servidor. Verifique se o servidor está em execução.');
      console.log('\n💡 Dica: Execute o servidor com o comando:');
      console.log('   node server/server.js');
    }
    
    return false;
  }
}

// Executar a função principal se este arquivo for executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  testPricingApi()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal durante execução do script:', error);
      process.exit(1);
    });
}
