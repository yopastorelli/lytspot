/**
 * Script para verificar a configuração de conexão com o banco de dados
 * @version 1.0.0 - 2025-03-14
 * @description Verifica as configurações de conexão com o banco de dados em diferentes ambientes
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

/**
 * Verifica a configuração do banco de dados
 */
async function verificarConfiguracao() {
  console.log('🔍 Verificando configuração de conexão com o banco de dados...');
  
  // Verificar variáveis de ambiente
  console.log('\n📋 Variáveis de ambiente:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '***configurado***' : 'não definido'}`);
  
  if (process.env.DATABASE_URL) {
    // Extrair informações da URL do banco de dados sem mostrar senha
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`- Protocolo: ${url.protocol}`);
      console.log(`- Host: ${url.hostname}`);
      console.log(`- Porta: ${url.port}`);
      console.log(`- Caminho: ${url.pathname}`);
      console.log(`- Usuário: ${url.username}`);
    } catch (error) {
      console.log(`- Erro ao analisar DATABASE_URL: ${error.message}`);
    }
  }
  
  // Verificar arquivo .env
  console.log('\n📋 Arquivo .env:');
  try {
    const envPath = path.join(rootDir, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      // Mostrar linhas relevantes sem expor senhas
      for (const line of envLines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          
          if (key.trim() === 'DATABASE_URL') {
            console.log(`- ${key}=***valor oculto por segurança***`);
          } else if (key.trim().includes('DATABASE') || key.trim().includes('PRISMA') || key.trim().includes('DB_')) {
            console.log(`- ${key}=${value}`);
          }
        }
      }
    } else {
      console.log('- Arquivo .env não encontrado');
    }
  } catch (error) {
    console.log(`- Erro ao ler arquivo .env: ${error.message}`);
  }
  
  // Verificar arquivo schema.prisma
  console.log('\n📋 Configuração do Prisma:');
  try {
    const schemaPath = path.join(rootDir, 'server', 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const datasourceLines = schemaContent
        .split('\n')
        .filter(line => line.includes('datasource') || line.includes('provider') || line.includes('url'))
        .map(line => line.trim());
      
      console.log('- Configuração do datasource:');
      datasourceLines.forEach(line => {
        if (line.includes('url =')) {
          // Não mostrar a URL completa por segurança
          console.log(`  ${line.split('=')[0]} = "***valor oculto por segurança***"`);
        } else {
          console.log(`  ${line}`);
        }
      });
    } else {
      console.log('- Arquivo schema.prisma não encontrado');
    }
  } catch (error) {
    console.log(`- Erro ao ler arquivo schema.prisma: ${error.message}`);
  }
  
  // Tentar conectar ao banco de dados
  console.log('\n🔌 Testando conexão com o banco de dados...');
  const prisma = new PrismaClient();
  
  try {
    // Testar conexão com uma consulta simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ Conexão bem-sucedida! Resultado do teste: ${JSON.stringify(result)}`);
    
    // Verificar tabelas
    console.log('\n📊 Verificando tabelas no banco de dados...');
    
    // Verificar tabela de serviços
    const servicos = await prisma.servico.count();
    console.log(`- Tabela 'servico': ${servicos} registros`);
    
    // Listar IDs dos serviços
    const servicosIds = await prisma.servico.findMany({
      select: { id: true, nome: true },
      take: 10
    });
    
    console.log('- Primeiros 10 serviços no banco:');
    servicosIds.forEach(s => console.log(`  ID: ${s.id}, Nome: ${s.nome}`));
    
  } catch (error) {
    console.error(`❌ Erro ao conectar ao banco de dados: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
  
  // Verificar configuração do script render-update-services.js
  console.log('\n📋 Configuração do script de atualização:');
  try {
    const scriptPath = path.join(rootDir, 'server', 'scripts', 'render-update-services.js');
    if (fs.existsSync(scriptPath)) {
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      
      // Verificar como o script inicializa o Prisma
      if (scriptContent.includes('new PrismaClient')) {
        console.log('- Script inicializa o Prisma diretamente');
      } else if (scriptContent.includes('initializePrisma')) {
        console.log('- Script usa função initializePrisma para conectar ao banco');
      }
      
      // Verificar se o script define DATABASE_URL
      if (scriptContent.includes('DATABASE_URL')) {
        console.log('- Script referencia a variável DATABASE_URL');
      }
      
      // Verificar se o script usa alguma configuração específica para produção
      if (scriptContent.includes('NODE_ENV') && scriptContent.includes('production')) {
        console.log('- Script tem configuração específica para ambiente de produção');
      }
    } else {
      console.log('- Script render-update-services.js não encontrado');
    }
  } catch (error) {
    console.log(`- Erro ao analisar script: ${error.message}`);
  }
  
  console.log('\n✅ Verificação concluída!');
}

// Executar a função principal
verificarConfiguracao()
  .catch((error) => {
    console.error('❌ Erro fatal durante execução do script:', error);
    process.exit(1);
  });
