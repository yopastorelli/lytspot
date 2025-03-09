import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar se estamos no ambiente Render
const isRender = process.env.RENDER === 'true';

// Configurar o caminho do banco de dados para o Render
if (isRender) {
  console.log('Configurando Prisma para ambiente Render...');
  
  // No Render, usamos um caminho absoluto para o banco de dados
  // O diretório /opt/render/project/src/ é o diretório raiz do projeto no Render
  const dbPath = path.join('/opt/render/project/src', 'database.sqlite');
  
  // Atualizar a variável de ambiente DATABASE_URL
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log(`DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);
  
  // Verificar se o diretório existe
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log(`Criando diretório para o banco de dados: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Executar o comando prisma generate
  try {
    console.log('Executando prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('prisma generate executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar prisma generate:', error);
    process.exit(1);
  }
  
  // Executar o comando prisma db push
  try {
    console.log('Executando prisma db push...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('prisma db push executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar prisma db push:', error);
    process.exit(1);
  }
}

console.log('Configuração do Prisma concluída.');
