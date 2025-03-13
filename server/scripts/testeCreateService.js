/**
 * Script para testar a criação de serviços
 * 
 * Este script testa a criação de serviços utilizando o repositório de serviços
 * diretamente, simulando diferentes formatos de dados para garantir que a
 * sanitização e validação estejam funcionando corretamente.
 * 
 * @version 1.0.0 - 2025-03-12
 */

import serviceRepository from '../repositories/serviceRepository.js';
import chalk from 'chalk';

// Função para imprimir resultados formatados
const printResult = (testName, success, result) => {
  if (success) {
    console.log(chalk.green(`✓ ${testName}: Sucesso`));
    console.log(chalk.gray('  Resultado:'), result);
  } else {
    console.log(chalk.red(`✗ ${testName}: Falha`));
    console.log(chalk.gray('  Erro:'), result);
  }
  console.log();
};

// Função para executar os testes
const runTests = async () => {
  console.log(chalk.blue('=== Iniciando testes de criação de serviço ===\n'));
  
  // Teste 1: Criar serviço com dados completos e tipos corretos
  try {
    const servico1 = {
      nome: 'Serviço de Teste 1',
      descricao: 'Descrição do serviço de teste 1',
      preco_base: 100,
      duracao_media_captura: '1 hora',
      duracao_media_tratamento: '2 dias',
      entregaveis: '10 fotos',
      possiveis_adicionais: 'Fotos extras',
      valor_deslocamento: 'Gratuito até 10km'
    };
    
    const resultado1 = await serviceRepository.sanitizeServiceData(servico1);
    printResult('Teste 1: Dados completos e tipos corretos', true, resultado1);
  } catch (error) {
    printResult('Teste 1: Dados completos e tipos corretos', false, error.message);
  }
  
  // Teste 2: Criar serviço com preço como string
  try {
    const servico2 = {
      nome: 'Serviço de Teste 2',
      descricao: 'Descrição do serviço de teste 2',
      preco_base: '200',
      duracao_media_captura: '2 horas',
      duracao_media_tratamento: '3 dias',
      entregaveis: '20 fotos',
      possiveis_adicionais: 'Fotos extras, Álbum',
      valor_deslocamento: 'Gratuito até 15km'
    };
    
    const resultado2 = await serviceRepository.sanitizeServiceData(servico2);
    printResult('Teste 2: Preço como string', true, resultado2);
  } catch (error) {
    printResult('Teste 2: Preço como string', false, error.message);
  }
  
  // Teste 3: Criar serviço com campos faltando
  try {
    const servico3 = {
      nome: 'Serviço de Teste 3',
      descricao: 'Descrição do serviço de teste 3',
      preco_base: 300
      // Campos obrigatórios faltando
    };
    
    const resultado3 = await serviceRepository.sanitizeServiceData(servico3);
    printResult('Teste 3: Campos faltando', true, resultado3);
  } catch (error) {
    printResult('Teste 3: Campos faltando', false, error.message);
  }
  
  // Teste 4: Criar serviço com formato do simulador
  try {
    const servico4 = {
      nome: 'Serviço de Teste 4',
      descricao: 'Descrição do serviço de teste 4',
      preco_base: 400,
      duracao_media: 3,
      detalhes: {
        captura: '3 horas',
        tratamento: '4 dias',
        entregaveis: '30 fotos',
        adicionais: 'Fotos extras, Álbum, Vídeo',
        deslocamento: 'Gratuito até 20km'
      }
    };
    
    const resultado4 = await serviceRepository.sanitizeServiceData(servico4);
    printResult('Teste 4: Formato do simulador', true, resultado4);
  } catch (error) {
    printResult('Teste 4: Formato do simulador', false, error.message);
  }
  
  console.log(chalk.blue('=== Testes concluídos ==='));
};

// Executar os testes
runTests().catch(error => {
  console.error(chalk.red('Erro ao executar testes:'), error);
  process.exit(1);
});
