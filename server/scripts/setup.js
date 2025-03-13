import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Script para configurar o ambiente de desenvolvimento
 * - Verifica e cria o arquivo .env se não existir
 * - Executa as migrações do Prisma
 * - Inicializa o banco de dados com dados iniciais
 */
async function setup() {
  console.log('🚀 Iniciando configuração do ambiente...');

  // Verificar se o arquivo .env existe
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('📄 Criando arquivo .env a partir do .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado com sucesso!');
  }

  try {
    // Executar as migrações do Prisma
    console.log('🔄 Executando migrações do Prisma...');
    execSync('npx prisma migrate dev --name init', { 
      cwd: rootDir, 
      stdio: 'inherit'
    });
    console.log('✅ Migrações executadas com sucesso!');

    // Gerar o cliente Prisma
    console.log('🔄 Gerando cliente Prisma...');
    execSync('npx prisma generate', { 
      cwd: rootDir, 
      stdio: 'inherit'
    });
    console.log('✅ Cliente Prisma gerado com sucesso!');

    // Inicializar o banco de dados com dados iniciais
    console.log('🔄 Inicializando banco de dados com dados iniciais...');
    execSync('node scripts/init-db.js', { 
      cwd: rootDir, 
      stdio: 'inherit'
    });
    console.log('✅ Banco de dados inicializado com sucesso!');

    console.log('🎉 Configuração do ambiente concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Inicie o servidor com: npm run server');
    console.log('2. Em outro terminal, inicie o frontend com: npm run dev');
    console.log('3. Acesse o simulador de preços em: http://localhost:4321/precos');
    console.log('4. Acesse o painel administrativo em: http://localhost:4321/admin');
    console.log('\n🔐 Credenciais do painel administrativo:');
    console.log('Email: admin@lytspot.com.br.br');
    console.log('Senha: Black&Red2025');
    console.log('\n⚠️ IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

setup();
