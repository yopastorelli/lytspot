/**
 * Script para corrigir os serviços do simulador de preços
 * Este script:
 * 1. Remove todos os serviços existentes que possam estar relacionados ao simulador
 * 2. Cria novos serviços com os nomes exatos esperados pelo simulador
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { servicos as dadosDemonstracao } from '../../src/components/pricing/dadosDemonstracao.js';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

// Lista de serviços que devem aparecer no simulador
const SERVICOS_SIMULADOR = [
  'Cobertura Fotográfica de Evento Social',
  'Cobertura Fotográfica de Evento Corporativo',
  'Ensaio Fotográfico de Família',
  'Ensaio Fotográfico de Gestante',
  'VLOG - Aventuras em Família',
  'VLOG - Viagem em Família'
];

// Dados complementares para serviços que não existem nos dados de demonstração
const SERVICOS_COMPLEMENTARES = [
  {
    nome: 'Cobertura Fotográfica de Evento Corporativo',
    descricao: 'Registro fotográfico profissional para eventos corporativos, incluindo congressos, workshops, confraternizações e eventos empresariais.',
    preco_base: 900.00,
    detalhes: {
      captura: '4 a 6 horas',
      tratamento: 'até 10 dias',
      entregaveis: '300 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      adicionais: 'Horas Adicionais, Versão para Redes Sociais, Pendrive personalizado, Álbum Impresso',
      deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
    }
  },
  {
    nome: 'Ensaio Fotográfico de Gestante',
    descricao: 'Sessão fotográfica para gestantes, capturando a beleza deste momento especial. Pode ser realizado em estúdio ou ambiente externo.',
    preco_base: 550.00,
    detalhes: {
      captura: '1 a 2 horas',
      tratamento: 'até 10 dias',
      entregaveis: '70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      adicionais: 'Horas Adicionais, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso, Maquiagem',
      deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
    }
  },
  {
    nome: 'VLOG - Viagem em Família',
    descricao: 'Documentação em vídeo e foto da sua viagem em família. Ideal para viagens de vários dias, capturando os melhores momentos da sua aventura.',
    preco_base: 2500.00,
    detalhes: {
      captura: '2 a 3 dias',
      tratamento: 'até 45 dias',
      entregaveis: 'Vídeo editado de até 25 minutos + Vídeo Highlights (melhores momentos) de 2 minutos + 120 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
      adicionais: 'Dias Adicionais, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
      deslocamento: 'Sob consulta, dependendo da localidade'
    }
  }
];

/**
 * Função principal para corrigir os serviços do simulador
 */
async function corrigirServicosSimulador() {
  console.log('=== CORREÇÃO DE SERVIÇOS DO SIMULADOR ===\n');
  
  try {
    // 1. Remover todos os serviços existentes
    console.log('1. Removendo todos os serviços existentes...');
    
    const todosServicos = await prisma.servico.findMany();
    console.log(`Encontrados ${todosServicos.length} serviços no banco de dados.`);
    
    // Remover todos os serviços
    for (const servico of todosServicos) {
      try {
        await prisma.servico.delete({
          where: { id: servico.id }
        });
        console.log(`✅ Serviço "${servico.nome}" (ID: ${servico.id}) removido com sucesso.`);
      } catch (error) {
        console.error(`❌ Erro ao remover serviço "${servico.nome}" (ID: ${servico.id}): ${error.message}`);
      }
    }
    
    // 2. Criar os serviços do simulador
    console.log('\n2. Criando os serviços do simulador...');
    
    // Combinar dados de demonstração com dados complementares
    const todosDados = [
      ...dadosDemonstracao,
      ...SERVICOS_COMPLEMENTARES
    ];
    
    for (const nomeServico of SERVICOS_SIMULADOR) {
      // Encontrar o serviço correspondente nos dados
      const servicoDados = todosDados.find(s => s.nome === nomeServico);
      
      if (!servicoDados) {
        console.warn(`⚠️ Serviço "${nomeServico}" não encontrado nos dados. Pulando.`);
        continue;
      }
      
      // Preparar dados para criação
      const { id, ...dadosServico } = servicoDados;
      
      // Garantir que o campo detalhes esteja corretamente formatado
      let detalhes = dadosServico.detalhes || {};
      if (typeof detalhes === 'string') {
        try {
          detalhes = JSON.parse(detalhes);
        } catch (error) {
          console.warn(`⚠️ Erro ao fazer parse do campo detalhes para "${nomeServico}": ${error.message}`);
          detalhes = {};
        }
      }
      
      // Criar dados simplificados para evitar erros
      const dadosSimplificados = {
        nome: dadosServico.nome,
        descricao: dadosServico.descricao || '',
        preco_base: parseFloat(dadosServico.preco_base) || 0,
        duracao_media_captura: detalhes.captura || 'Sob consulta',
        duracao_media_tratamento: detalhes.tratamento || 'Sob consulta',
        entregaveis: detalhes.entregaveis || '',
        possiveis_adicionais: detalhes.adicionais || '',
        valor_deslocamento: detalhes.deslocamento || 'Sob consulta',
        detalhes: JSON.stringify(detalhes)
      };
      
      // Criar serviço no banco de dados
      try {
        const novoServico = await prisma.servico.create({
          data: dadosSimplificados
        });
        
        console.log(`✅ Serviço "${nomeServico}" criado com sucesso (ID: ${novoServico.id})`);
      } catch (error) {
        console.error(`❌ Erro ao criar serviço "${nomeServico}": ${error.message}`);
      }
    }
    
    // 3. Verificação final
    console.log('\n3. Verificação final dos serviços do simulador...');
    
    const servicosFinal = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`Encontrados ${servicosFinal.length} serviços do simulador no banco de dados:`);
    servicosFinal.forEach(servico => {
      console.log(`- ${servico.nome} (ID: ${servico.id})`);
    });
    
    if (servicosFinal.length === SERVICOS_SIMULADOR.length) {
      console.log('\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO! Todos os serviços do simulador estão presentes no banco de dados.');
    } else {
      console.warn(`\n⚠️ ATENÇÃO: Foram encontrados ${servicosFinal.length} serviços, mas deveriam ser ${SERVICOS_SIMULADOR.length}.`);
      
      const nomesFinal = servicosFinal.map(servico => servico.nome);
      const faltantesFinal = SERVICOS_SIMULADOR.filter(nome => !nomesFinal.includes(nome));
      
      if (faltantesFinal.length > 0) {
        console.warn('Serviços ainda faltantes:');
        faltantesFinal.forEach(nome => console.warn(`- ${nome}`));
      }
    }
    
    return {
      total: servicosFinal.length,
      esperados: SERVICOS_SIMULADOR.length
    };
  } catch (error) {
    console.error(`\n❌ Erro durante a correção: ${error.message}`);
    console.error(error.stack);
    return { error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
corrigirServicosSimulador()
  .then(resultado => {
    console.log('\n=== RESULTADO DA CORREÇÃO ===');
    console.log(resultado);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n=== ERRO NA CORREÇÃO ===');
    console.error(error);
    process.exit(1);
  });
