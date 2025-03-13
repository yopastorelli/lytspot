/**
 * Script para fazer login como administrador e obter token
 * @version 1.0.0 - 2025-03-12
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual em módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obter credenciais da linha de comando
const args = process.argv.slice(2);
const email = args[0] || 'admin@lytspot.com.br';
const password = args[1] || 'Black&Red2025';

// Configuração da API
const apiUrl = 'https://lytspot.onrender.com/api/auth/login';

async function loginAdmin() {
  try {
    console.log('Tentando fazer login como administrador...');
    console.log(`Email: ${email}`);
    
    // Adicionar um log detalhado para depuração
    console.log('Enviando requisição para:', apiUrl);
    console.log('Dados enviados:', { email, password });
    
    const response = await axios.post(apiUrl, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\nResposta completa:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('\nLogin bem-sucedido!');
      console.log('\nToken JWT:');
      console.log('--------------------------------------------------');
      console.log(token);
      console.log('--------------------------------------------------');
      
      // Salvar o token em um arquivo para uso posterior
      const tokenPath = path.join(__dirname, 'auth-token.txt');
      fs.writeFileSync(tokenPath, token);
      console.log(`\nToken salvo em: ${tokenPath}`);
      
      // Instruções para usar o token
      console.log('\nPara usar o token na migração, execute:');
      console.log(`node scripts/migration-script.js "${token}"`);
      
      return token;
    } else {
      console.error('Resposta recebida, mas nenhum token encontrado:', response.data);
    }
  } catch (error) {
    console.error('\nErro ao fazer login:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Resposta:', error.response.data);
      
      // Informações adicionais para depuração
      console.error('\nDetalhes adicionais:');
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('Sem resposta recebida do servidor. Verifique sua conexão.');
      console.error('Detalhes da requisição:', error.request);
    } else {
      console.error('Erro:', error.message);
    }
    
    console.error('\nStack trace:', error.stack);
  }
}

loginAdmin();
