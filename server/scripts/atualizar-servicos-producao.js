/**
 * Script para atualização de serviços diretamente no banco de dados de produção
 * @version 1.0.0 - 2025-03-14
 * @description Atualiza serviços no banco de dados de produção usando a mesma conexão da API
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { loadServiceDefinitions } from '../utils/serviceDefinitionLoader.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// URL da API de produção
const PROD_API_URL = 'https://lytspot.onrender.com/api/pricing';
const PROD_CACHE_PURGE_URL = 'https://lytspot.onrender.com/api/cache/purge';

/**
 * Sanitiza os dados de um serviço para o formato do banco de dados
 * @param {Object} servicoData - Dados do serviço
 * @returns {Object} Dados sanitizados
 */
function sanitizeServiceData(servicoData) {
  console.log(`Sanitizando dados do serviço: ${servicoData.nome || 'Sem nome'}`);
  
  // Criar cópia para não modificar o objeto original
  const sanitizedData = { ...servicoData };
  
  // Garantir que o campo detalhes seja um objeto JSON válido
  let detalhesObj = {};
  
  if (sanitizedData.detalhes) {
    if (typeof sanitizedData.detalhes === 'string') {
      try {
        detalhesObj = JSON.parse(sanitizedData.detalhes);
      } catch (e) {
        console.warn(`Erro ao fazer parse do campo detalhes como JSON: ${e.message}`);
        detalhesObj = {};
      }
    } else if (typeof sanitizedData.detalhes === 'object') {
      detalhesObj = { ...sanitizedData.detalhes };
    } else {
      console.warn(`Campo detalhes com formato inesperado: ${typeof sanitizedData.detalhes}`);
      detalhesObj = {};
    }
  }
  
  // Garantir que os campos captura e tratamento estejam presentes no objeto detalhes
  if (!detalhesObj.captura && sanitizedData.duracao_media_captura) {
    detalhesObj.captura = sanitizedData.duracao_media_captura;
  }
  
  if (!detalhesObj.tratamento && sanitizedData.duracao_media_tratamento) {
    detalhesObj.tratamento = sanitizedData.duracao_media_tratamento;
  }
  
  // Garantir que os campos entregaveis, adicionais e deslocamento estejam presentes
  if (!detalhesObj.entregaveis && sanitizedData.entregaveis) {
    detalhesObj.entregaveis = sanitizedData.entregaveis;
  }
  
  if (!detalhesObj.adicionais && sanitizedData.possiveis_adicionais) {
    detalhesObj.adicionais = sanitizedData.possiveis_adicionais;
  }
  
  if (!detalhesObj.deslocamento && sanitizedData.valor_deslocamento) {
    detalhesObj.deslocamento = sanitizedData.valor_deslocamento;
  }
  
  // Converter o objeto detalhes para string JSON
  sanitizedData.detalhes = JSON.stringify(detalhesObj);
  
  // Garantir que o preço seja um número
  if (sanitizedData.preco_base) {
    sanitizedData.preco_base = Number(sanitizedData.preco_base);
  }
  
  return sanitizedData;
}

/**
 * Obtém os serviços da API de produção
 * @returns {Promise<Array>} Lista de serviços
 */
async function obterServicosDaApi() {
  console.log(`Consultando serviços da API de produção: ${PROD_API_URL}`);
  
  try {
    const response = await axios.get(PROD_API_URL);
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`Encontrados ${response.data.length} serviços na API de produção`);
      return response.data;
    } else {
      console.warn('API retornou dados inválidos ou vazios');
      return [];
    }
  } catch (error) {
    console.error(`Erro ao consultar API de produção: ${error.message}`);
    return [];
  }
}

/**
 * Limpa o cache da API de produção
 * @returns {Promise<boolean>} True se o cache foi limpo com sucesso
 */
async function limparCacheApi() {
  console.log(`Limpando cache da API de produção: ${PROD_CACHE_PURGE_URL}`);
  
  try {
    const response = await axios.post(PROD_CACHE_PURGE_URL, {
      paths: ['/api/pricing', '/api/services']
    });
    
    console.log(`Cache limpo com sucesso: ${response.status} ${response.statusText}`);
    return true;
  } catch (error) {
    console.error(`Erro ao limpar cache da API: ${error.message}`);
    return false;
  }
}

/**
 * Atualiza os serviços no banco de dados de produção
 */
async function atualizarServicosProducao() {
  console.log('='.repeat(80));
  console.log(`Iniciando atualização de serviços em produção - ${new Date().toISOString()}`);
  console.log('='.repeat(80));
  
  try {
    // Obter serviços da API de produção para diagnóstico
    const servicosAtuais = await obterServicosDaApi();
    
    // Carregar definições de serviços
    const definitionsPath = path.join(__dirname, '../models/seeds/serviceDefinitions.js');
    console.log(`Carregando definições de serviços de: ${definitionsPath}`);
    
    const serviceDefinitions = await loadServiceDefinitions(definitionsPath);
    
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || serviceDefinitions.length === 0) {
      console.error('Erro: Nenhuma definição de serviço encontrada ou formato inválido');
      process.exit(1);
    }
    
    console.log(`Carregadas ${serviceDefinitions.length} definições de serviços`);
    
    // Configuração para conexão com o banco de dados de produção
    console.log('Configurando conexão com o banco de dados de produção...');
    
    // Solicitar URL de conexão ao usuário
    console.log('\n⚠️ IMPORTANTE: Este script precisa da URL de conexão do banco de dados de produção.');
    console.log('Você pode encontrar esta URL nas configurações do seu serviço no Render.');
    console.log('Por favor, execute este script com a variável de ambiente DATABASE_URL definida:');
    console.log('DATABASE_URL=sua_url_de_conexao node server/scripts/atualizar-servicos-producao.js\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ Variável DATABASE_URL não definida. Impossível continuar.');
      process.exit(1);
    }
    
    // Inicializar cliente Prisma com a URL de conexão fornecida
    console.log('Inicializando cliente Prisma com a URL de conexão fornecida...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    // Testar conexão com o banco de dados
    console.log('Testando conexão com o banco de dados...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Obter serviços existentes no banco de dados
    console.log('Consultando serviços existentes no banco de dados...');
    const servicosExistentes = await prisma.servico.findMany();
    console.log(`Encontrados ${servicosExistentes.length} serviços no banco de dados`);
    
    // Mapear serviços existentes por nome para facilitar a busca
    const servicosPorNome = {};
    servicosExistentes.forEach(servico => {
      servicosPorNome[servico.nome] = servico;
    });
    
    // Contadores para estatísticas
    let atualizados = 0;
    let criados = 0;
    let erros = 0;
    
    // Processar cada definição de serviço
    console.log('\nProcessando definições de serviços...');
    
    for (const servico of serviceDefinitions) {
      try {
        // Sanitizar dados do serviço
        const dadosSanitizados = sanitizeServiceData(servico);
        
        // Verificar se o serviço já existe
        const servicoExistente = servicosPorNome[dadosSanitizados.nome];
        
        if (servicoExistente) {
          // Atualizar serviço existente
          console.log(`Atualizando serviço: ${dadosSanitizados.nome} (ID: ${servicoExistente.id})`);
          
          try {
            await prisma.servico.update({
              where: { id: servicoExistente.id },
              data: dadosSanitizados
            });
            
            console.log(`✅ Serviço atualizado com sucesso: ${dadosSanitizados.nome}`);
            atualizados++;
          } catch (updateError) {
            console.error(`❌ Erro ao atualizar serviço ${dadosSanitizados.nome}: ${updateError.message}`);
            
            // Tentar abordagem alternativa se o erro for relacionado ao campo detalhes
            if (updateError.message.includes('Unknown argument') || updateError.message.includes('detalhes')) {
              console.log(`Tentando abordagem alternativa para atualizar serviço ${dadosSanitizados.nome}...`);
              
              try {
                // Criar um objeto de atualização sem o campo detalhes
                const dadosBasicos = { ...dadosSanitizados };
                delete dadosBasicos.detalhes;
                
                // Atualizar primeiro os campos básicos
                await prisma.servico.update({
                  where: { id: servicoExistente.id },
                  data: dadosBasicos
                });
                
                // Depois atualizar apenas o campo detalhes
                await prisma.servico.update({
                  where: { id: servicoExistente.id },
                  data: { detalhes: dadosSanitizados.detalhes }
                });
                
                console.log(`✅ Serviço atualizado com abordagem alternativa: ${dadosSanitizados.nome}`);
                atualizados++;
              } catch (altError) {
                console.error(`❌ Erro na abordagem alternativa: ${altError.message}`);
                erros++;
              }
            } else {
              erros++;
            }
          }
        } else {
          // Criar novo serviço
          console.log(`Criando novo serviço: ${dadosSanitizados.nome}`);
          
          try {
            const novoServico = await prisma.servico.create({
              data: dadosSanitizados
            });
            
            console.log(`✅ Novo serviço criado: ${dadosSanitizados.nome} (ID: ${novoServico.id})`);
            criados++;
          } catch (createError) {
            console.error(`❌ Erro ao criar serviço ${dadosSanitizados.nome}: ${createError.message}`);
            erros++;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao processar serviço ${servico.nome || 'Sem nome'}: ${error.message}`);
        erros++;
      }
    }
    
    // Limpar cache da API
    await limparCacheApi();
    
    // Resumo da atualização
    console.log('\n='.repeat(80));
    console.log('Resumo da atualização:');
    console.log(`- Serviços processados: ${serviceDefinitions.length}`);
    console.log(`- Serviços atualizados: ${atualizados}`);
    console.log(`- Serviços criados: ${criados}`);
    console.log(`- Erros: ${erros}`);
    console.log('='.repeat(80));
    
    // Verificar serviços após atualização
    console.log('\nVerificando serviços após atualização...');
    const servicosAposAtualizacao = await prisma.servico.findMany();
    console.log(`Total de serviços no banco após atualização: ${servicosAposAtualizacao.length}`);
    
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
    
    console.log('\n✅ Processo de atualização concluído!');
    console.log('Para verificar se as alterações foram aplicadas, acesse:');
    console.log(`${PROD_API_URL}\n`);
  } catch (error) {
    console.error(`\n❌ Erro durante o processo de atualização: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar a função principal
atualizarServicosProducao()
  .catch(error => {
    console.error(`Erro fatal: ${error.message}`);
    process.exit(1);
  });
