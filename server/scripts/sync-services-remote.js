/**
 * Script para sincronização remota de serviços
 * @description Aciona o endpoint de API para sincronizar serviços em produção
 * @version 1.1.0 - 2025-03-15 - Atualizado para versão consistente com outros scripts
 * @usage node server/scripts/sync-services-remote.js
 */

import axios from 'axios';
import readline from 'readline';

// URL da API de produção
const PROD_API_URL = 'https://lytspot.onrender.com/api/admin-sync-services';

// Chave de API para autenticação (deve corresponder à chave no endpoint)
const API_KEY = 'lytspot-admin-2025';

/**
 * Interface de linha de comando para confirmar ações
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Solicita confirmação do usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @returns {Promise<boolean>} - True se confirmado, false caso contrário
 */
function confirmar(mensagem) {
  return new Promise((resolve) => {
    rl.question(`${mensagem} (s/N): `, (resposta) => {
      resolve(resposta.toLowerCase() === 's');
    });
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(80));
  console.log(`[sync-remote] Iniciando sincronização remota de serviços (v1.1.0) - ${new Date().toISOString()}`);
  console.log('='.repeat(80));
  
  // Aviso de segurança
  console.log('\n⚠️  ATENÇÃO: Este script irá sincronizar os serviços no ambiente de PRODUÇÃO! ⚠️\n');
  
  const confirmacao = await confirmar('Tem certeza que deseja continuar?');
  
  if (!confirmacao) {
    console.log('[sync-remote] Operação cancelada pelo usuário.');
    rl.close();
    return;
  }
  
  try {
    console.log(`[sync-remote] Enviando requisição para o endpoint de sincronização: ${PROD_API_URL}`);
    
    // Enviar requisição para o endpoint de sincronização
    const response = await axios.post(PROD_API_URL, {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      timeout: 60000 // 60 segundos de timeout
    });
    
    console.log('[sync-remote] Resposta recebida do servidor:');
    console.log('-'.repeat(80));
    
    // Formatar e exibir a resposta
    if (response.data) {
      if (response.data.sucesso) {
        console.log('✅ Sincronização concluída com sucesso!');
        console.log('\nEstatísticas:');
        
        const stats = response.data.estatisticas;
        console.log(`- Definições carregadas: ${stats.definicoes_carregadas}`);
        
        if (stats.banco_de_dados) {
          console.log(`- Banco de dados:`);
          console.log(`  - Serviços atualizados: ${stats.banco_de_dados.atualizados}`);
          console.log(`  - Serviços criados: ${stats.banco_de_dados.criados}`);
          console.log(`  - Erros: ${stats.banco_de_dados.erros}`);
        }
        
        console.log(`- Arquivo estático: ${stats.arquivo_estatico}`);
      } else {
        console.log('❌ Erro na sincronização:');
        console.log(response.data.mensagem);
        
        if (response.data.erro) {
          console.log('\nDetalhes do erro:');
          console.log(response.data.erro);
        }
      }
    } else {
      console.log('Resposta vazia do servidor.');
    }
    
    console.log('-'.repeat(80));
    console.log('[sync-remote] Processo de sincronização concluído.');
    
    // Instruções adicionais
    console.log('\nPróximos passos:');
    console.log('1. Verifique se os serviços foram atualizados corretamente acessando:');
    console.log('   https://lytspot.onrender.com/api/pricing');
    console.log('2. Teste o simulador de preços no site para confirmar que os dados estão corretos.');
    console.log('3. Remova o endpoint de administração após o uso para garantir a segurança.');
    
    rl.close();
  } catch (error) {
    console.error('[sync-remote] Erro ao sincronizar serviços:');
    
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error(`Status: ${error.response.status}`);
      console.error('Resposta do servidor:');
      console.error(error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Não foi possível obter resposta do servidor.');
      console.error('Verifique se o servidor está online e se o endpoint está disponível.');
    } else {
      // Erro ao configurar a requisição
      console.error(`Erro: ${error.message}`);
    }
    
    console.log('\nPossíveis soluções:');
    console.log('1. Verifique se o servidor está online.');
    console.log('2. Confirme se o endpoint de API foi implantado corretamente.');
    console.log('3. Verifique se a chave de API está correta.');
    console.log('4. Tente novamente mais tarde ou faça um deploy completo.');
    
    rl.close();
  }
}

// Executar função principal
main();
