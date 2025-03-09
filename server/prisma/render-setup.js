import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o schema do Prisma
const schemaPath = path.join(__dirname, 'schema.prisma');

// Verificar se o schema existe
if (!fs.existsSync(schemaPath)) {
  console.error(`ERRO: Schema do Prisma não encontrado em: ${schemaPath}`);
  console.log('Estrutura de diretórios:');
  try {
    // Listar diretórios para debug
    console.log('Conteúdo do diretório atual:');
    console.log(fs.readdirSync(process.cwd()));
    console.log('Conteúdo do diretório server:');
    if (fs.existsSync(path.join(process.cwd(), 'server'))) {
      console.log(fs.readdirSync(path.join(process.cwd(), 'server')));
    } else {
      console.log('Diretório server não encontrado');
    }
    console.log('Conteúdo do diretório server/prisma (se existir):');
    if (fs.existsSync(path.join(process.cwd(), 'server', 'prisma'))) {
      console.log(fs.readdirSync(path.join(process.cwd(), 'server', 'prisma')));
    } else {
      console.log('Diretório server/prisma não encontrado');
    }
  } catch (err) {
    console.error('Erro ao listar diretórios:', err);
  }
}

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
  
  // Verificar se o schema existe antes de executar os comandos
  if (fs.existsSync(schemaPath)) {
    // Executar o comando prisma generate
    try {
      console.log('Executando prisma generate...');
      execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });
      console.log('prisma generate executado com sucesso!');
    } catch (error) {
      console.error('Erro ao executar prisma generate:', error);
      process.exit(1);
    }
    
    // Executar o comando prisma db push
    try {
      console.log('Executando prisma db push...');
      execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'inherit' });
      console.log('prisma db push executado com sucesso!');
    } catch (error) {
      console.error('Erro ao executar prisma db push:', error);
      process.exit(1);
    }
  } else {
    console.error('Schema do Prisma não encontrado, pulando comandos prisma generate e db push');
  }
}

console.log('Configuração do Prisma concluída.');
