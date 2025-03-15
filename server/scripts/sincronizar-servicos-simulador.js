/**
 * Script para sincronizar os serviços do simulador
 * 
 * Este script garante que os serviços do simulador no banco de dados
 * correspondam exatamente aos definidos nos dados de demonstração,
 * corrigindo nomes, descrições e outros detalhes conforme necessário.
 * 
 * @version 1.0.0 - 2025-03-15
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { servicos as dadosDemonstracao } from '../../src/components/pricing/dadosDemonstracao.js';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

// Configuração para logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Arquivo de log
const logFile = path.resolve(logDir, 'sincronizacao-servicos.log');

// Lista de nomes de serviços que devem aparecer no simulador de preços
const SERVICOS_SIMULADOR = [
  'Cobertura Fotográfica de Evento Social',
  'Cobertura Fotográfica de Evento Corporativo',
  'Ensaio Fotográfico de Família',
  'Ensaio Fotográfico de Gestante',
  'VLOG - Aventuras em Família',
  'VLOG - Viagem em Família'
];

// Dados complementares para serviços que podem não existir nos dados de demonstração
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
 * Registra uma mensagem no log
 * @param {string} message Mensagem a ser registrada
 * @param {string} level Nível do log (info, warn, error)
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  // Escrever no console
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`ℹ️ ${message}`);
  }
  
  // Escrever no arquivo de log
  fs.appendFileSync(logFile, logMessage);
}

/**
 * Função principal para sincronizar os serviços do simulador
 */
async function sincronizarServicosSimulador() {
  console.log('=== SINCRONIZAÇÃO DE SERVIÇOS DO SIMULADOR ===\n');
  
  try {
    // Combinar dados de demonstração com dados complementares
    console.log('Combinando dados de demonstração com dados complementares...');
    const todosDados = [...dadosDemonstracao];
    
    // Adicionar dados complementares que não existem nos dados de demonstração
    for (const servicoComplementar of SERVICOS_COMPLEMENTARES) {
      if (!todosDados.some(s => s.nome === servicoComplementar.nome)) {
        console.log(`Adicionando dados complementares para "${servicoComplementar.nome}"`);
        todosDados.push(servicoComplementar);
      }
    }
    
    console.log(`Total de ${todosDados.length} serviços disponíveis para sincronização.`);
    
    // 1. Remover todos os serviços existentes que possam estar relacionados ao simulador
    console.log('1. Removendo serviços existentes que possam estar causando conflito...');
    
    // Primeiro, buscar todos os serviços existentes
    const todosServicos = await prisma.servico.findMany();
    console.log(`Encontrados ${todosServicos.length} serviços no banco de dados.`);
    
    // Lista para armazenar IDs de serviços a serem removidos
    const idsParaRemover = [];
    
    // Para cada serviço do simulador, verificar serviços similares
    for (const nomeServico of SERVICOS_SIMULADOR) {
      // Extrair palavras-chave do nome do serviço
      const palavrasChave = nomeServico.split(' ')
        .filter(palavra => palavra.length > 3)
        .map(palavra => palavra.toLowerCase());
      
      // Verificar cada serviço existente
      for (const servico of todosServicos) {
        // Verificar se o nome do serviço contém alguma das palavras-chave
        const nomeServicoLower = servico.nome.toLowerCase();
        
        // Se o nome for exatamente igual a um dos serviços do simulador, não remover
        if (SERVICOS_SIMULADOR.includes(servico.nome)) {
          console.log(`Serviço "${servico.nome}" (ID: ${servico.id}) é um serviço do simulador, mantendo.`);
          continue;
        }
        
        // Verificar se o nome contém alguma das palavras-chave
        const contemPalavraChave = palavrasChave.some(palavra => 
          nomeServicoLower.includes(palavra)
        );
        
        if (contemPalavraChave && !idsParaRemover.includes(servico.id)) {
          console.log(`Serviço "${servico.nome}" (ID: ${servico.id}) contém palavras-chave de "${nomeServico}", marcando para remoção.`);
          idsParaRemover.push(servico.id);
        }
      }
    }
    
    // Remover os serviços marcados
    if (idsParaRemover.length > 0) {
      console.log(`\nRemovendo ${idsParaRemover.length} serviços que podem estar causando conflito...`);
      
      for (const id of idsParaRemover) {
        try {
          const servicoRemovido = await prisma.servico.delete({
            where: { id }
          });
          console.log(`✅ Serviço "${servicoRemovido.nome}" (ID: ${servicoRemovido.id}) removido com sucesso.`);
        } catch (error) {
          console.error(`❌ Erro ao remover serviço ID ${id}: ${error.message}`);
        }
      }
    } else {
      console.log('\nNenhum serviço conflitante encontrado.');
    }
    
    // 2. Verificar quais serviços do simulador existem no banco de dados
    console.log('\n2. Verificando serviços do simulador no banco de dados...');
    
    const servicosSimulador = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    console.log(`Encontrados ${servicosSimulador.length} serviços do simulador no banco de dados:`);
    servicosSimulador.forEach(servico => {
      console.log(`- ${servico.nome} (ID: ${servico.id})`);
    });
    
    // 3. Criar serviços faltantes
    const nomesExistentes = servicosSimulador.map(servico => servico.nome);
    const servicosFaltantes = SERVICOS_SIMULADOR.filter(nome => !nomesExistentes.includes(nome));
    
    if (servicosFaltantes.length > 0) {
      console.log(`\n3. Criando ${servicosFaltantes.length} serviços faltantes:`);
      servicosFaltantes.forEach(nome => console.log(`- ${nome}`));
      
      for (const nomeServico of servicosFaltantes) {
        // Encontrar o serviço correspondente nos dados de demonstração
        let servicoDados = dadosDemonstracao.find(s => s.nome === nomeServico);
        
        if (!servicoDados) {
          // Buscar dados complementares
          const servicoComplementar = SERVICOS_COMPLEMENTARES.find(s => s.nome === nomeServico);
          if (servicoComplementar) {
            console.log(`Serviço "${nomeServico}" não encontrado nos dados de demonstração, utilizando dados complementares.`);
            servicoDados = servicoComplementar;
          } else {
            console.warn(`⚠️ Serviço "${nomeServico}" não encontrado nos dados de demonstração. Pulando.`);
            continue;
          }
        }
        
        // Preparar dados para criação
        const { id, ...dadosServico } = servicoDados;
        const dadosPreparados = prepareServiceDataForDatabase(dadosServico);
        
        // Criar serviço no banco de dados
        try {
          const novoServico = await prisma.servico.create({
            data: dadosPreparados
          });
          
          console.log(`✅ Serviço "${nomeServico}" criado com sucesso (ID: ${novoServico.id})`);
        } catch (error) {
          console.error(`❌ Erro ao criar serviço "${nomeServico}": ${error.message}`);
          
          // Tentar novamente com uma abordagem diferente se falhar
          console.log(`Tentando abordagem alternativa para criar "${nomeServico}"...`);
          
          try {
            // Simplificar os dados para aumentar as chances de sucesso
            const dadosSimplificados = {
              nome: dadosServico.nome,
              descricao: dadosServico.descricao || '',
              preco_base: parseFloat(dadosServico.preco_base) || 0,
              duracao_media_captura: dadosServico.detalhes?.captura || 'Sob consulta',
              duracao_media_tratamento: dadosServico.detalhes?.tratamento || 'Sob consulta',
              entregaveis: dadosServico.detalhes?.entregaveis || '',
              possiveis_adicionais: dadosServico.detalhes?.adicionais || '',
              valor_deslocamento: dadosServico.detalhes?.deslocamento || 'Sob consulta',
              detalhes: JSON.stringify(dadosServico.detalhes || {})
            };
            
            const novoServico = await prisma.servico.create({
              data: dadosSimplificados
            });
            
            console.log(`✅ Serviço "${nomeServico}" criado com sucesso usando abordagem alternativa (ID: ${novoServico.id})`);
          } catch (secondError) {
            console.error(`❌ Falha na segunda tentativa de criar "${nomeServico}": ${secondError.message}`);
          }
        }
      }
    } else {
      console.log('\n✅ Todos os serviços do simulador já existem no banco de dados.');
    }
    
    // 4. Atualizar serviços existentes para garantir que os dados estejam corretos
    console.log('\n4. Atualizando serviços existentes para garantir dados corretos...');
    
    // Buscar novamente os serviços do simulador após possíveis criações
    const servicosAtualizados = await prisma.servico.findMany({
      where: {
        nome: {
          in: SERVICOS_SIMULADOR
        }
      }
    });
    
    let servicosAtualizadosCount = 0;
    
    for (const servico of servicosAtualizados) {
      // Encontrar o serviço correspondente nos dados de demonstração
      let servicoDados = dadosDemonstracao.find(s => s.nome === servico.nome);
      
      if (!servicoDados) {
        // Buscar dados complementares
        const servicoComplementar = SERVICOS_COMPLEMENTARES.find(s => s.nome === servico.nome);
        if (servicoComplementar) {
          console.log(`Serviço "${servico.nome}" não encontrado nos dados de demonstração, utilizando dados complementares.`);
          servicoDados = servicoComplementar;
        } else {
          console.warn(`⚠️ Serviço "${servico.nome}" não encontrado nos dados de demonstração. Pulando atualização.`);
          continue;
        }
      }
      
      // Preparar dados para atualização
      const { id, ...dadosServico } = servicoDados;
      const dadosPreparados = prepareServiceDataForDatabase(dadosServico);
      
      // Atualizar serviço no banco de dados
      try {
        await prisma.servico.update({
          where: { id: servico.id },
          data: dadosPreparados
        });
        
        console.log(`✅ Serviço "${servico.nome}" (ID: ${servico.id}) atualizado com sucesso.`);
        servicosAtualizadosCount++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar serviço "${servico.nome}" (ID: ${servico.id}): ${error.message}`);
      }
    }
    
    console.log(`\n${servicosAtualizadosCount} serviços foram atualizados.`);
    
    // 5. Verificação final
    console.log('\n5. Verificação final dos serviços do simulador...');
    
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
      console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO! Todos os serviços do simulador estão presentes no banco de dados.');
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
      esperados: SERVICOS_SIMULADOR.length,
      criados: servicosFaltantes.length,
      atualizados: servicosAtualizadosCount,
      removidos: idsParaRemover.length
    };
  } catch (error) {
    console.error(`\n❌ Erro durante a sincronização: ${error.message}`);
    console.error(error.stack);
    
    return {
      error: error.message,
      stack: error.stack
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
sincronizarServicosSimulador()
  .then(resultado => {
    console.log('\n=== SINCRONIZAÇÃO CONCLUÍDA ===');
    console.log('Resultado:', resultado);
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
