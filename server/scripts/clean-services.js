/**
 * Script para limpar o banco de dados, mantendo apenas os serviços definidos em serviceDefinitions.js
 * @version 1.0.0 - 2025-03-15
 */
import { PrismaClient } from '@prisma/client';
import { serviceDefinitions } from '../models/seeds/serviceDefinitions.js';
import dotenv from 'dotenv';
import { updateDatabaseServices } from './update-services-all.js';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Limpa o banco de dados, removendo serviços que não estão definidos em serviceDefinitions.js
 */
async function cleanServices() {
  console.log('🧹 Iniciando limpeza do banco de dados de serviços...');
  
  try {
    // 1. Obter todos os serviços do banco de dados
    const servicosExistentes = await prisma.servico.findMany();
    console.log(`📊 Encontrados ${servicosExistentes.length} serviços no banco de dados.`);
    
    // 2. Criar um mapa de serviços por nome para facilitar a busca
    const servicosPorNome = {};
    serviceDefinitions.forEach(service => {
      servicosPorNome[service.nome] = service;
    });
    
    // 3. Identificar serviços que não estão nas definições
    const servicosParaRemover = servicosExistentes.filter(
      servico => !servicosPorNome[servico.nome]
    );
    
    console.log(`🔍 Identificados ${servicosParaRemover.length} serviços para remover.`);
    
    if (servicosParaRemover.length > 0) {
      console.log('📝 Serviços que serão removidos:');
      servicosParaRemover.forEach(servico => {
        console.log(`   - ID: ${servico.id}, Nome: ${servico.nome}`);
      });
      
      // 4. Remover serviços não definidos
      const idsParaRemover = servicosParaRemover.map(servico => servico.id);
      
      await prisma.servico.deleteMany({
        where: {
          id: {
            in: idsParaRemover
          }
        }
      });
      
      console.log(`✅ ${servicosParaRemover.length} serviços foram removidos com sucesso.`);
    } else {
      console.log('✅ Não há serviços para remover. O banco de dados já está limpo.');
    }
    
    // 5. Verificar serviços restantes
    const servicosRestantes = await prisma.servico.findMany();
    console.log(`📊 Restaram ${servicosRestantes.length} serviços no banco de dados.`);
    
    // 6. Executar o script de atualização para garantir que todos os serviços definidos estão no banco
    console.log('\n🔄 Executando atualização para garantir que todos os serviços definidos estão no banco...');
    await updateDatabaseServices();
    
    console.log('\n✨ Processo de limpeza e atualização concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza do banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanServices()
    .then(() => {
      console.log('🏁 Script finalizado.');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

// Exportar para uso em outros scripts
export { cleanServices };
