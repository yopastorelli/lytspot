/**
 * Script para testar a conexão com o banco de dados e listar serviços
 * @version 1.0.1 - 2025-03-14 - Melhorado o diagnóstico e adicionado mais detalhes sobre os serviços
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Criar cliente Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

/**
 * Testa a conexão com o banco de dados e lista os serviços
 */
async function testConnection() {
  console.log(' Iniciando teste de conexão com o banco de dados...');
  console.log(' DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    // Testar conexão básica
    console.log(' Testando conexão básica...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log(' Conexão básica estabelecida com sucesso!');
    
    // Contar serviços
    console.log(' Contando serviços...');
    const count = await prisma.servico.count();
    console.log(` Total de serviços encontrados: ${count}`);
    
    if (count === 0) {
      console.warn(' ATENÇÃO: Nenhum serviço encontrado no banco de dados!');
      console.log(' Sugestão: Execute o script de sincronização para popular o banco de dados.');
      return;
    }
    
    // Listar serviços
    console.log(' Listando serviços...');
    const servicos = await prisma.servico.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    // Exibir informações detalhadas sobre cada serviço
    servicos.forEach((servico, index) => {
      console.log(`\n Serviço #${index + 1}:`);
      console.log(`   ID: ${servico.id}`);
      console.log(`   Nome: ${servico.nome}`);
      console.log(`   Preço Base: R$ ${servico.preco_base?.toFixed(2) || 'N/A'}`);
      console.log(`   Descrição: ${servico.descricao?.substring(0, 50)}${servico.descricao?.length > 50 ? '...' : ''}`);
    });
    
    // Verificar ordem específica dos serviços
    console.log('\n Verificando ordem específica dos serviços...');
    const ordemEsperada = [
      "VLOG - Aventuras em Família",
      "VLOG - Amigos e Comunidade",
      "Cobertura Fotográfica de Evento Social",
      "Filmagem de Evento Social",
      "Ensaio Fotográfico de Família",
      "Filmagem Aérea com Drone",
      "Fotografia Aérea com Drone"
    ];
    
    // Verificar se todos os serviços esperados estão presentes
    const servicosEncontrados = servicos.map(s => s.nome);
    const servicosFaltando = ordemEsperada.filter(nome => !servicosEncontrados.includes(nome));
    
    if (servicosFaltando.length > 0) {
      console.warn(' ATENÇÃO: Alguns serviços esperados não foram encontrados:');
      servicosFaltando.forEach(nome => console.log(`   - ${nome}`));
    } else {
      console.log(' Todos os serviços esperados estão presentes!');
    }
    
    // Verificar serviços extras (não esperados)
    const servicosExtras = servicosEncontrados.filter(nome => !ordemEsperada.includes(nome));
    
    if (servicosExtras.length > 0) {
      console.log(' Serviços adicionais encontrados:');
      servicosExtras.forEach(nome => console.log(`   - ${nome}`));
    }
    
    console.log('\n Teste de conexão concluído com sucesso!');
  } catch (error) {
    console.error(' Erro ao testar conexão:', error);
    
    // Diagnóstico adicional baseado no tipo de erro
    if (error.code === 'P1001') {
      console.error(' Não foi possível conectar ao banco de dados. Verifique se o arquivo do banco existe e se o caminho está correto.');
    } else if (error.code === 'P1003') {
      console.error(' O banco de dados existe, mas a tabela "servico" não foi encontrada. Verifique se as migrações foram aplicadas.');
    } else if (error.code === 'P2021') {
      console.error(' A tabela "servico" não existe no banco de dados. Execute as migrações para criar a estrutura do banco.');
    }
    
    process.exit(1);
  } finally {
    // Desconectar do banco
    await prisma.$disconnect();
  }
}

// Executar o teste
testConnection()
  .catch(e => {
    console.error(' Erro não tratado:', e);
    process.exit(1);
  });
