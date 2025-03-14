import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Script de configuração para ambiente Render
 * @version 1.7.0 - 2025-03-15 - Melhorado tratamento de erros e verificações de ambiente
 */

// Configurar logger para facilitar diagnóstico
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  
  // Registrar em arquivo se possível
  try {
    const logDir = path.join(process.cwd(), 'server', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'render-setup.log');
    fs.appendFileSync(logFile, `[${timestamp}] [${level}] ${message}\n`);
  } catch (error) {
    console.error(`Erro ao registrar log: ${error.message}`);
  }
}

// Verificar versão do Node.js
const nodeVersion = process.version;
log('INFO', `Versão do Node.js: ${nodeVersion}`);

// Extrair a versão principal do Node.js (por exemplo, v18.x.x -> 18)
const majorVersion = parseInt(nodeVersion.match(/^v(\d+)\./)?.[1] || '0');
if (majorVersion < 18) {
  log('WARN', `Esta versão do Node.js (${nodeVersion}) pode não ser totalmente compatível com este script. Recomendado: v18+`);
}

// Forçar NODE_ENV para production no ambiente Render
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
  log('INFO', "Ambiente Render detectado, NODE_ENV definido como: " + process.env.NODE_ENV);
} else {
  log('INFO', "Ambiente local detectado, NODE_ENV: " + (process.env.NODE_ENV || 'não definido'));
}

// Configurar variáveis de ambiente essenciais se não existirem
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:../database.sqlite";
  log('INFO', "DATABASE_URL não encontrada, definindo valor padrão: " + process.env.DATABASE_URL);
}

// Configurar JWT_SECRET com o valor específico fornecido
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "125n128zf09a3e455c6b3d1556cbda";
  log('INFO', "JWT_SECRET não encontrada, usando valor específico configurado");
}

// Configurar JWT_EXPIRES_IN se não existir
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
  log('INFO', "JWT_EXPIRES_IN não encontrada, definindo valor padrão: " + process.env.JWT_EXPIRES_IN);
}

// Configurar NODE_ENV se não existir
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
  log('INFO', "NODE_ENV não encontrada, definindo como: " + process.env.NODE_ENV);
}

// Configurar CACHE_SECRET para autenticação da API de cache
if (!process.env.CACHE_SECRET) {
  process.env.CACHE_SECRET = "cache-secret-key";
  log('INFO', "CACHE_SECRET não encontrada, definindo valor padrão");
}

log('INFO', "Iniciando configuração do ambiente Render...");

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
CACHE_SECRET=${process.env.CACHE_SECRET || 'cache-secret-key'}
`;
    
    fs.writeFileSync('.env', envContent);
    log('INFO', "Arquivo .env criado com sucesso!");
  } catch (error) {
    log('ERROR', "Erro ao criar arquivo .env: " + error.message);
  }
}

// Verificar estrutura de diretórios
const currentDir = process.cwd();
log('INFO', "Estrutura de diretórios:");
log('INFO', "Diretório atual: " + currentDir);

try {
  const dirContents = fs.readdirSync(currentDir);
  log('INFO', "Conteúdo do diretório atual: " + dirContents.join(', '));
  
  // Localizar o schema do Prisma
  const prismaSchemaPath = path.join(currentDir, 'server', 'prisma', 'schema.prisma');
  const dbPath = path.join(currentDir, 'database.sqlite');
  
  log('INFO', "Schema do Prisma encontrado em: " + prismaSchemaPath);
  log('INFO', "Caminho do banco de dados: " + dbPath);
  
  // Verificar se o arquivo schema.prisma existe
  if (!fs.existsSync(prismaSchemaPath)) {
    throw new Error(`Arquivo schema.prisma não encontrado em ${prismaSchemaPath}`);
  }
  
  // Executar comandos do Prisma
  log('INFO', "Executando prisma generate...");
  execSync(`npx prisma generate --schema="${prismaSchemaPath}"`, { stdio: 'inherit' });
  log('INFO', "prisma generate executado com sucesso!");
  
  // Verificar se o banco de dados já existe
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    log('INFO', "Executando prisma db push...");
    execSync(`npx prisma db push --schema="${prismaSchemaPath}" --accept-data-loss`, { stdio: 'inherit' });
    log('INFO', "prisma db push executado com sucesso!");
  } else {
    log('INFO', "Banco de dados já existe, pulando prisma db push");
  }
  
  // Importante: Recarregar o módulo @prisma/client após a geração
  log('INFO', "Recarregando o módulo @prisma/client...");
  try {
    // Limpar o cache do módulo para garantir que a versão mais recente seja carregada
    Object.keys(require.cache).forEach(key => {
      if (key.includes('@prisma/client')) {
        delete require.cache[key];
      }
    });
    log('INFO', "Cache do módulo @prisma/client limpo com sucesso!");
  } catch (error) {
    log('WARN', "Aviso: Não foi possível limpar o cache do módulo @prisma/client: " + error.message);
  }
  
  // Inicializar o banco de dados com dados de serviços
  log('INFO', "Verificando se existem serviços no banco de dados...");
  
  // Função para inicializar o banco de dados com serviços básicos
  async function inicializarServicos() {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Verificar se já existem serviços
      const servicosExistentes = await prisma.servico.count();
      
      if (servicosExistentes === 0) {
        log('INFO', "Nenhum serviço encontrado. Inicializando banco de dados com serviços básicos...");
        
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
        
        log('INFO', `${servicos.length} serviços básicos adicionados ao banco de dados com sucesso!`);
      } else {
        log('INFO', `Banco de dados já possui ${servicosExistentes} serviços. Pulando inicialização.`);
      }
    } catch (error) {
      log('ERROR', "Erro ao inicializar serviços: " + error.message);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  // Executar a inicialização de serviços
  await inicializarServicos();
  
  // Executar script de atualização de serviços para garantir dados atualizados
  try {
    log('INFO', "=== INICIANDO ATUALIZAÇÃO DE SERVIÇOS ===");
    log('INFO', "Data e hora: " + new Date().toISOString());
    log('INFO', "Ambiente: " + process.env.NODE_ENV);
    log('INFO', "Diretório atual: " + process.cwd());
    
    // Forçar atualização completa definindo variável de ambiente
    process.env.FORCE_UPDATE = "true";
    log('INFO', "Forçando atualização completa de serviços (FORCE_UPDATE=true)");
    
    // Definir caminhos absolutos para os scripts e arquivos
    const updateScriptPath = path.join(currentDir, 'server', 'scripts', 'render-update-services.js');
    log('INFO', "Verificando se o script de atualização existe em: " + updateScriptPath);
    
    let scriptToExecute = updateScriptPath;
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(updateScriptPath)) {
      log('WARN', `Script de atualização não encontrado em: ${updateScriptPath}`);
      log('INFO', "Verificando conteúdo do diretório de scripts...");
      
      const scriptsDir = path.join(currentDir, 'server', 'scripts');
      if (fs.existsSync(scriptsDir)) {
        const files = fs.readdirSync(scriptsDir);
        log('INFO', `Arquivos encontrados no diretório scripts: ${files.join(', ')}`);
        
        // Tentar encontrar qualquer script de atualização
        let alternativeScript = null;
        for (const file of files) {
          if (file.includes('update-service') || file.includes('updateService')) {
            log('INFO', `Encontrado possível script alternativo: ${file}`);
            alternativeScript = path.join(scriptsDir, file);
            break;
          }
        }
        
        if (alternativeScript) {
          log('INFO', `Usando script alternativo: ${alternativeScript}`);
          scriptToExecute = alternativeScript;
        } else {
          throw new Error("Nenhum script de atualização de serviços encontrado");
        }
      } else {
        log('ERROR', `Diretório de scripts não encontrado: ${scriptsDir}`);
        throw new Error("Diretório de scripts não encontrado");
      }
    } else {
      log('INFO', `Script de atualização encontrado: ${updateScriptPath}`);
    }
    
    log('INFO', "Verificando arquivo de definições de serviços...");
    
    const serviceDefinitionsPath = path.join(currentDir, 'server', 'models', 'seeds', 'updatedServiceDefinitions.js');
    if (!fs.existsSync(serviceDefinitionsPath)) {
      log('WARN', `Arquivo de definições não encontrado em: ${serviceDefinitionsPath}`);
      log('INFO', "Verificando conteúdo do diretório seeds...");
      
      const seedsDir = path.join(currentDir, 'server', 'models', 'seeds');
      if (fs.existsSync(seedsDir)) {
        const files = fs.readdirSync(seedsDir);
        log('INFO', `Arquivos encontrados no diretório seeds: ${files.join(', ')}`);
        
        // Tentar encontrar qualquer arquivo de definições
        let alternativeDefinitions = null;
        for (const file of files) {
          if (file.includes('ServiceDefinition') || file.includes('serviceDefinition')) {
            log('INFO', `Encontrado possível arquivo de definições alternativo: ${file}`);
            alternativeDefinitions = path.join(seedsDir, file);
            break;
          }
        }
        
        if (alternativeDefinitions) {
          log('INFO', `Arquivo de definições alternativo encontrado: ${alternativeDefinitions}`);
          // Continuar com o arquivo alternativo
          process.env.SERVICE_DEFINITIONS_PATH = alternativeDefinitions;
        } else {
          log('WARN', "Nenhum arquivo de definições alternativo encontrado. O script usará definições básicas.");
        }
      } else {
        log('ERROR', `Diretório seeds não encontrado: ${seedsDir}`);
        log('WARN', "Diretório seeds não encontrado. O script usará definições básicas.");
      }
    } else {
      log('INFO', `Arquivo de definições encontrado: ${serviceDefinitionsPath}`);
      process.env.SERVICE_DEFINITIONS_PATH = serviceDefinitionsPath;
    }
    
    // Criar diretório de logs se não existir
    const logDir = path.join(currentDir, 'server', 'logs');
    if (!fs.existsSync(logDir)) {
      log('INFO', `Criando diretório de logs: ${logDir}`);
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    log('INFO', "Executando script de atualização de serviços...");
    
    // Executar o script com Node.js
    try {
      execSync(`node ${scriptToExecute}`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          RENDER: 'true',
          FORCE_UPDATE: 'true', // Forçar atualização completa
          NODE_ENV: 'production'
        },
        timeout: 120000 // 2 minutos de timeout
      });
      
      log('INFO', "Script de atualização de serviços executado com sucesso!");
    } catch (execError) {
      log('ERROR', `Erro ao executar script de atualização: ${execError.message}`);
      
      // Verificar se é um erro de timeout
      if (execError.signal === 'SIGTERM' || execError.message.includes('timeout')) {
        log('WARN', "Timeout ao executar o script. Ele pode estar demorando mais do que o esperado.");
      }
      
      // Verificar se é um erro de permissão
      if (execError.code === 'EACCES') {
        log('ERROR', "Erro de permissão ao executar o script. Verificando permissões...");
        try {
          fs.chmodSync(scriptToExecute, 0o755); // Adicionar permissão de execução
          log('INFO', "Permissões do script atualizadas. Tentando novamente...");
          
          execSync(`node ${scriptToExecute}`, { 
            stdio: 'inherit',
            env: {
              ...process.env,
              RENDER: 'true',
              FORCE_UPDATE: 'true',
              NODE_ENV: 'production'
            }
          });
          
          log('INFO', "Script executado com sucesso após ajuste de permissões!");
        } catch (retryError) {
          log('ERROR', `Falha ao executar script mesmo após ajuste de permissões: ${retryError.message}`);
          throw retryError;
        }
      }
      
      log('WARN', "Continuando com a inicialização mesmo após erro no script de atualização...");
    }
    
    // Verificar logs para garantir que a execução foi bem-sucedida
    const logFilePath = path.join(logDir, 'render-update-services.log');
    if (fs.existsSync(logFilePath)) {
      log('INFO', "Verificando logs da atualização...");
      const logContent = fs.readFileSync(logFilePath, 'utf8');
      const lastLines = logContent.split('\n').slice(-20).join('\n');
      log('INFO', "Últimas linhas do log:");
      console.log(lastLines);
      
      if (logContent.includes('=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')) {
        log('INFO', "✅ Atualização de serviços concluída com sucesso!");
      } else if (logContent.includes('ERROR')) {
        log('WARN', "⚠️ Possíveis erros detectados nos logs. Verifique o arquivo de log completo.");
      }
    } else {
      log('WARN', "Arquivo de log não encontrado. Não foi possível verificar o resultado da atualização.");
    }
    
    log('INFO', "=== ATUALIZAÇÃO DE SERVIÇOS CONCLUÍDA ===");
  } catch (error) {
    log('ERROR', "Erro ao executar script de atualização de serviços: " + error.message);
    log('ERROR', "Detalhes do erro: " + error.stack);
    log('WARN', "Continuando com a inicialização...");
  }
  
  // Criar diretório dist se não existir
  const distPath = path.join(currentDir, 'dist');
  if (!fs.existsSync(distPath)) {
    log('INFO', "Criando diretório dist...");
    fs.mkdirSync(distPath, { recursive: true });
    log('INFO', "Diretório dist criado com sucesso!");
    
    // Criar um arquivo index.html básico para evitar erros
    const indexHtmlPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      log('INFO', "Criando arquivo index.html básico...");
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
      log('INFO', "Arquivo index.html básico criado com sucesso!");
    }
  }
  
  // Executar o build no ambiente Render
  if (process.env.RENDER) {
    try {
      log('INFO', "Executando script de build específico para o Render...");
      // Usar o script render-build.js para um processo de build mais robusto
      execSync('node render-build.js', { stdio: 'inherit' });
      log('INFO', "Build executado com sucesso!");
    } catch (error) {
      log('ERROR', "Erro ao executar o build: " + error.message);
      // Criar um arquivo de fallback em caso de erro no build
      if (!fs.existsSync(path.join(distPath, 'index.html'))) {
        log('INFO', "Criando arquivo index.html de fallback...");
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
        log('INFO', "Arquivo index.html de fallback criado com sucesso!");
      }
    }
  }
} catch (error) {
  log('ERROR', "Erro durante a configuração do ambiente Render: " + error.message);
  log('ERROR', "Stack trace: " + error.stack);
  
  // Registrar informações do ambiente para diagnóstico
  log('INFO', "=== INFORMAÇÕES DO AMBIENTE ===");
  log('INFO', `Node.js: ${process.version}`);
  log('INFO', `OS: ${process.platform} ${process.arch}`);
  log('INFO', `Memória: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`);
  
  // Listar variáveis de ambiente (exceto as sensíveis)
  const safeEnvVars = Object.keys(process.env)
    .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD') && !key.includes('TOKEN'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});
  log('INFO', `Variáveis de ambiente: ${JSON.stringify(safeEnvVars, null, 2)}`);
  
  process.exit(1);
}