// Script para configurar o arquivo .env
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Valores padrão que já conhecemos
const defaultEnv = {
  PORT: '3000',
  BASE_URL: '/',
  JWT_SECRET: 'lytspot_jwt_secret_key',
  JWT_EXPIRE: '1d',
  DATABASE_URL: 'file:../database.sqlite',
  FRONTEND_URL: 'https://www.lytspot.com.br'
};

// Informações que precisamos coletar
const requiredInfo = [
  { key: 'REFRESH_TOKEN', question: 'Qual é o refresh token do Gmail para envio de emails? ' },
  { key: 'CLIENT_ID', question: 'Qual é o client ID do OAuth do Google? ' },
  { key: 'CLIENT_SECRET', question: 'Qual é o client secret do OAuth do Google? ' },
  { key: 'ACCOUNT_ID', question: 'Qual é o email da conta que enviará os emails? ' },
  { key: 'SENDER_EMAIL', question: 'Qual é o email do remetente? (geralmente o mesmo da conta) ' },
  { key: 'RECIPIENT_EMAIL', question: 'Qual é o email para receber os contatos do site? ' }
];

// Função para perguntar e coletar as informações
async function collectInfo() {
  const envData = { ...defaultEnv };
  
  for (const item of requiredInfo) {
    const answer = await new Promise(resolve => {
      rl.question(`${item.question}`, resolve);
    });
    
    envData[item.key] = answer || '';
  }
  
  return envData;
}

// Função para gerar o arquivo .env
function generateEnvFile(data) {
  let envContent = '';
  
  // Adicionar comentários e agrupar variáveis
  envContent += '# Configurações do Servidor\n';
  envContent += `PORT=${data.PORT}\n`;
  envContent += `BASE_URL=${data.BASE_URL}\n\n`;
  
  envContent += '# Configurações JWT para Autenticação\n';
  envContent += `JWT_SECRET=${data.JWT_SECRET}\n`;
  envContent += `JWT_EXPIRE=${data.JWT_EXPIRE}\n\n`;
  
  envContent += '# Configurações de Email\n';
  envContent += `REFRESH_TOKEN=${data.REFRESH_TOKEN}\n`;
  envContent += `CLIENT_ID=${data.CLIENT_ID}\n`;
  envContent += `CLIENT_SECRET=${data.CLIENT_SECRET}\n`;
  envContent += `ACCOUNT_ID=${data.ACCOUNT_ID}\n`;
  envContent += `SENDER_EMAIL=${data.SENDER_EMAIL}\n`;
  envContent += `RECIPIENT_EMAIL=${data.RECIPIENT_EMAIL}\n\n`;
  
  envContent += '# URL do Frontend (para CORS em produção)\n';
  envContent += `FRONTEND_URL=${data.FRONTEND_URL}\n\n`;
  
  envContent += '# Configuração do Banco de Dados\n';
  envContent += `DATABASE_URL="${data.DATABASE_URL}"\n`;
  
  // Escrever no arquivo .env
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('\nArquivo .env criado com sucesso!');
}

// Função principal
async function main() {
  console.log('Configuração do arquivo .env para o Lytspot');
  console.log('==========================================');
  console.log('Vamos configurar as variáveis de ambiente necessárias para o funcionamento do site.');
  console.log('Algumas variáveis já estão pré-configuradas, mas precisamos de algumas informações adicionais.\n');
  
  const envData = await collectInfo();
  generateEnvFile(envData);
  
  console.log('\nAgora você pode fazer o deploy no Render.com com estas configurações.');
  console.log('Lembre-se de adicionar todas estas variáveis de ambiente no painel do Render também.');
  
  rl.close();
}

main();
