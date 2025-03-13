/**
 * Script para criar um usuário administrador no ambiente de produção
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
const nome = args[2] || 'Administrador';

// Configuração da API
const apiUrl = 'https://lytspot.onrender.com/api/auth/register';

async function createAdminUser() {
  try {
    console.log('Criando usuário administrador no ambiente de produção...');
    console.log(`Email: ${email}`);
    console.log(`Nome: ${nome}`);
    
    const response = await axios.post(apiUrl, {
      email,
      password,
      nome
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\nUsuário criado com sucesso!');
    console.log('Resposta:', response.data);
    
    // Agora vamos fazer login para obter o token
    console.log('\nRealizando login para obter token...');
    
    const loginResponse = await axios.post('https://lytspot.onrender.com/api/auth/login', {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      const token = loginResponse.data.token;
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
      console.error('Resposta de login recebida, mas nenhum token encontrado:', loginResponse.data);
    }
  } catch (error) {
    console.error('\nErro ao criar usuário administrador:');
    
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

createAdminUser();
