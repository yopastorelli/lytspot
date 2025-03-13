/**
 * Script para sincronizar dados de demonstração com o banco de dados
 * @version 1.0.1 - 2025-03-13
 * @description Atualiza os dados de demonstração com base nos serviços atuais do banco de dados
 * Este script pode ser executado como parte do processo de build no Render
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar se estamos em ambiente de build (Render)
const isRenderBuild = process.env.RENDER === 'true' || process.argv.includes('--build');

/**
 * Função principal para atualizar dados de demonstração
 */
async function atualizarDadosDemonstracao() {
  try {
    console.log('\n🔄 Iniciando sincronização dos dados de demonstração...\n');
    
    // Verificar conexão com o banco de dados
    try {
      const totalServicos = await prisma.servico.count();
      console.log(`✅ Conexão com banco de dados estabelecida. Total de serviços: ${totalServicos}`);
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      if (isRenderBuild) {
        console.log('⚠️ Executando em ambiente de build, continuando com dados existentes...');
      } else {
        return;
      }
    }
    
    // Obter serviços do banco de dados
    let servicos = [];
    try {
      servicos = await prisma.servico.findMany({
        orderBy: { id: 'asc' }
      });
      
      if (servicos.length === 0 && !isRenderBuild) {
        console.error('❌ Nenhum serviço encontrado no banco de dados.');
        return;
      } else if (servicos.length === 0 && isRenderBuild) {
        console.log('⚠️ Nenhum serviço encontrado no banco de dados. Usando dados de seed...');
        // Importar definições de serviço do arquivo de seed
        try {
          const { serviceDefinitions } = await import('../models/seeds/serviceDefinitions.js');
          servicos = serviceDefinitions.map(servico => ({
            id: servico.id || Math.floor(Math.random() * 1000),
            ...servico
          }));
          console.log(`✅ Carregados ${servicos.length} serviços dos dados de seed.`);
        } catch (seedError) {
          console.error('❌ Erro ao carregar dados de seed:', seedError.message);
          return;
        }
      }
    } catch (error) {
      if (isRenderBuild) {
        console.log('⚠️ Erro ao buscar serviços, tentando usar dados de seed...');
        try {
          const { serviceDefinitions } = await import('../models/seeds/serviceDefinitions.js');
          servicos = serviceDefinitions.map(servico => ({
            id: servico.id || Math.floor(Math.random() * 1000),
            ...servico
          }));
          console.log(`✅ Carregados ${servicos.length} serviços dos dados de seed.`);
        } catch (seedError) {
          console.error('❌ Erro ao carregar dados de seed:', seedError.message);
          return;
        }
      } else {
        console.error('❌ Erro ao buscar serviços:', error.message);
        return;
      }
    }
    
    console.log(`📋 Processando ${servicos.length} serviços para sincronização.`);
    
    // Caminho para o arquivo de dados de demonstração
    const dadosDemonstracaoPath = path.resolve(__dirname, '../models/dadosDemonstracao.js');
    
    // Verificar se o arquivo existe
    try {
      await fs.access(dadosDemonstracaoPath);
      console.log(`✅ Arquivo de dados de demonstração encontrado: ${dadosDemonstracaoPath}`);
    } catch (error) {
      console.log('🔄 Criando novo arquivo de dados de demonstração...');
    }
    
    // Formatar os serviços para o formato de dados de demonstração
    const servicosFormatados = servicos.map(servico => {
      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco_base: servico.preco_base,
        duracao_media_captura: servico.duracao_media_captura,
        duracao_media_tratamento: servico.duracao_media_tratamento,
        entregaveis: servico.entregaveis,
        ativo: servico.ativo !== undefined ? servico.ativo : true
      };
    });
    
    // Criar o conteúdo do arquivo
    const conteudoArquivo = `/**
 * Dados de demonstração para serviços
 * @version 1.0.1 - ${new Date().toISOString().split('T')[0]}
 * @description Dados de fallback para quando o banco de dados não está disponível
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script atualizarDadosDemonstracao.js
 * Não edite manualmente!
 */

export const dadosDemonstracao = {
  servicos: ${JSON.stringify(servicosFormatados, null, 2)}
};
`;
    
    // Salvar o arquivo
    await fs.writeFile(dadosDemonstracaoPath, conteudoArquivo, 'utf8');
    
    console.log('✅ Dados de demonstração atualizados com sucesso!');
    
    // Atualizar também o arquivo de serviços para o simulador
    const servicosSimuladorPath = path.resolve(__dirname, '../../src/data/servicos.js');
    
    try {
      // Verificar se o diretório existe, se não, criar
      const servicosDir = path.dirname(servicosSimuladorPath);
      try {
        await fs.access(servicosDir);
      } catch (dirError) {
        await fs.mkdir(servicosDir, { recursive: true });
        console.log(`✅ Diretório criado: ${servicosDir}`);
      }
      
      // Criar o conteúdo do arquivo
      const conteudoSimulador = `/**
 * Dados de serviços para o simulador
 * @version 1.0.1 - ${new Date().toISOString().split('T')[0]}
 * @description Dados para o simulador de preços
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script atualizarDadosDemonstracao.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(servicosFormatados, null, 2)};
`;
      
      // Salvar o arquivo
      await fs.writeFile(servicosSimuladorPath, conteudoSimulador, 'utf8');
      
      console.log('✅ Dados do simulador atualizados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar arquivo de serviços do simulador:', error.message);
      if (isRenderBuild) {
        console.log('⚠️ Continuando processo de build...');
      }
    }
    
    console.log('\n✨ Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    if (isRenderBuild) {
      console.log('⚠️ Erro durante o build, mas continuando o processo...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
atualizarDadosDemonstracao()
  .then(() => {
    console.log('✅ Script finalizado com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    // Em ambiente de build, não queremos que o erro interrompa o processo
    if (isRenderBuild) {
      console.log('⚠️ Erro durante o build, mas continuando o processo...');
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
