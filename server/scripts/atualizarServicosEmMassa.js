/**
 * Script para atualização em massa de serviços
 * @version 1.0.0 - 2025-03-13
 * @description Permite atualizar múltiplos serviços de uma vez via linha de comando
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import readline from 'readline';
import { serviceDefinitions } from '../models/seeds/serviceDefinitions.js';
import serviceValidator from '../validators/serviceValidator.js';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Interface para leitura de entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
const pergunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
};

/**
 * Função principal para atualização em massa
 */
async function atualizarServicosEmMassa() {
  try {
    console.log('\n🔄 Iniciando ferramenta de atualização em massa de serviços...\n');
    
    // Verificar conexão com o banco de dados
    try {
      const totalServicos = await prisma.servico.count();
      console.log(`✅ Conexão com banco de dados estabelecida. Total de serviços: ${totalServicos}`);
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      return;
    }
    
    // Listar serviços disponíveis
    const servicos = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    if (servicos.length === 0) {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
      return;
    }
    
    console.log('\n📋 Serviços disponíveis:');
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id}) - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    // Perguntar quais serviços atualizar
    console.log('\n🔍 Selecione os serviços para atualização:');
    console.log('   Opções: "todos", números separados por vírgula (ex: "1,3,5"), ou intervalo (ex: "1-5")');
    
    const selecao = await pergunta('👉 Serviços: ');
    let servicosSelecionados = [];
    
    if (selecao.toLowerCase() === 'todos') {
      servicosSelecionados = servicos;
    } else if (selecao.includes('-')) {
      // Intervalo (ex: 1-5)
      const [inicio, fim] = selecao.split('-').map(num => parseInt(num.trim()) - 1);
      if (isNaN(inicio) || isNaN(fim) || inicio < 0 || fim >= servicos.length) {
        console.error('❌ Intervalo inválido. Use números dentro do intervalo disponível.');
        return;
      }
      for (let i = inicio; i <= fim; i++) {
        servicosSelecionados.push(servicos[i]);
      }
    } else {
      // Lista de números (ex: 1,3,5)
      const indices = selecao.split(',').map(num => parseInt(num.trim()) - 1);
      for (const indice of indices) {
        if (isNaN(indice) || indice < 0 || indice >= servicos.length) {
          console.error(`❌ Índice inválido: ${indice + 1}. Use números dentro do intervalo disponível.`);
          return;
        }
        servicosSelecionados.push(servicos[indice]);
      }
    }
    
    if (servicosSelecionados.length === 0) {
      console.log('❌ Nenhum serviço selecionado para atualização.');
      return;
    }
    
    console.log(`\n✅ ${servicosSelecionados.length} serviços selecionados para atualização.`);
    
    // Perguntar qual campo atualizar
    console.log('\n🔧 Qual campo deseja atualizar?');
    console.log('   1. Preço Base');
    console.log('   2. Descrição');
    console.log('   3. Duração Média (Captura)');
    console.log('   4. Duração Média (Tratamento)');
    console.log('   5. Entregáveis');
    
    const opcaoCampo = await pergunta('👉 Opção: ');
    let campoParaAtualizar;
    
    switch (opcaoCampo.trim()) {
      case '1':
        campoParaAtualizar = 'preco_base';
        break;
      case '2':
        campoParaAtualizar = 'descricao';
        break;
      case '3':
        campoParaAtualizar = 'duracao_media_captura';
        break;
      case '4':
        campoParaAtualizar = 'duracao_media_tratamento';
        break;
      case '5':
        campoParaAtualizar = 'entregaveis';
        break;
      default:
        console.error('❌ Opção inválida.');
        return;
    }
    
    // Perguntar o modo de atualização (valor fixo ou percentual)
    let modoAtualizacao = 'fixo';
    if (campoParaAtualizar === 'preco_base') {
      console.log('\n📊 Como deseja atualizar o preço?');
      console.log('   1. Valor fixo (mesmo valor para todos)');
      console.log('   2. Percentual (aumento/redução percentual)');
      
      const opcaoModo = await pergunta('👉 Opção: ');
      modoAtualizacao = opcaoModo.trim() === '2' ? 'percentual' : 'fixo';
    }
    
    // Perguntar o valor da atualização
    let valorAtualizacao;
    
    if (modoAtualizacao === 'percentual') {
      valorAtualizacao = await pergunta('👉 Percentual de ajuste (ex: 10 para +10%, -5 para -5%): ');
      valorAtualizacao = parseFloat(valorAtualizacao);
      
      if (isNaN(valorAtualizacao)) {
        console.error('❌ Percentual inválido. Use um número válido.');
        return;
      }
    } else {
      if (campoParaAtualizar === 'preco_base') {
        valorAtualizacao = await pergunta('👉 Novo valor (ex: 299.90): ');
        valorAtualizacao = parseFloat(valorAtualizacao);
        
        if (isNaN(valorAtualizacao) || valorAtualizacao < 0) {
          console.error('❌ Valor inválido. Use um número positivo.');
          return;
        }
      } else {
        valorAtualizacao = await pergunta('👉 Novo valor: ');
      }
    }
    
    // Confirmar a atualização
    console.log('\n⚠️ Resumo da atualização:');
    console.log(`   - Serviços: ${servicosSelecionados.map(s => s.nome).join(', ')}`);
    console.log(`   - Campo: ${campoParaAtualizar}`);
    
    if (modoAtualizacao === 'percentual') {
      console.log(`   - Ajuste: ${valorAtualizacao > 0 ? '+' : ''}${valorAtualizacao}%`);
    } else {
      if (campoParaAtualizar === 'preco_base') {
        console.log(`   - Novo valor: R$ ${valorAtualizacao.toFixed(2)}`);
      } else {
        console.log(`   - Novo valor: ${valorAtualizacao}`);
      }
    }
    
    const confirmacao = await pergunta('\n⚠️ Confirma a atualização? (s/n): ');
    
    if (confirmacao.toLowerCase() !== 's') {
      console.log('❌ Operação cancelada pelo usuário.');
      return;
    }
    
    // Executar a atualização
    console.log('\n🔄 Executando atualização...');
    
    const resultados = [];
    const erros = [];
    
    for (const servico of servicosSelecionados) {
      try {
        const dadosAtualizados = { ...servico };
        
        if (modoAtualizacao === 'percentual' && campoParaAtualizar === 'preco_base') {
          const percentual = valorAtualizacao / 100;
          const valorAtual = parseFloat(servico.preco_base);
          const aumento = valorAtual * percentual;
          dadosAtualizados.preco_base = valorAtual + aumento;
        } else {
          if (campoParaAtualizar === 'preco_base') {
            dadosAtualizados.preco_base = valorAtualizacao;
          } else {
            dadosAtualizados[campoParaAtualizar] = valorAtualizacao;
          }
        }
        
        // Sanitizar dados
        const dadosSanitizados = serviceValidator.sanitizeServiceData(dadosAtualizados);
        
        // Atualizar no banco de dados
        await prisma.servico.update({
          where: { id: servico.id },
          data: dadosSanitizados
        });
        
        resultados.push({
          id: servico.id,
          nome: servico.nome,
          status: 'atualizado'
        });
        
        console.log(`✅ Serviço atualizado: ${servico.nome} (ID: ${servico.id})`);
      } catch (error) {
        console.error(`❌ Erro ao atualizar serviço ${servico.nome} (ID: ${servico.id}):`, error.message);
        erros.push({
          id: servico.id,
          nome: servico.nome,
          erro: error.message
        });
      }
    }
    
    // Resumo da operação
    console.log('\n📊 Resumo da operação:');
    console.log(`   - Total de serviços processados: ${servicosSelecionados.length}`);
    console.log(`   - Serviços atualizados com sucesso: ${resultados.length}`);
    console.log(`   - Erros: ${erros.length}`);
    
    if (erros.length > 0) {
      console.log('\n❌ Serviços com erro:');
      erros.forEach(erro => {
        console.log(`   - ${erro.nome} (ID: ${erro.id}): ${erro.erro}`);
      });
    }
    
    console.log('\n✨ Operação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Executar a função principal
atualizarServicosEmMassa()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
