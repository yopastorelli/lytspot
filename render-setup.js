import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Script de configuração para ambiente Render
 * @version 1.6.0 - 2025-03-14 - Adicionada execução do script de atualização de serviços e limpeza de cache
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
  
  // Importante: Recarregar o módulo @prisma/client após a geração
  console.log("Recarregando o módulo @prisma/client...");
  try {
    // Limpar o cache do módulo para garantir que a versão mais recente seja carregada
    Object.keys(require.cache).forEach(key => {
      if (key.includes('@prisma/client')) {
        delete require.cache[key];
      }
    });
    console.log("Cache do módulo @prisma/client limpo com sucesso!");
  } catch (error) {
    console.warn("Aviso: Não foi possível limpar o cache do módulo @prisma/client:", error);
  }
  
  // Inicializar o banco de dados com dados de serviços
  console.log("Verificando se existem serviços no banco de dados...");
  
  // Função para inicializar o banco de dados com serviços básicos
  async function inicializarServicos() {
    const { PrismaClient } = await import('@prisma/client');
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
            valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
            detalhes: JSON.stringify({
              captura: '2 a 3 horas',
              tratamento: 'até 7 dias úteis',
              entregaveis: '20 fotos editadas em alta resolução',
              adicionais: 'Edição avançada, maquiagem profissional',
              deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            })
          },
          {
            nome: 'TESTE - Ensaio Externo de Casal ou Família',
            descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos.',
            preco_base: 350.00,
            duracao_media_captura: '2 a 4 horas',
            duracao_media_tratamento: 'até 10 dias úteis',
            entregaveis: '30 fotos editadas em alta resolução',
            possiveis_adicionais: 'Álbum impresso, fotos adicionais',
            valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
            detalhes: JSON.stringify({
              captura: '2 a 4 horas',
              tratamento: 'até 10 dias úteis',
              entregaveis: '30 fotos editadas em alta resolução',
              adicionais: 'Álbum impresso, fotos adicionais',
              deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
            })
          },
          {
            nome: 'TESTE - Fotografia de Eventos',
            descricao: 'Cobertura fotográfica de eventos sociais, corporativos ou festas, com entrega de galeria digital.',
            preco_base: 500.00,
            duracao_media_captura: '4 a 8 horas',
            duracao_media_tratamento: 'até 14 dias úteis',
            entregaveis: '100+ fotos editadas em alta resolução, galeria online',
            possiveis_adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
            valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km',
            detalhes: JSON.stringify({
              captura: '4 a 8 horas',
              tratamento: 'até 14 dias úteis',
              entregaveis: '100+ fotos editadas em alta resolução, galeria online',
              adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
              deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
            })
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
  
  // Executar script de atualização de serviços para garantir dados atualizados
  try {
    console.log("=== INICIANDO ATUALIZAÇÃO DE SERVIÇOS ===");
    console.log("Data e hora:", new Date().toISOString());
    console.log("Verificando se o script de atualização existe...");
    
    const updateScriptPath = path.join(currentDir, 'server', 'scripts', 'render-update-services.js');
    if (!fs.existsSync(updateScriptPath)) {
      console.error(`Erro: Script de atualização não encontrado em: ${updateScriptPath}`);
      console.log("Verificando conteúdo do diretório de scripts...");
      
      const scriptsDir = path.join(currentDir, 'server', 'scripts');
      if (fs.existsSync(scriptsDir)) {
        const files = fs.readdirSync(scriptsDir);
        console.log(`Arquivos encontrados no diretório scripts: ${files.join(', ')}`);
      } else {
        console.error(`Diretório de scripts não encontrado: ${scriptsDir}`);
      }
      
      throw new Error("Script de atualização de serviços não encontrado");
    }
    
    console.log(`Script de atualização encontrado: ${updateScriptPath}`);
    console.log("Verificando arquivo de definições de serviços...");
    
    const serviceDefinitionsPath = path.join(currentDir, 'server', 'models', 'seeds', 'updatedServiceDefinitions.js');
    if (!fs.existsSync(serviceDefinitionsPath)) {
      console.error(`Erro: Arquivo de definições não encontrado em: ${serviceDefinitionsPath}`);
      console.log("Verificando conteúdo do diretório seeds...");
      
      const seedsDir = path.join(currentDir, 'server', 'models', 'seeds');
      if (fs.existsSync(seedsDir)) {
        const files = fs.readdirSync(seedsDir);
        console.log(`Arquivos encontrados no diretório seeds: ${files.join(', ')}`);
      } else {
        console.error(`Diretório seeds não encontrado: ${seedsDir}`);
      }
      
      throw new Error("Arquivo de definições de serviços não encontrado");
    }
    
    console.log(`Arquivo de definições encontrado: ${serviceDefinitionsPath}`);
    console.log("Executando script de atualização de serviços...");
    
    // Executar o script com Node.js
    execSync('node server/scripts/render-update-services.js', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_UPDATE: 'true' // Forçar atualização completa
      }
    });
    
    console.log("Script de atualização de serviços executado com sucesso!");
    console.log("=== ATUALIZAÇÃO DE SERVIÇOS CONCLUÍDA ===");
  } catch (error) {
    console.error("Erro ao executar script de atualização de serviços:", error);
    console.log("Continuando com a inicialização...");
  }
  
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
  
  // Executar o build no ambiente Render
  if (process.env.RENDER) {
    try {
      console.log("Executando script de build específico para o Render...");
      // Usar o script render-build.js para um processo de build mais robusto
      execSync('node render-build.js', { stdio: 'inherit' });
      console.log("Build executado com sucesso!");
    } catch (error) {
      console.error("Erro ao executar o build:", error);
      // Criar um arquivo de fallback em caso de erro no build
      if (!fs.existsSync(path.join(distPath, 'index.html'))) {
        console.log("Criando arquivo index.html de fallback...");
        fs.writeFileSync(path.join(distPath, 'index.html'), `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LytSpot - API</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .api-info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>LytSpot - API</h1>
  <div class="api-info">
    <p>Esta é a API do LytSpot. O frontend está temporariamente indisponível.</p>
    <p>Para acessar os endpoints da API, utilize:</p>
    <ul>
      <li>/api/pricing - Simulador de preços</li>
      <li>/api/contact - Formulário de contato</li>
      <li>/api/admin - Painel administrativo</li>
    </ul>
  </div>
</body>
</html>
        `);
        console.log("Arquivo index.html de fallback criado com sucesso!");
      }
    }
  }
} catch (error) {
  console.error("Erro durante a configuração do ambiente Render:", error);
  process.exit(1);
}