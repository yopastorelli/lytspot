/**
 * Script para obter token de autenticação para migração
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
const email = args[0] || '';
const password = args[1] || '';

if (!email || !password) {
  console.error('Uso: node get-auth-token.js <email> <senha>');
  process.exit(1);
}

// Configuração da API
const apiUrl = 'https://lytspot.onrender.com/api/auth/login';

async function getAuthToken() {
  try {
    console.log(`Tentando autenticar com o email: ${email}`);
    
    const response = await axios.post(apiUrl, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('\nAutenticação bem-sucedida!');
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
    console.error('\nErro ao obter token de autenticação:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Resposta:', error.response.data);
    } else if (error.request) {
      console.error('Sem resposta recebida do servidor. Verifique sua conexão.');
    } else {
      console.error('Erro:', error.message);
    }
  }
}

getAuthToken();
