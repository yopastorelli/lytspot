/**
 * Script para verificar e atualizar a estrutura dos serviços
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

async function verificarEAtualizar() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany();
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    if (servicos.length > 0) {
      // Mostrar o primeiro serviço como exemplo
      console.log('\nExemplo de serviço (primeiro do banco):');
      console.log(servicos[0]);
      
      // Atualizar serviços
      console.log('\nAtualizando serviços...');
      
      for (const servico of servicos) {
        // Criar estrutura detalhes
        const detalhes = JSON.stringify({
          captura: servico.duracao_media_captura,
          tratamento: servico.duracao_media_tratamento,
          entregaveis: servico.entregaveis,
          adicionais: servico.possiveis_adicionais,
          deslocamento: servico.valor_deslocamento
        });
        
        try {
          // Atualizar serviço
          await prisma.servico.update({
            where: { id: servico.id },
            data: { detalhes }
          });
          
          console.log(`Serviço "${servico.nome}" (ID: ${servico.id}) atualizado com sucesso`);
        } catch (error) {
          console.error(`Erro ao atualizar serviço "${servico.nome}" (ID: ${servico.id}):`, error);
        }
      }
      
      // Verificar resultado
      const servicosAtualizados = await prisma.servico.findMany();
      const servicosComDetalhes = servicosAtualizados.filter(s => s.detalhes);
      
      console.log(`\nServiços com estrutura 'detalhes' após atualização: ${servicosComDetalhes.length} de ${servicosAtualizados.length}`);
    }
  } catch (error) {
    console.error('Erro ao verificar e atualizar serviços:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDesconectado do banco de dados');
  }
}

verificarEAtualizar();
