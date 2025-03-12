import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

/**
 * Script de configuração para ambiente Render
 * @version 1.2.0 - 2025-03-12 - Adicionada inicialização do banco de dados com serviços
 */

// Forçar NODE_ENV para production no ambiente Render
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
  console.log("Ambiente Render detectado, NODE_ENV definido como:", process.env.NODE_ENV);
}

// Configurar variáveis de ambiente essenciais se não existirem
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../database.sqlite";
  console.log("DATABASE_URL não encontrada, definindo valor padrão:", process.env.DATABASE_URL);
}

// Configurar JWT_SECRET com o valor específico fornecido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "125n128zf09a3e455c6b3d1556cbda";
  console.log("JWT_SECRET não encontrada, usando valor específico configurado");
}

// Configurar JWT_EXPIRES_IN se não existir
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
  console.log("JWT_EXPIRES_IN não encontrada, definindo valor padrão:", process.env.JWT_EXPIRES_IN);
}

// Configurar NODE_ENV se não existir
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
  console.log("NODE_ENV não encontrada, definindo como:", process.env.NODE_ENV);
}

console.log("Iniciando configuração do ambiente Render...");

// Criar arquivo .env se estiver no ambiente Render
if (process.env.RENDER) {
  try {
    const envContent = `
DATABASE_URL=${process.env.DATABASE_URL}
JWT_SECRET=${process.env.JWT_SECRET}
JWT_EXPIRES_IN=${process.env.JWT_EXPIRES_IN}
NODE_ENV=${process.env.NODE_ENV}
BASE_URL=${process.env.BASE_URL || '/'}
REFRESH_TOKEN=${process.env.REFRESH_TOKEN || ''}
CLIENT_ID=${process.env.CLIENT_ID || ''}
CLIENT_SECRET=${process.env.CLIENT_SECRET || ''}
ACCOUNT_ID=${process.env.ACCOUNT_ID || ''}
SENDER_EMAIL=${process.env.SENDER_EMAIL || ''}
RECIPIENT_EMAIL=${process.env.RECIPIENT_EMAIL || ''}
`;
    
    fs.writeFileSync('.env', envContent);
    console.log("Arquivo .env criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar arquivo .env:", error);
  }
}

// Verificar estrutura de diretórios
const currentDir = process.cwd();
console.log("Estrutura de diretórios:");
console.log("Diretório atual:", currentDir);

try {
  const dirContents = fs.readdirSync(currentDir);
  console.log("Conteúdo do diretório atual:", dirContents);
  
  // Localizar o schema do Prisma
  const prismaSchemaPath = path.join(currentDir, 'server', 'prisma', 'schema.prisma');
  const dbPath = path.join(currentDir, 'database.sqlite');
  
  console.log("Schema do Prisma encontrado em:", prismaSchemaPath);
  console.log("Caminho do banco de dados:", dbPath);
  
  // Verificar se o arquivo schema.prisma existe
  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error(`Arquivo schema.prisma não encontrado em ${prismaSchemaPath}`);
  }
  
  // Executar comandos do Prisma
  console.log("Executando prisma generate...");
  execSync(`npx prisma generate --schema="${prismaSchemaPath}"`, { stdio: 'inherit' });
  console.log("prisma generate executado com sucesso!");
  
  // Verificar se o banco de dados já existe
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    console.log("Executando prisma db push...");
    execSync(`npx prisma db push --schema="${prismaSchemaPath}" --accept-data-loss`, { stdio: 'inherit' });
    console.log("prisma db push executado com sucesso!");
  } else {
    console.log("Banco de dados já existe, pulando prisma db push");
  }
  
  // Inicializar o banco de dados com dados de serviços
  console.log("Verificando se existem serviços no banco de dados...");
  
  // Função para inicializar o banco de dados com serviços básicos
  async function inicializarServicos() {
    const prisma = new PrismaClient();
    
    try {
      // Verificar se já existem serviços
      const servicosExistentes = await prisma.servico.count();
      
      if (servicosExistentes === 0) {
        console.log("Nenhum serviço encontrado. Inicializando banco de dados com serviços básicos...");
        
        // Dados básicos para o simulador de preços
        const servicos = [
          {
            nome: 'TESTE - Ensaio Fotográfico Pessoal',
            descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal.',
            preco_base: 200.00,
            duracao_media_captura: '2 a 3 horas',
            duracao_media_tratamento: 'até 7 dias úteis',
            entregaveis: '20 fotos editadas em alta resolução',
            possiveis_adicionais: 'Edição avançada, maquiagem profissional',
            valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
          },
          {
            nome: 'TESTE - Ensaio Externo de Casal ou Família',
            descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos.',
            preco_base: 350.00,
            duracao_media_captura: '2 a 4 horas',
            duracao_media_tratamento: 'até 10 dias úteis',
            entregaveis: '30 fotos editadas em alta resolução',
            possiveis_adicionais: 'Álbum impresso, fotos adicionais',
            valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
          },
          {
            nome: 'TESTE - Fotografia de Eventos',
            descricao: 'Cobertura fotográfica de eventos sociais, corporativos ou festas, com entrega de galeria digital.',
            preco_base: 500.00,
            duracao_media_captura: '4 a 8 horas',
            duracao_media_tratamento: 'até 14 dias úteis',
            entregaveis: '100+ fotos editadas em alta resolução, galeria online',
            possiveis_adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
            valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
          }
        ];
        
        // Criar os serviços no banco de dados
        for (const servico of servicos) {
          await prisma.servico.create({
            data: servico
          });
        }
        
        console.log(`${servicos.length} serviços básicos adicionados ao banco de dados com sucesso!`);
      } else {
        console.log(`Banco de dados já possui ${servicosExistentes} serviços. Pulando inicialização.`);
      }
    } catch (error) {
      console.error("Erro ao inicializar serviços:", error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Executar a inicialização de serviços
  await inicializarServicos();
  
  // Criar diretório dist se não existir
  const distPath = path.join(currentDir, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log("Criando diretório dist...");
    fs.mkdirSync(distPath, { recursive: true });
    console.log("Diretório dist criado com sucesso!");
    
    // Criar um arquivo index.html básico para evitar erros
    const indexHtmlPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.log("Criando arquivo index.html básico...");
      fs.writeFileSync(indexHtmlPath, `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LytSpot</title>
  <meta http-equiv="refresh" content="0;url=/index.html">
</head>
<body>
  <p>Redirecionando...</p>
</body>
</html>
      `);
      console.log("Arquivo index.html básico criado com sucesso!");
    }
  }
  
  console.log("Configuração do ambiente Render concluída com sucesso!");
} catch (error) {
  console.error("Erro ao executar comandos do Prisma:", error);
  process.exit(1);
}