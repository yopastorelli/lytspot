/**
 * Script para testar o transformador de serviços
 * @version 1.0.0 - 2025-03-14
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import serviceTransformer from './server/transformers/serviceTransformer.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Definir caminho absoluto para o banco de dados SQLite
const dbPath = path.resolve(rootDir, 'server', 'database.sqlite');
console.log(`Caminho do banco de dados: ${dbPath}`);

// Atualizar a variável de ambiente DATABASE_URL
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function testarTransformador() {
  try {
    console.log('=== TESTANDO TRANSFORMADOR DE SERVIÇOS ===');
    console.log('Conectando ao banco de dados...');
    
    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany();
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    if (servicos.length > 0) {
      // Selecionar o primeiro serviço para teste
      const servico = servicos[0];
      console.log('\nServiço original do banco de dados:');
      console.log('ID:', servico.id);
      console.log('Nome:', servico.nome);
      console.log('Descrição:', servico.descricao);
      console.log('Preço Base:', servico.preco_base);
      console.log('Duração Média Captura:', servico.duracao_media_captura);
      console.log('Duração Média Tratamento:', servico.duracao_media_tratamento);
      console.log('Entregáveis:', servico.entregaveis);
      console.log('Possíveis Adicionais:', servico.possiveis_adicionais);
      console.log('Valor Deslocamento:', servico.valor_deslocamento);
      console.log('Detalhes (JSON):', servico.detalhes);
      
      // Converter para o formato do simulador
      console.log('\nConvertendo para o formato do simulador...');
      const servicoSimulador = serviceTransformer.toSimulatorFormat(servico);
      console.log('\nServiço no formato do simulador:');
      console.log('ID:', servicoSimulador.id);
      console.log('Nome:', servicoSimulador.nome);
      console.log('Descrição:', servicoSimulador.descricao);
      console.log('Preço Base:', servicoSimulador.preco_base);
      console.log('Duração Média:', servicoSimulador.duracao_media);
      console.log('Detalhes:', JSON.stringify(servicoSimulador.detalhes, null, 2));
      
      // Converter de volta para o formato do banco de dados
      console.log('\nConvertendo de volta para o formato do banco de dados...');
      const servicoBanco = serviceTransformer.toDatabaseFormat(servicoSimulador);
      console.log('\nServiço no formato do banco de dados:');
      console.log('Nome:', servicoBanco.nome);
      console.log('Descrição:', servicoBanco.descricao);
      console.log('Preço Base:', servicoBanco.preco_base);
      console.log('Duração Média Captura:', servicoBanco.duracao_media_captura);
      console.log('Duração Média Tratamento:', servicoBanco.duracao_media_tratamento);
      console.log('Entregáveis:', servicoBanco.entregaveis);
      console.log('Possíveis Adicionais:', servicoBanco.possiveis_adicionais);
      console.log('Valor Deslocamento:', servicoBanco.valor_deslocamento);
      console.log('Detalhes (JSON):', servicoBanco.detalhes);
      
      // Verificar se a estrutura detalhes está correta
      try {
        const detalhesObj = JSON.parse(servicoBanco.detalhes);
        console.log('\nDetalhes (Objeto):');
        console.log(detalhesObj);
      } catch (error) {
        console.error('Erro ao fazer parse do JSON de detalhes:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao testar transformador:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDesconectado do banco de dados');
    console.log('=== TESTE CONCLUÍDO ===');
  }
}

testarTransformador();
