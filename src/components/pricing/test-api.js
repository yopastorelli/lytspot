// Script para testar a comunicação com a API
import api from '../../services/api';

/**
 * Função para testar a comunicação com a API
 * @version 2.0.0 - Refatorado para usar serviço de API centralizado
 * @returns {Promise<Object>} Resultado do teste
 */
async function testAPI() {
  try {
    console.log('Testando comunicação com a API...');
    console.log(`URL base da API: ${api.defaults.baseURL}`);
    
    // Testar a API usando o serviço centralizado
    const response = await api.get('/api/pricing');
    console.log('Resposta da API:', response.data);
    
    return {
      success: true,
      data: response.data,
      baseUrl: api.defaults.baseURL
    };
  } catch (error) {
    console.error('Erro ao testar API:', error);
    
    // Informações detalhadas para diagnóstico
    const errorDetails = {
      message: error.message,
      baseUrl: api.defaults.baseURL
    };
    
    // Adicionar informações específicas de resposta se disponíveis
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.data = error.response.data;
    } else if (error.request) {
      errorDetails.request = 'Requisição enviada, mas sem resposta do servidor';
    }
    
    return {
      success: false,
      error: errorDetails
    };
  }
}

// Executar o teste
testAPI().then(result => {
  console.log('Resultado do teste:', result);
});

export default testAPI;
