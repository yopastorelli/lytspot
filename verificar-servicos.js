/**
 * Script para verificar a estrutura dos serviços no banco de dados
 * @version 1.1.0 - 2025-03-14 - Atualizado para usar o mesmo caminho de banco de dados que o resto da aplicação
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Verificar se estamos no ambiente Render
const isRender = process.env.RENDER === 'true';

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = isRender 
  ? path.join('/opt/render/project/src', 'database.sqlite')
  : path.resolve(rootDir, 'server', 'database.sqlite');

console.log(`Caminho do banco de dados: ${dbPath}`);

// Verificar se o arquivo do banco de dados existe
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Arquivo de banco de dados não encontrado em: ${dbPath}`);
  process.exit(1);
}

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;
console.log(`DATABASE_URL configurado para: ${process.env.DATABASE_URL}`);

const prisma = new PrismaClient();

async function verificarServicos() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany();
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    if (servicos.length > 0) {
      // Mostrar o primeiro serviço como exemplo
      console.log('\nExemplo de serviço (primeiro do banco):');
      console.log(JSON.stringify(servicos[0], null, 2));
      
      // Verificar se todos os serviços têm a estrutura detalhes
      const servicosComDetalhes = servicos.filter(s => s.detalhes);
      console.log(`\nServiços com estrutura 'detalhes': ${servicosComDetalhes.length} de ${servicos.length}`);
      
      if (servicosComDetalhes.length < servicos.length) {
        console.log('\nServiços sem estrutura detalhes:');
        const servicosSemDetalhes = servicos.filter(s => !s.detalhes);
        servicosSemDetalhes.forEach(s => {
          console.log(`- ${s.nome} (ID: ${s.id})`);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar serviços:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDesconectado do banco de dados');
  }
}

verificarServicos();
