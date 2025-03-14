/**
 * Script para testar o endpoint de serviços
 * @version 1.0.0 - 2025-03-14
 * @description Simula uma requisição do frontend para o endpoint de serviços
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

/**
 * Simula o comportamento do endpoint de serviços
 */
async function simularEndpointServicos() {
  try {
    console.log('=== SIMULANDO ENDPOINT DE SERVIÇOS ===');
    console.log('Conectando ao banco de dados...');
    
    // Buscar todos os serviços
    const servicosDoBanco = await prisma.servico.findMany();
    console.log(`Encontrados ${servicosDoBanco.length} serviços no banco de dados`);
    
    // Transformar serviços para o formato do simulador (frontend)
    const servicosParaFrontend = serviceTransformer.toSimulatorFormatList(servicosDoBanco);
    
    console.log('\n=== DADOS QUE SERIAM ENVIADOS PARA O FRONTEND ===');
    
    // Mostrar apenas o primeiro serviço como exemplo
    if (servicosParaFrontend.length > 0) {
      const exemplo = servicosParaFrontend[0];
      console.log('\nExemplo de serviço (primeiro):');
      console.log('ID:', exemplo.id);
      console.log('Nome:', exemplo.nome);
      console.log('Descrição:', exemplo.descricao);
      console.log('Preço Base:', exemplo.preco_base);
      console.log('Duração Média:', exemplo.duracao_media);
      
      // Verificar se a estrutura detalhes está presente e correta
      console.log('\nEstrutura detalhes:');
      if (exemplo.detalhes) {
        console.log('- Captura:', exemplo.detalhes.captura);
        console.log('- Tratamento:', exemplo.detalhes.tratamento);
        console.log('- Entregáveis:', exemplo.detalhes.entregaveis);
        console.log('- Adicionais:', exemplo.detalhes.adicionais);
        console.log('- Deslocamento:', exemplo.detalhes.deslocamento);
      } else {
        console.log('ERRO: Estrutura detalhes não encontrada!');
      }
      
      // Verificar acesso aos campos aninhados (simulando o uso no frontend)
      console.log('\nSimulando acesso do frontend:');
      console.log('servico.detalhes.captura =', exemplo.detalhes?.captura || 'ERRO: Campo não encontrado');
      console.log('servico.detalhes.tratamento =', exemplo.detalhes?.tratamento || 'ERRO: Campo não encontrado');
      
      // Verificar todos os serviços
      console.log('\nVerificando estrutura detalhes em todos os serviços:');
      const servicosComDetalhesCompletos = servicosParaFrontend.filter(
        s => s.detalhes && s.detalhes.captura && s.detalhes.tratamento
      );
      
      console.log(`${servicosComDetalhesCompletos.length} de ${servicosParaFrontend.length} serviços têm a estrutura detalhes completa`);
      
      if (servicosComDetalhesCompletos.length < servicosParaFrontend.length) {
        console.log('\nServiços com estrutura detalhes incompleta:');
        const servicosIncompletos = servicosParaFrontend.filter(
          s => !s.detalhes || !s.detalhes.captura || !s.detalhes.tratamento
        );
        
        servicosIncompletos.forEach(s => {
          console.log(`- ${s.nome} (ID: ${s.id})`);
        });
      }
    }
    
    console.log('\n=== CONCLUSÃO ===');
    if (servicosParaFrontend.every(s => s.detalhes && s.detalhes.captura && s.detalhes.tratamento)) {
      console.log('✅ SUCESSO: Todos os serviços têm a estrutura detalhes completa!');
      console.log('O problema de discrepância entre backend e frontend foi resolvido.');
    } else {
      console.log('❌ ATENÇÃO: Alguns serviços ainda não têm a estrutura detalhes completa.');
      console.log('É necessário verificar e corrigir os serviços problemáticos.');
    }
  } catch (error) {
    console.error('Erro ao simular endpoint de serviços:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDesconectado do banco de dados');
    console.log('=== SIMULAÇÃO CONCLUÍDA ===');
  }
}

simularEndpointServicos();
