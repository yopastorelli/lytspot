/**
 * Script para testar a API e verificar se os problemas de CORS foram resolvidos
 * @version 1.0.0 - 2025-03-12
 * @description Realiza testes de conectividade com a API para verificar se os problemas de CORS foram resolvidos
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

/**
 * Testa a conectividade com a API
 * @param {string} apiUrl URL base da API
 * @param {string} origin Origem da requisição (simulando o frontend)
 * @returns {Promise<void>}
 */
async function testarConectividade(apiUrl, origin) {
  try {
    console.log(`\n🔍 Testando conectividade com ${apiUrl} a partir de ${origin}...`);
    
    // Configurar o axios para incluir a origem
    const config = {
      headers: {
        'Origin': origin
      }
    };
    
    // Teste 1: Verificar se a API está online (endpoint de saúde)
    console.log('Teste 1: Verificando se a API está online...');
    try {
      const healthResponse = await axios.get(`${apiUrl}/health`, config);
      console.log('✅ API está online:', healthResponse.status, healthResponse.statusText);
    } catch (error) {
      if (error.response) {
        console.log(`⚠️ API respondeu com status ${error.response.status}, mas está online`);
      } else {
        console.error('❌ API não está respondendo:', error.message);
        // Continuar com os testes mesmo se este falhar
      }
    }
    
    // Teste 2: Tentar obter a lista de serviços (endpoint público)
    console.log('\nTeste 2: Obtendo lista de serviços (endpoint público)...');
    try {
      const servicosResponse = await axios.get(`${apiUrl}/pricing`, config);
      console.log('✅ Lista de serviços obtida com sucesso!');
      console.log(`📊 Total de serviços: ${servicosResponse.data.length}`);
      
      // Mostrar os primeiros 3 serviços como exemplo
      if (servicosResponse.data.length > 0) {
        console.log('\nExemplos de serviços:');
        servicosResponse.data.slice(0, 3).forEach((servico, index) => {
          console.log(`${index + 1}. ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
        });
      }
    } catch (error) {
      console.error('❌ Erro ao obter lista de serviços:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.statusText);
        
        // Verificar se é um erro de CORS
        if (error.message.includes('CORS') || error.message.includes('cors')) {
          console.error('⚠️ POSSÍVEL ERRO DE CORS DETECTADO!');
          console.error('Verifique a configuração de CORS no servidor.');
        }
      }
    }
    
    // Teste 3: Tentar fazer login (autenticação)
    console.log('\nTeste 3: Testando autenticação...');
    try {
      const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
        email: 'admin@lytspot.com.br',
        password: 'admin123'
      }, config);
      
      console.log('✅ Login realizado com sucesso!');
      const token = loginResponse.data.token;
      console.log('🔑 Token obtido:', token.substring(0, 15) + '...');
      
      // Teste 4: Acessar endpoint protegido com o token
      console.log('\nTeste 4: Acessando endpoint protegido...');
      try {
        const protectedResponse = await axios.get(`${apiUrl}/auth/protected`, {
          headers: {
            'Origin': origin,
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Acesso ao endpoint protegido bem-sucedido!');
        console.log('📄 Resposta:', protectedResponse.data);
        
      } catch (error) {
        console.error('❌ Erro ao acessar endpoint protegido:', error.message);
        if (error.response) {
          console.error('Detalhes do erro:', error.response.status, error.response.statusText);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.status, error.response.statusText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral durante os testes:', error.message);
  }
}

/**
 * Função principal que executa os testes de API
 */
async function main() {
  try {
    console.log('🚀 Iniciando testes de API e CORS...');
    
    // URLs para teste
    const apiUrls = [
      process.env.API_URL || 'http://localhost:3000/api',
      'https://lytspot.onrender.com/api'
    ];
    
    // Origens para simular diferentes frontends
    const origins = [
      'http://localhost:4321',
      'https://lytspot.com.br',
      'https://lytspot.netlify.app'
    ];
    
    // Executar testes para cada combinação de API e origem
    for (const apiUrl of apiUrls) {
      for (const origin of origins) {
        await testarConectividade(apiUrl, origin);
        console.log('\n' + '-'.repeat(50) + '\n');
      }
    }
    
    console.log('✨ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar a função principal
main();
