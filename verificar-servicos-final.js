/**
 * Script para verificar a estrutura final dos serviços no banco de dados
 * @version 1.0.0 - 2025-03-14
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');

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
      const primeiroServico = servicos[0];
      console.log('ID:', primeiroServico.id);
      console.log('Nome:', primeiroServico.nome);
      console.log('Descrição:', primeiroServico.descricao);
      console.log('Preço Base:', primeiroServico.preco_base);
      console.log('Duração Média Captura:', primeiroServico.duracao_media_captura);
      console.log('Duração Média Tratamento:', primeiroServico.duracao_media_tratamento);
      console.log('Entregáveis:', primeiroServico.entregaveis);
      console.log('Possíveis Adicionais:', primeiroServico.possiveis_adicionais);
      console.log('Valor Deslocamento:', primeiroServico.valor_deslocamento);
      console.log('Detalhes (JSON):', primeiroServico.detalhes);
      
      if (primeiroServico.detalhes) {
        try {
          const detalhesObj = JSON.parse(primeiroServico.detalhes);
          console.log('\nDetalhes (Objeto):');
          console.log('- Captura:', detalhesObj.captura);
          console.log('- Tratamento:', detalhesObj.tratamento);
          console.log('- Entregáveis:', detalhesObj.entregaveis);
          console.log('- Adicionais:', detalhesObj.adicionais);
          console.log('- Deslocamento:', detalhesObj.deslocamento);
        } catch (error) {
          console.error('Erro ao fazer parse do JSON de detalhes:', error);
        }
      }
      
      // Verificar se todos os serviços têm a estrutura detalhes
      const servicosComDetalhes = servicos.filter(s => s.detalhes);
      console.log(`\nServiços com estrutura 'detalhes': ${servicosComDetalhes.length} de ${servicos.length}`);
      
      if (servicosComDetalhes.length < servicos.length) {
        console.log('\nServiços sem estrutura detalhes:');
        const servicosSemDetalhes = servicos.filter(s => !s.detalhes);
        servicosSemDetalhes.forEach(s => {
          console.log(`- ${s.nome} (ID: ${s.id})`);
        });
      } else {
        console.log('\nTodos os serviços possuem a estrutura detalhes');
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
