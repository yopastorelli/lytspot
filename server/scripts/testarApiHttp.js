/**
 * Script para testar a API de serviços usando Axios
 * @version 1.0.0 - 2025-03-14
 * @description Testa a API de serviços diretamente usando Axios
 */

import axios from 'axios';

/**
 * Função para testar a API de serviços
 */
async function testarApi() {
  try {
    console.log('🚀 Iniciando teste da API de serviços...');
    
    // URL da API
    const apiUrl = 'http://localhost:3000/api/pricing';
    console.log(`📡 Fazendo requisição para: ${apiUrl}`);
    
    // Fazer requisição para a API
    const response = await axios.get(apiUrl);
    
    // Verificar resposta
    if (response.status === 200) {
      console.log(`✅ Requisição bem-sucedida! Status: ${response.status}`);
      
      // Verificar dados retornados
      const servicos = response.data;
      console.log(`✅ Total de serviços retornados: ${servicos.length}`);
      
      if (servicos.length > 0) {
        // Mostrar exemplo do primeiro serviço
        console.log('\nExemplo de serviço retornado pela API:');
        const exemploServico = servicos[0];
        console.log(JSON.stringify(exemploServico, null, 2));
        
        // Verificar se o campo detalhes está presente e tem a estrutura esperada
        if (exemploServico.detalhes) {
          console.log('\nVerificação da estrutura do campo detalhes:');
          console.log('- Campo captura:', exemploServico.detalhes.captura ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo tratamento:', exemploServico.detalhes.tratamento ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo entregaveis:', exemploServico.detalhes.entregaveis ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo adicionais:', exemploServico.detalhes.adicionais ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo deslocamento:', exemploServico.detalhes.deslocamento ? '✅ Presente' : '❌ Ausente');
        } else {
          console.log('\n❌ Campo detalhes ausente no serviço retornado pela API!');
        }
      } else {
        console.log('❌ Nenhum serviço retornado pela API.');
      }
    } else {
      console.error(`❌ Erro na requisição! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    // Verificar se o erro é de conexão recusada
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️ Não foi possível conectar ao servidor. Verifique se o servidor está em execução na porta 3000.');
    }
    
    // Verificar se há dados de resposta
    if (error.response) {
      console.log(`\n⚠️ Status do erro: ${error.response.status}`);
      console.log('⚠️ Dados do erro:', error.response.data);
    }
  }
}

// Executar a função
testarApi()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
