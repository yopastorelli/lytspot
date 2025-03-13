/**
 * Script de sincronização de dados entre ambientes
 * 
 * Este script gerencia a sincronização de dados entre o arquivo de demonstração
 * e o banco de dados, em ambas as direções.
 * 
 * @version 1.0.4 - 2025-03-14 - Melhorada a sincronização para garantir a ordem correta dos serviços
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ordem específica dos serviços conforme solicitado
const ORDEM_SERVICOS = [
  'VLOG - Aventuras em Família',
  'VLOG - Amigos e Comunidade',
  'Cobertura Fotográfica de Evento Social',
  'Filmagem de Evento Social',
  'Ensaio Fotográfico de Família',
  'Filmagem Aérea com Drone',
  'Fotografia Aérea com Drone'
];

/**
 * Sincroniza dados do arquivo de demonstração para o banco de dados
 * @param {PrismaClient} prisma - Cliente Prisma para operações no banco
 * @param {boolean} forceUpdate - Se true, atualiza serviços existentes
 * @param {boolean} deleteExisting - Se true, exclui todos os serviços antes de sincronizar
 * @returns {Object} Resultado da sincronização
 */
export async function syncServicesToDatabase(prisma, forceUpdate = false, deleteExisting = false) {
  try {
    console.log(`Iniciando sincronização de serviços para o banco de dados (forceUpdate=${forceUpdate}, deleteExisting=${deleteExisting})`);
    
    // Estatísticas da operação
    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      deleted: 0,
      errors: []
    };
    
    // Importar dados de demonstração
    const dadosDemoModule = await import('../../src/components/pricing/dadosDemonstracao.js');
    const servicosDemo = dadosDemoModule.servicos || [];
    
    if (!servicosDemo || !Array.isArray(servicosDemo) || servicosDemo.length === 0) {
      return {
        success: false,
        error: 'Dados de demonstração inválidos ou vazios',
        stats
      };
    }
    
    console.log(`Encontrados ${servicosDemo.length} serviços nos dados de demonstração`);
    
    // Se solicitado, excluir todos os serviços existentes
    if (deleteExisting) {
      console.log('Excluindo todos os serviços existentes...');
      const deletedCount = await prisma.servico.deleteMany({});
      stats.deleted = deletedCount.count;
      console.log(`${stats.deleted} serviços excluídos`);
    }
    
    // Processar cada serviço na ordem específica
    for (let i = 0; i < ORDEM_SERVICOS.length; i++) {
      const nomeServico = ORDEM_SERVICOS[i];
      const servicoDemo = servicosDemo.find(s => s.nome === nomeServico);
      
      if (!servicoDemo) {
        console.log(`Serviço "${nomeServico}" não encontrado nos dados de demonstração, pulando...`);
        continue;
      }
      
      try {
        // Verificar se o serviço já existe no banco
        const servicoExistente = await prisma.servico.findFirst({
          where: {
            nome: servicoDemo.nome
          }
        });
        
        if (servicoExistente) {
          // Se o serviço existe e forceUpdate é true, atualizar
          if (forceUpdate) {
            console.log(`Atualizando serviço existente: ${servicoDemo.nome}`);
            
            await prisma.servico.update({
              where: { id: servicoExistente.id },
              data: {
                nome: servicoDemo.nome,
                descricao: servicoDemo.descricao,
                preco_base: servicoDemo.preco_base,
                duracao_media_captura: servicoDemo.detalhes?.captura || null,
                duracao_media_tratamento: servicoDemo.detalhes?.tratamento || null,
                entregaveis: servicoDemo.detalhes?.entregaveis || null,
                possiveis_adicionais: servicoDemo.detalhes?.adicionais || null,
                valor_deslocamento: servicoDemo.detalhes?.deslocamento || null,
                ordem: i + 1, // Definir a ordem conforme a posição na lista ORDEM_SERVICOS
                updatedAt: new Date()
              }
            });
            
            stats.updated++;
          } else {
            // Mesmo sem atualizar outros campos, atualizar a ordem
            console.log(`Atualizando apenas a ordem do serviço: ${servicoDemo.nome}`);
            
            await prisma.servico.update({
              where: { id: servicoExistente.id },
              data: {
                ordem: i + 1, // Definir a ordem conforme a posição na lista ORDEM_SERVICOS
                updatedAt: new Date()
              }
            });
            
            stats.skipped++;
          }
        } else {
          // Se o serviço não existe, criar
          console.log(`Criando novo serviço: ${servicoDemo.nome}`);
          
          await prisma.servico.create({
            data: {
              nome: servicoDemo.nome,
              descricao: servicoDemo.descricao,
              preco_base: servicoDemo.preco_base,
              duracao_media_captura: servicoDemo.detalhes?.captura || '',
              duracao_media_tratamento: servicoDemo.detalhes?.tratamento || '',
              entregaveis: servicoDemo.detalhes?.entregaveis || '',
              possiveis_adicionais: servicoDemo.detalhes?.adicionais || '',
              valor_deslocamento: servicoDemo.detalhes?.deslocamento || '',
              ordem: i + 1 // Definir a ordem conforme a posição na lista ORDEM_SERVICOS
            }
          });
          
          stats.created++;
        }
      } catch (error) {
        console.error(`Erro ao processar serviço "${servicoDemo.nome}":`, error);
        stats.errors.push({
          servico: servicoDemo.nome,
          erro: error.message
        });
      }
    }
    
    // Processar serviços que não estão na ordem específica
    const servicosForaOrdem = servicosDemo.filter(s => !ORDEM_SERVICOS.includes(s.nome));
    
    if (servicosForaOrdem.length > 0) {
      console.log(`Processando ${servicosForaOrdem.length} serviços que não estão na ordem específica...`);
      
      // Continuar a partir do último índice da ordem específica
      let ordemAtual = ORDEM_SERVICOS.length;
      
      for (const servicoDemo of servicosForaOrdem) {
        try {
          // Verificar se o serviço já existe no banco
          const servicoExistente = await prisma.servico.findFirst({
            where: {
              nome: servicoDemo.nome
            }
          });
          
          if (servicoExistente) {
            // Se o serviço existe e forceUpdate é true, atualizar
            if (forceUpdate) {
              console.log(`Atualizando serviço existente (fora da ordem específica): ${servicoDemo.nome}`);
              
              await prisma.servico.update({
                where: { id: servicoExistente.id },
                data: {
                  nome: servicoDemo.nome,
                  descricao: servicoDemo.descricao,
                  preco_base: servicoDemo.preco_base,
                  duracao_media_captura: servicoDemo.detalhes?.captura || null,
                  duracao_media_tratamento: servicoDemo.detalhes?.tratamento || null,
                  entregaveis: servicoDemo.detalhes?.entregaveis || null,
                  possiveis_adicionais: servicoDemo.detalhes?.adicionais || null,
                  valor_deslocamento: servicoDemo.detalhes?.deslocamento || null,
                  ordem: ordemAtual + 1, // Definir a ordem após os serviços da ordem específica
                  updatedAt: new Date()
                }
              });
              
              stats.updated++;
            } else {
              // Mesmo sem atualizar outros campos, atualizar a ordem
              console.log(`Atualizando apenas a ordem do serviço (fora da ordem específica): ${servicoDemo.nome}`);
              
              await prisma.servico.update({
                where: { id: servicoExistente.id },
                data: {
                  ordem: ordemAtual + 1, // Definir a ordem após os serviços da ordem específica
                  updatedAt: new Date()
                }
              });
              
              stats.skipped++;
            }
          } else {
            // Se o serviço não existe, criar
            console.log(`Criando novo serviço (fora da ordem específica): ${servicoDemo.nome}`);
            
            await prisma.servico.create({
              data: {
                nome: servicoDemo.nome,
                descricao: servicoDemo.descricao,
                preco_base: servicoDemo.preco_base,
                duracao_media_captura: servicoDemo.detalhes?.captura || '',
                duracao_media_tratamento: servicoDemo.detalhes?.tratamento || '',
                entregaveis: servicoDemo.detalhes?.entregaveis || '',
                possiveis_adicionais: servicoDemo.detalhes?.adicionais || '',
                valor_deslocamento: servicoDemo.detalhes?.deslocamento || '',
                ordem: ordemAtual + 1 // Definir a ordem após os serviços da ordem específica
              }
            });
            
            stats.created++;
          }
          
          ordemAtual++;
        } catch (error) {
          console.error(`Erro ao processar serviço "${servicoDemo.nome}":`, error);
          stats.errors.push({
            servico: servicoDemo.nome,
            erro: error.message
          });
        }
      }
    }
    
    console.log('Sincronização para o banco de dados concluída');
    console.log(`Estatísticas: ${stats.created} criados, ${stats.updated} atualizados, ${stats.skipped} ignorados, ${stats.deleted} excluídos, ${stats.errors.length} erros`);
    
    return {
      success: stats.errors.length === 0,
      stats
    };
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sincroniza dados do banco de dados para o arquivo de demonstração
 * @param {PrismaClient} prisma - Cliente Prisma para operações no banco
 * @returns {Object} Resultado da sincronização
 */
export async function syncDatabaseToDemo(prisma) {
  try {
    console.log('Iniciando sincronização do banco de dados para o arquivo de demonstração');
    
    // Buscar todos os serviços ativos do banco de dados
    const servicos = await prisma.servico.findMany({
      orderBy: {
        ordem: 'asc' // Ordenar pela ordem definida
      }
    });
    
    if (!servicos || servicos.length === 0) {
      return {
        success: false,
        error: 'Nenhum serviço encontrado no banco de dados'
      };
    }
    
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    // Transformar os serviços para o formato do arquivo de demonstração
    const servicosTransformados = servicos.map(servico => {
      // Calcular a duração média aproximada baseada nos campos individuais
      const duracaoCaptura = parseInt(servico.duracao_media_captura?.split(' ')[0] || 0);
      const duracaoTratamento = parseInt(servico.duracao_media_tratamento?.split(' ')[0] || 0);
      const duracaoMedia = Math.max(1.5, (duracaoCaptura + duracaoTratamento) / 2) || 3; // Mínimo de 1.5 horas
      
      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco_base: servico.preco_base,
        duracao_media: duracaoMedia,
        detalhes: {
          captura: servico.duracao_media_captura || '',
          tratamento: servico.duracao_media_tratamento || '',
          entregaveis: servico.entregaveis || '',
          adicionais: servico.possiveis_adicionais || '',
          deslocamento: servico.valor_deslocamento || ''
        }
      };
    });
    
    // Caminho para o arquivo de dados de demonstração
    const caminhoArquivo = path.resolve(__dirname, '../../src/components/pricing/dadosDemonstracao.js');
    
    // Fazer backup do arquivo existente
    const dataHoraAtual = new Date().toISOString().replace(/[:.]/g, '-');
    const caminhoBackup = path.resolve(__dirname, `../../src/components/pricing/backup_dadosDemonstracao_${dataHoraAtual}.js`);
    
    try {
      const conteudoAtual = await fs.readFile(caminhoArquivo, 'utf8');
      await fs.writeFile(caminhoBackup, conteudoAtual, 'utf8');
      console.log(`Backup do arquivo de demonstração criado em: ${caminhoBackup}`);
    } catch (backupError) {
      console.warn('Aviso: Não foi possível criar backup do arquivo de demonstração:', backupError);
    }
    
    // Criar o conteúdo do arquivo
    const dataAtual = new Date().toISOString();
    const conteudoArquivo = `/**
 * Dados de demonstração para o simulador de preços
 * Gerado automaticamente em ${dataAtual}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE
 */

export const dadosDemonstracao = ${JSON.stringify(servicosTransformados, null, 2)};

export const servicos = dadosDemonstracao;

export default dadosDemonstracao;
`;
    
    // Escrever o arquivo
    await fs.writeFile(caminhoArquivo, conteudoArquivo, 'utf8');
    
    console.log(`Arquivo de demonstração atualizado com ${servicosTransformados.length} serviços`);
    
    return {
      success: true,
      message: `Sincronização concluída com sucesso (${servicosTransformados.length} serviços)`,
      count: servicosTransformados.length,
      backupPath: caminhoBackup
    };
  } catch (error) {
    console.error('Erro na sincronização do banco para arquivo de demonstração:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
