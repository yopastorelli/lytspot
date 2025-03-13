/**
 * Script de teste da nova arquitetura
 * @description Verifica se todos os componentes da nova arquitetura estão funcionando corretamente
 * @version 1.0.0 - 2025-03-12
 */

import pricingService from '../services/pricingService.js';
import serviceRepository from '../repositories/serviceRepository.js';
import serviceTransformer from '../transformers/serviceTransformer.js';
import { seedDatabase } from '../models/seeds/index.js';
import environment from '../config/environment.js';

/**
 * Testa a camada de repositório
 */
async function testRepository() {
  console.log('\n🧪 Testando camada de repositório...');
  
  try {
    // Testar contagem
    const count = await serviceRepository.count();
    console.log(`✅ Contagem de serviços: ${count}`);
    
    // Testar busca de todos os serviços
    const services = await serviceRepository.findAll();
    console.log(`✅ Busca de serviços: ${services.length} serviços encontrados`);
    
    // Testar busca por ID (se houver serviços)
    if (services.length > 0) {
      const firstService = services[0];
      const serviceById = await serviceRepository.findById(firstService.id);
      console.log(`✅ Busca por ID: Serviço "${serviceById.nome}" encontrado`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar repositório:', error);
    return false;
  }
}

/**
 * Testa a camada de transformador
 */
async function testTransformer() {
  console.log('\n🧪 Testando camada de transformador...');
  
  try {
    // Obter um serviço do repositório para testar
    const services = await serviceRepository.findAll({ take: 1 });
    
    if (services.length === 0) {
      console.log('⚠️ Nenhum serviço encontrado para testar o transformador');
      return true;
    }
    
    const service = services[0];
    
    // Testar transformação para formato do simulador
    const transformedService = serviceTransformer.toSimulatorFormat(service);
    console.log('✅ Transformação para formato do simulador:');
    console.log(`   - Nome: ${transformedService.nome}`);
    console.log(`   - Preço base: ${transformedService.preco_base}`);
    console.log(`   - Duração média: ${transformedService.duracao_media}`);
    
    // Testar transformação para formato do banco de dados
    const dbFormat = serviceTransformer.toDatabaseFormat(transformedService);
    console.log('✅ Transformação para formato do banco de dados:');
    console.log(`   - Nome: ${dbFormat.nome}`);
    console.log(`   - Preço base: ${dbFormat.preco_base}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar transformador:', error);
    return false;
  }
}

/**
 * Testa a camada de serviço
 */
async function testService() {
  console.log('\n🧪 Testando camada de serviço...');
  
  try {
    // Testar busca de todos os serviços
    const services = await pricingService.getAllServices();
    console.log(`✅ Busca de serviços: ${services.length} serviços encontrados`);
    
    // Testar dados de demonstração
    const demoData = pricingService.getDemonstrationData();
    console.log(`✅ Dados de demonstração: ${demoData.length} serviços encontrados`);
    
    // Testar busca por ID (se houver serviços)
    if (services.length > 0) {
      const firstService = services[0];
      const serviceById = await pricingService.getServiceById(firstService.id);
      console.log(`✅ Busca por ID: Serviço "${serviceById.nome}" encontrado`);
      
      // Testar cálculo de preço
      const priceCalculation = await pricingService.calculatePrice(firstService.id, {});
      console.log(`✅ Cálculo de preço: ${priceCalculation.totalPrice}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar serviço:', error);
    return false;
  }
}

/**
 * Testa o módulo de ambiente
 */
function testEnvironment() {
  console.log('\n🧪 Testando módulo de ambiente...');
  
  try {
    console.log(`✅ Ambiente: ${environment.NODE_ENV}`);
    console.log(`✅ URL da API: ${environment.getApiUrl()}`);
    console.log(`✅ Origens permitidas: ${environment.getAllowedOrigins()}`);
    console.log(`✅ Diretório estático: ${environment.getStaticDir()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar módulo de ambiente:', error);
    return false;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando teste da nova arquitetura...');
  
  try {
    // Verificar se há serviços no banco de dados
    const count = await serviceRepository.count();
    
    // Se não houver serviços, executar seed
    if (count === 0) {
      console.log('⚠️ Nenhum serviço encontrado no banco de dados. Executando seed...');
      await seedDatabase({
        force: true,
        environment: 'development',
        syncDemoData: true
      });
    }
    
    // Testar cada camada
    const envResult = testEnvironment();
    const repoResult = await testRepository();
    const transformerResult = await testTransformer();
    const serviceResult = await testService();
    
    // Verificar resultados
    const allPassed = envResult && repoResult && transformerResult && serviceResult;
    
    if (allPassed) {
      console.log('\n✅ Todos os testes passaram! A nova arquitetura está funcionando corretamente.');
    } else {
      console.error('\n❌ Alguns testes falharam. Verifique os erros acima.');
    }
    
    return allPassed;
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error);
    return false;
  }
}

// Executar a função principal se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(success => {
      console.log(`\n${success ? '✅ Teste concluído com sucesso!' : '❌ Teste concluído com erros.'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro fatal durante execução do teste:', error);
      process.exit(1);
    });
}
