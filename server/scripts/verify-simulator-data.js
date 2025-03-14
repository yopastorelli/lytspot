/**
 * Script para verificar a transformação de dados do simulador de preços
 * @version 1.0.0 - 2025-03-14
 * @description Verifica se os dados retornados pela API estão no formato esperado pelo simulador de preços
 */

import axios from 'axios';
import chalk from 'chalk';

// URLs para teste
const DEV_API_URL = 'http://localhost:3001/api';
const PROD_API_URL = 'https://lytspot.onrender.com/api';

/**
 * Verifica a estrutura de um serviço
 * @param {Object} servico Serviço a ser verificado
 * @returns {Object} Resultado da verificação
 */
function verificarEstruturaServico(servico) {
  const camposObrigatorios = ['id', 'nome', 'descricao', 'preco_base', 'detalhes'];
  const camposDetalhes = ['captura', 'tratamento', 'entregaveis'];
  
  const resultado = {
    valido: true,
    camposFaltantes: [],
    detalhesInvalidos: false
  };
  
  // Verificar campos obrigatórios
  camposObrigatorios.forEach(campo => {
    if (servico[campo] === undefined) {
      resultado.valido = false;
      resultado.camposFaltantes.push(campo);
    }
  });
  
  // Verificar estrutura de detalhes
  if (servico.detalhes) {
    camposDetalhes.forEach(campo => {
      if (servico.detalhes[campo] === undefined) {
        resultado.valido = false;
        resultado.detalhesInvalidos = true;
        resultado.camposFaltantes.push(`detalhes.${campo}`);
      }
    });
  } else if (!resultado.camposFaltantes.includes('detalhes')) {
    resultado.valido = false;
    resultado.camposFaltantes.push('detalhes');
  }
  
  return resultado;
}

/**
 * Verifica os serviços retornados pela API
 * @param {string} apiUrl URL base da API
 * @param {string} ambiente Nome do ambiente (dev/prod)
 */
async function verificarServicos(apiUrl, ambiente) {
  console.log(chalk.blue.bold(`\n🔍 Verificando serviços em ${ambiente.toUpperCase()}...\n`));
  
  try {
    // Obter todos os serviços
    const response = await axios.get(`${apiUrl}/pricing`);
    const servicos = response.data;
    
    console.log(chalk.yellow(`Total de serviços: ${servicos.length}`));
    
    // Verificar estrutura de cada serviço
    let servicosValidos = 0;
    let servicosInvalidos = 0;
    const detalhesInvalidos = [];
    
    servicos.forEach((servico, index) => {
      const resultado = verificarEstruturaServico(servico);
      
      if (resultado.valido) {
        servicosValidos++;
      } else {
        servicosInvalidos++;
        detalhesInvalidos.push({
          id: servico.id || index,
          nome: servico.nome || 'N/A',
          problemas: resultado.camposFaltantes,
          detalhesInvalidos: resultado.detalhesInvalidos
        });
      }
    });
    
    // Exibir resultados
    if (servicosInvalidos === 0) {
      console.log(chalk.green(`✅ Todos os ${servicosValidos} serviços estão no formato correto!`));
    } else {
      console.log(chalk.red(`❌ ${servicosInvalidos} serviços com problemas de formato!`));
      console.log(chalk.yellow(`✅ ${servicosValidos} serviços no formato correto.`));
      
      console.log(chalk.red.bold('\nDetalhes dos serviços com problemas:'));
      detalhesInvalidos.forEach(servico => {
        console.log(chalk.yellow(`\nServiço: ${servico.nome} (ID: ${servico.id})`));
        console.log(`Campos faltantes: ${servico.problemas.join(', ')}`);
        
        if (servico.detalhesInvalidos) {
          console.log(chalk.red('⚠️ Estrutura de detalhes inválida ou incompleta!'));
        }
      });
    }
    
    return {
      total: servicos.length,
      validos: servicosValidos,
      invalidos: servicosInvalidos,
      detalhes: detalhesInvalidos
    };
  } catch (error) {
    console.log(chalk.red(`❌ Erro ao verificar serviços em ${ambiente}:`));
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Mensagem: ${error.response.statusText}`);
    } else {
      console.log(`Erro: ${error.message}`);
    }
    
    return {
      erro: error.message,
      status: error.response?.status
    };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log(chalk.blue.bold('🚀 Iniciando verificação de dados do simulador...\n'));
  
  // Verificar em desenvolvimento
  const resultadoDev = await verificarServicos(DEV_API_URL, 'desenvolvimento');
  
  // Verificar em produção
  const resultadoProd = await verificarServicos(PROD_API_URL, 'produção');
  
  // Exibir resumo
  console.log(chalk.blue.bold('\n📊 Resumo da verificação:\n'));
  
  if (resultadoDev.erro) {
    console.log(chalk.red(`❌ Erro ao verificar ambiente de desenvolvimento: ${resultadoDev.erro}`));
  } else {
    console.log(`Desenvolvimento: ${resultadoDev.invalidos === 0 ? chalk.green('✅ OK') : chalk.red('❌ Problemas')}`);
    console.log(`  Total: ${resultadoDev.total}, Válidos: ${resultadoDev.validos}, Inválidos: ${resultadoDev.invalidos}`);
  }
  
  if (resultadoProd.erro) {
    console.log(chalk.red(`❌ Erro ao verificar ambiente de produção: ${resultadoProd.erro}`));
  } else {
    console.log(`Produção: ${resultadoProd.invalidos === 0 ? chalk.green('✅ OK') : chalk.red('❌ Problemas')}`);
    console.log(`  Total: ${resultadoProd.total}, Válidos: ${resultadoProd.validos}, Inválidos: ${resultadoProd.invalidos}`);
  }
  
  // Exibir recomendações
  console.log(chalk.blue.bold('\n📋 Recomendações:\n'));
  
  if (resultadoDev.invalidos > 0 || resultadoProd.invalidos > 0) {
    console.log(chalk.yellow('1. Verifique a transformação de dados no controlador:'));
    console.log('   - Certifique-se de que o serviceTransformer está sendo aplicado em todos os endpoints');
    console.log('   - Verifique se todos os campos necessários estão sendo incluídos na transformação');
    
    console.log(chalk.yellow('\n2. Ações recomendadas:'));
    
    if (resultadoDev.invalidos > 0) {
      console.log('   - Corrija os problemas em desenvolvimento antes de implantar em produção');
    }
    
    if (resultadoProd.invalidos > 0) {
      console.log('   - Considere adiar a implantação até que todos os problemas sejam resolvidos');
      console.log('   - Ou implemente um fallback para garantir compatibilidade com o frontend');
    }
  } else {
    console.log(chalk.green('✅ Transformação de dados está funcionando corretamente em ambos os ambientes!'));
    console.log('Você pode prosseguir com a implantação em produção com confiança.');
  }
}

// Executar a função principal
main();
