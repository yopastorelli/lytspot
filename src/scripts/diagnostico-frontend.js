/**
 * Script de diagnóstico para o frontend do simulador de preços
 * 
 * Este script simula a chamada à API e o processamento dos dados
 * para identificar por que apenas um serviço está sendo exibido.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { servicosAPI } from '../services/api';
import { getEnvironment } from '../utils/environment';

/**
 * Função para simular a chamada à API e processar os dados
 */
async function diagnosticarFrontend() {
  console.log('=== DIAGNÓSTICO DO FRONTEND DO SIMULADOR DE PREÇOS ===\n');
  
  try {
    const env = getEnvironment();
    console.log(`Ambiente: ${env.environment}`);
    console.log(`URL Base: ${env.baseUrl}`);
    
    // Simular a chamada à API
    console.log('\n1. Chamando API com simulador=true...');
    const response = await servicosAPI.listar({ simulador: true });
    
    // Verificar se a resposta contém dados válidos
    if (response && response.data && Array.isArray(response.data)) {
      console.log(`\n2. API retornou ${response.data.length} serviços:`);
      
      // Exibir informações detalhadas sobre cada serviço
      response.data.forEach((servico, index) => {
        console.log(`\n--- Serviço ${index + 1}: ${servico.nome} ---`);
        console.log(`ID: ${servico.id}`);
        console.log(`Descrição: ${servico.descricao ? servico.descricao.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`Preço base: ${servico.preco_base}`);
        
        // Verificar estrutura dos dados
        console.log('\nEstrutura dos dados:');
        console.log(`- detalhes: ${servico.detalhes ? 'Presente' : 'Ausente'}`);
        if (servico.detalhes) {
          console.log(`  - captura: ${servico.detalhes.captura || 'Ausente'}`);
          console.log(`  - tratamento: ${servico.detalhes.tratamento || 'Ausente'}`);
        }
        console.log(`- duracao_media_captura: ${servico.duracao_media_captura || 'Ausente'}`);
        console.log(`- duracao_media_tratamento: ${servico.duracao_media_tratamento || 'Ausente'}`);
      });
      
      // Verificar se há algum problema com os IDs dos serviços
      const ids = response.data.map(servico => servico.id);
      const idsUnicos = [...new Set(ids)];
      
      if (ids.length !== idsUnicos.length) {
        console.log('\n⚠️ ALERTA: Há IDs duplicados nos serviços!');
        console.log(`IDs: ${ids.join(', ')}`);
        console.log(`IDs únicos: ${idsUnicos.join(', ')}`);
      } else {
        console.log('\nVerificação de IDs: OK (todos os IDs são únicos)');
      }
      
      // Verificar se há algum problema com os nomes dos serviços
      const nomes = response.data.map(servico => servico.nome);
      const nomesUnicos = [...new Set(nomes)];
      
      if (nomes.length !== nomesUnicos.length) {
        console.log('\n⚠️ ALERTA: Há nomes duplicados nos serviços!');
        console.log(`Nomes: ${nomes.join(', ')}`);
        console.log(`Nomes únicos: ${nomesUnicos.join(', ')}`);
      } else {
        console.log('\nVerificação de nomes: OK (todos os nomes são únicos)');
      }
      
      // Verificar se todos os serviços têm as propriedades necessárias
      const servicosIncompletos = response.data.filter(servico => 
        !servico.id || !servico.nome || servico.preco_base === undefined
      );
      
      if (servicosIncompletos.length > 0) {
        console.log('\n⚠️ ALERTA: Há serviços com propriedades obrigatórias ausentes!');
        servicosIncompletos.forEach((servico, index) => {
          console.log(`Serviço ${index + 1}:`);
          console.log(`- ID: ${servico.id || 'Ausente'}`);
          console.log(`- Nome: ${servico.nome || 'Ausente'}`);
          console.log(`- Preço base: ${servico.preco_base !== undefined ? servico.preco_base : 'Ausente'}`);
        });
      } else {
        console.log('\nVerificação de propriedades obrigatórias: OK');
      }
    } else {
      console.log('\n⚠️ ALERTA: API retornou dados vazios ou inválidos!');
      console.log('Resposta:', response);
    }
  } catch (error) {
    console.error('\n❌ ERRO ao executar diagnóstico:', error);
  }
}

// Executar diagnóstico
diagnosticarFrontend()
  .then(() => console.log('\nDiagnóstico concluído.'))
  .catch(error => console.error('Erro fatal:', error));

export default diagnosticarFrontend;
