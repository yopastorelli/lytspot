/**
 * Script para sincronizar serviços entre o banco de dados e os dados de demonstração
 * @version 1.0.0 - 2025-03-13
 * @description Garante que os serviços no banco de dados estejam sincronizados com os dados de demonstração
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { getServiceDefinitionsForFrontend, updateDemonstrationService } from '../models/seeds/serviceDefinitions.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Configurações
const CONFIG = {
  ATUALIZAR_BANCO: true,
  ATUALIZAR_DEMONSTRACAO: true,
  REMOVER_DUPLICACOES: true,
  REORDENAR_SERVICOS: true,
  PRIORIZAR_VLOGS: true
};

async function main() {
  try {
    console.log('🔄 Iniciando processo de sincronização de serviços...');
    console.log(`📋 Configurações: ${JSON.stringify(CONFIG, null, 2)}`);
    
    // Verificar conexão com o banco de dados
    console.log('🔍 Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida.');
    
    // Consultar todos os serviços do banco
    console.log('📋 Consultando serviços no banco de dados...');
    const servicosBanco = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Total de serviços no banco: ${servicosBanco.length}`);
    
    // Obter dados de demonstração
    const servicosDemonstracao = getServiceDefinitionsForFrontend();
    console.log(`📋 Total de serviços na demonstração: ${servicosDemonstracao.length}`);
    
    // Remover duplicações (serviços com ID > 8)
    if (CONFIG.REMOVER_DUPLICACOES) {
      console.log('🧹 Verificando duplicações...');
      const servicosParaRemover = servicosBanco.filter(s => s.id > 8);
      
      if (servicosParaRemover.length > 0) {
        console.log(`📋 Encontrados ${servicosParaRemover.length} serviços duplicados para remover.`);
        
        for (const servico of servicosParaRemover) {
          await prisma.servico.delete({
            where: { id: servico.id }
          });
          console.log(`   ✅ Serviço ID ${servico.id} (${servico.nome}) removido com sucesso.`);
        }
      } else {
        console.log('✅ Não foram encontradas duplicações.');
      }
    }
    
    // Atualizar banco de dados com base nos dados de demonstração
    if (CONFIG.ATUALIZAR_BANCO) {
      console.log('🔄 Atualizando serviços no banco de dados...');
      
      // Re-consultar serviços após remoção de duplicações
      const servicosAtuais = await prisma.servico.findMany({
        orderBy: { id: 'asc' }
      });
      
      // Mapear IDs do banco para IDs da demonstração
      const mapaBancoParaDemonstracao = {};
      
      // Primeiro, mapear por ID
      servicosAtuais.forEach(servicoBanco => {
        const servicoDemonstracao = servicosDemonstracao.find(s => s.id === servicoBanco.id);
        if (servicoDemonstracao) {
          mapaBancoParaDemonstracao[servicoBanco.id] = servicoDemonstracao;
        }
      });
      
      // Depois, tentar mapear por nome para os que não foram mapeados por ID
      servicosAtuais.forEach(servicoBanco => {
        if (!mapaBancoParaDemonstracao[servicoBanco.id]) {
          const servicoDemonstracao = servicosDemonstracao.find(s => 
            s.nome.toLowerCase().includes(servicoBanco.nome.toLowerCase()) || 
            servicoBanco.nome.toLowerCase().includes(s.nome.toLowerCase())
          );
          if (servicoDemonstracao) {
            mapaBancoParaDemonstracao[servicoBanco.id] = servicoDemonstracao;
          }
        }
      });
      
      // Atualizar serviços no banco
      for (const servicoBanco of servicosAtuais) {
        const servicoDemonstracao = mapaBancoParaDemonstracao[servicoBanco.id];
        
        if (servicoDemonstracao) {
          console.log(`🔄 Atualizando serviço ID ${servicoBanco.id}: "${servicoBanco.nome}" -> "${servicoDemonstracao.nome}"`);
          
          await prisma.servico.update({
            where: { id: servicoBanco.id },
            data: {
              nome: servicoDemonstracao.nome,
              descricao: servicoDemonstracao.descricao,
              preco_base: servicoDemonstracao.preco_base,
              duracao_media_captura: servicoDemonstracao.duracao_media_captura,
              duracao_media_tratamento: servicoDemonstracao.duracao_media_tratamento,
              entregaveis: servicoDemonstracao.entregaveis,
              possiveis_adicionais: servicoDemonstracao.possiveis_adicionais,
              valor_deslocamento: servicoDemonstracao.valor_deslocamento
            }
          });
        } else {
          console.log(`⚠️ Não foi possível encontrar correspondência para o serviço ID ${servicoBanco.id}: "${servicoBanco.nome}"`);
        }
      }
    }
    
    // Reordenar serviços (colocar VLOGs no início)
    if (CONFIG.REORDENAR_SERVICOS && CONFIG.PRIORIZAR_VLOGS) {
      console.log('🔄 Reordenando serviços para priorizar VLOGs...');
      
      // Re-consultar serviços após atualizações
      const servicosAtualizados = await prisma.servico.findMany();
      
      // Separar VLOGs dos outros serviços
      const vlogs = servicosAtualizados.filter(s => s.nome.toLowerCase().includes('vlog'));
      const outrosServicos = servicosAtualizados.filter(s => !s.nome.toLowerCase().includes('vlog'));
      
      console.log(`📋 Encontrados ${vlogs.length} VLOGs para priorizar.`);
      
      // Atualizar dados de demonstração com a nova ordem
      if (CONFIG.ATUALIZAR_DEMONSTRACAO) {
        console.log('🔄 Atualizando dados de demonstração com a nova ordem...');
        
        // Criar nova lista de serviços com VLOGs no início
        const novaOrdem = [...vlogs, ...outrosServicos];
        
        // Atualizar cada serviço na demonstração
        for (let i = 0; i < novaOrdem.length; i++) {
          const servico = novaOrdem[i];
          updateDemonstrationService(servico.id, { id: i + 1, ...servico });
        }
      }
    }
    
    // Consultar serviços após todas as atualizações
    const servicosFinais = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('📋 Estado final dos serviços:');
    servicosFinais.forEach(servico => {
      console.log(`   ID ${servico.id}: ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    console.log('✅ Processo de sincronização concluído com sucesso!');
    console.log('⚠️ Para aplicar as alterações, reinicie o servidor de desenvolvimento.');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
