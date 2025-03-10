// Script para testar a comunicação com a API
import axios from 'axios';

// Função para testar a API
async function testAPI() {
  try {
    console.log('Testando comunicação com a API...');
    
    // Testar a API local
    const localResponse = await axios.get('http://localhost:3000/api/pricing');
    console.log('Resposta da API local:', localResponse.data);
    
    return {
      success: true,
      data: localResponse.data
    };
  } catch (error) {
    console.error('Erro ao testar API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar o teste
testAPI().then(result => {
  console.log('Resultado do teste:', result);
});
