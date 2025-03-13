/**
 * Script para atualização em massa de serviços em ambiente de produção
 * @version 1.0.0 - 2025-03-13
 * @description Permite atualizar serviços em ambiente de produção de forma controlada
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuração da atualização
 * Modifique estas variáveis conforme necessário para sua atualização específica
 */
const CONFIG = {
  // Definir como true para executar a atualização, false para apenas simular
  EXECUTAR_ATUALIZACAO: false,
  
  // Filtro para selecionar quais serviços atualizar (null para todos)
  // Exemplos: { id: 1 } para um serviço específico, { ativo: true } para todos ativos
  FILTRO_SERVICOS: null,
  
  // Tipo de atualização de preço: 'fixo' ou 'percentual'
  TIPO_ATUALIZACAO_PRECO: 'percentual',
  
  // Valor para atualização de preço
  // Se TIPO_ATUALIZACAO_PRECO for 'fixo', este é o novo valor fixo
  // Se TIPO_ATUALIZACAO_PRECO for 'percentual', este é o percentual de ajuste (ex: 10 para +10%)
  VALOR_ATUALIZACAO_PRECO: 10,
  
  // Campos a atualizar (true para atualizar, false para manter)
  ATUALIZAR_CAMPOS: {
    preco_base: true,
    descricao: false,
    duracao_media_captura: false,
    duracao_media_tratamento: false,
    entregaveis: false
  },
  
  // Valores para os campos (ignorados se o respectivo campo em ATUALIZAR_CAMPOS for false)
  VALORES_CAMPOS: {
    descricao: "Nova descrição padrão",
    duracao_media_captura: "2 a 3 horas",
    duracao_media_tratamento: "até 7 dias úteis",
    entregaveis: "30 fotos editadas em alta resolução"
  },
  
  // Sincronizar dados de demonstração após a atualização
  SINCRONIZAR_DADOS: true
};

/**
 * Função principal para atualização em massa
 */
async function atualizarServicosEmMassa() {
  try {
    console.log('\n🔄 Iniciando atualização em massa de serviços em produção...\n');
    
    if (!CONFIG.EXECUTAR_ATUALIZACAO) {
      console.log('⚠️ MODO SIMULAÇÃO: Nenhuma alteração será salva no banco de dados.');
      console.log('⚠️ Para executar a atualização, altere CONFIG.EXECUTAR_ATUALIZACAO para true.\n');
    }
    
    // Verificar conexão com o banco de dados
    try {
      const totalServicos = await prisma.servico.count();
      console.log(`✅ Conexão com banco de dados estabelecida. Total de serviços: ${totalServicos}`);
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      return;
    }
    
    // Obter serviços com base no filtro
    const filtro = CONFIG.FILTRO_SERVICOS || {};
    const servicos = await prisma.servico.findMany({
      where: filtro,
      orderBy: { id: 'asc' }
    });
    
    if (servicos.length === 0) {
      console.error('❌ Nenhum serviço encontrado com os critérios especificados.');
      return;
    }
    
    console.log(`📋 Encontrados ${servicos.length} serviços para atualização.`);
    
    // Exibir serviços que serão atualizados
    console.log('\n📋 Serviços que serão atualizados:');
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id}) - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    // Exibir configuração da atualização
    console.log('\n⚙️ Configuração da atualização:');
    
    if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
      if (CONFIG.TIPO_ATUALIZACAO_PRECO === 'percentual') {
        console.log(`- Preço Base: Ajuste de ${CONFIG.VALOR_ATUALIZACAO_PRECO > 0 ? '+' : ''}${CONFIG.VALOR_ATUALIZACAO_PRECO}%`);
      } else {
        console.log(`- Preço Base: Valor fixo de R$ ${CONFIG.VALOR_ATUALIZACAO_PRECO.toFixed(2)}`);
      }
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
      console.log(`- Descrição: "${CONFIG.VALORES_CAMPOS.descricao}"`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
      console.log(`- Duração Média (Captura): "${CONFIG.VALORES_CAMPOS.duracao_media_captura}"`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
      console.log(`- Duração Média (Tratamento): "${CONFIG.VALORES_CAMPOS.duracao_media_tratamento}"`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
      console.log(`- Entregáveis: "${CONFIG.VALORES_CAMPOS.entregaveis}"`);
    }
    
    console.log(`- Sincronizar dados após atualização: ${CONFIG.SINCRONIZAR_DADOS ? 'Sim' : 'Não'}`);
    
    // Executar a atualização
    console.log('\n🔄 Executando atualização...');
    
    const resultados = [];
    const erros = [];
    
    for (const servico of servicos) {
      try {
        const dadosAtualizados = {};
        
        // Atualizar preço base
        if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
          if (CONFIG.TIPO_ATUALIZACAO_PRECO === 'percentual') {
            const percentual = CONFIG.VALOR_ATUALIZACAO_PRECO / 100;
            const valorAtual = parseFloat(servico.preco_base);
            const aumento = valorAtual * percentual;
            dadosAtualizados.preco_base = valorAtual + aumento;
          } else {
            dadosAtualizados.preco_base = CONFIG.VALOR_ATUALIZACAO_PRECO;
          }
        }
        
        // Atualizar outros campos
        if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
          dadosAtualizados.descricao = CONFIG.VALORES_CAMPOS.descricao;
        }
        
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
          dadosAtualizados.duracao_media_captura = CONFIG.VALORES_CAMPOS.duracao_media_captura;
        }
        
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
          dadosAtualizados.duracao_media_tratamento = CONFIG.VALORES_CAMPOS.duracao_media_tratamento;
        }
        
        if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
          dadosAtualizados.entregaveis = CONFIG.VALORES_CAMPOS.entregaveis;
        }
        
        // Exibir dados que serão atualizados
        console.log(`\n📝 Serviço: ${servico.nome} (ID: ${servico.id})`);
        console.log('   Dados atuais:');
        if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
          console.log(`   - Preço Base: R$ ${servico.preco_base.toFixed(2)}`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
          console.log(`   - Descrição: "${servico.descricao}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
          console.log(`   - Duração Média (Captura): "${servico.duracao_media_captura}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
          console.log(`   - Duração Média (Tratamento): "${servico.duracao_media_tratamento}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
          console.log(`   - Entregáveis: "${servico.entregaveis}"`);
        }
        
        console.log('   Novos dados:');
        if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
          console.log(`   - Preço Base: R$ ${dadosAtualizados.preco_base.toFixed(2)}`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
          console.log(`   - Descrição: "${dadosAtualizados.descricao}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
          console.log(`   - Duração Média (Captura): "${dadosAtualizados.duracao_media_captura}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
          console.log(`   - Duração Média (Tratamento): "${dadosAtualizados.duracao_media_tratamento}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
          console.log(`   - Entregáveis: "${dadosAtualizados.entregaveis}"`);
        }
        
        // Atualizar no banco de dados (se não estiver em modo simulação)
        if (CONFIG.EXECUTAR_ATUALIZACAO) {
          await prisma.servico.update({
            where: { id: servico.id },
            data: dadosAtualizados
          });
          
          console.log('   ✅ Serviço atualizado com sucesso!');
        } else {
          console.log('   ⚠️ SIMULAÇÃO: Serviço não foi atualizado.');
        }
        
        resultados.push({
          id: servico.id,
          nome: servico.nome,
          status: CONFIG.EXECUTAR_ATUALIZACAO ? 'atualizado' : 'simulado'
        });
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
    console.log(`   - Total de serviços processados: ${servicos.length}`);
    console.log(`   - Serviços atualizados com sucesso: ${resultados.length}`);
    console.log(`   - Erros: ${erros.length}`);
    
    if (erros.length > 0) {
      console.log('\n❌ Serviços com erro:');
      erros.forEach(erro => {
        console.log(`   - ${erro.nome} (ID: ${erro.id}): ${erro.erro}`);
      });
    }
    
    // Sincronizar dados de demonstração após a atualização
    if (CONFIG.SINCRONIZAR_DADOS && CONFIG.EXECUTAR_ATUALIZACAO) {
      console.log('\n🔄 Sincronizando dados de demonstração...');
      
      try {
        const { default: atualizarDadosDemonstracao } = await import('./atualizarDadosDemonstracao.js');
        await atualizarDadosDemonstracao();
        console.log('✅ Dados de demonstração sincronizados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao sincronizar dados de demonstração:', error.message);
      }
    }
    
    console.log('\n✨ Operação concluída!');
    
    if (!CONFIG.EXECUTAR_ATUALIZACAO) {
      console.log('\n⚠️ LEMBRETE: Esta foi apenas uma simulação. Nenhuma alteração foi salva no banco de dados.');
      console.log('⚠️ Para executar a atualização real, altere CONFIG.EXECUTAR_ATUALIZACAO para true e execute novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  } finally {
    await prisma.$disconnect();
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
