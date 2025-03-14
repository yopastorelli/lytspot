/**
 * Script de atualização de serviços específico para ambiente Render
 * @version 1.3.0 - 2025-03-14 - Corrigido problema de importação e adicionados logs detalhados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config();

// Configurar diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.env.RENDER ? '/opt/render/project/src' : path.resolve(__dirname, '..', '..');

// Caminho para o arquivo de definições de serviços (usando caminho absoluto no Render)
const serviceDefinitionsPath = process.env.RENDER 
  ? path.join(projectRoot, 'server', 'models', 'seeds', 'updatedServiceDefinitions.js')
  : path.join(__dirname, '..', 'models', 'seeds', 'updatedServiceDefinitions.js');

// Configurar logger
const logDir = path.join(process.env.RENDER ? projectRoot : __dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'render-update-services.log');

/**
 * Função para registrar logs com timestamp
 * @param {string} level - Nível do log (INFO, ERROR, etc)
 * @param {string} message - Mensagem do log
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // Registrar no console
  console.log(logMessage);
  
  // Registrar no arquivo
  try {
    fs.appendFileSync(logFilePath, logMessage);
  } catch (error) {
    console.error(`Erro ao escrever no arquivo de log: ${error.message}`);
  }
}

/**
 * Função para obter definições de serviços
 * @returns {Array} Array de definições de serviços
 */
async function obterDefinicaoServicos() {
  log('INFO', `Carregando definições de serviços de: ${serviceDefinitionsPath}`);
  log('INFO', `Diretório atual: ${process.cwd()}`);
  log('INFO', `Diretório do script: ${__dirname}`);
  log('INFO', `Raiz do projeto: ${projectRoot}`);
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(serviceDefinitionsPath)) {
      log('ERROR', `Arquivo de definições não encontrado: ${serviceDefinitionsPath}`);
      log('INFO', 'Verificando conteúdo do diretório...');
      
      // Verificar diretório seeds
      const seedsDir = process.env.RENDER 
        ? path.join(projectRoot, 'server', 'models', 'seeds')
        : path.join(__dirname, '..', 'models', 'seeds');
        
      if (fs.existsSync(seedsDir)) {
        const files = fs.readdirSync(seedsDir);
        log('INFO', `Arquivos encontrados no diretório seeds: ${files.join(', ')}`);
        
        // Tentar encontrar qualquer arquivo de definições
        for (const file of files) {
          if (file.includes('ServiceDefinition') || file.includes('serviceDefinition')) {
            log('INFO', `Encontrado possível arquivo de definições: ${file}`);
            const alternativePath = path.join(seedsDir, file);
            
            // Verificar conteúdo do arquivo
            try {
              const content = fs.readFileSync(alternativePath, 'utf8');
              log('INFO', `Conteúdo do arquivo ${file} (primeiros 200 caracteres): ${content.substring(0, 200)}...`);
              
              // Se o arquivo contém definições, usar este caminho
              if (content.includes('export') && (content.includes('ServiceDefinitions') || content.includes('serviceDefinitions'))) {
                log('INFO', `Usando arquivo alternativo: ${alternativePath}`);
                return await importarDefinicoes(alternativePath);
              }
            } catch (err) {
              log('ERROR', `Erro ao ler arquivo ${file}: ${err.message}`);
            }
          }
        }
      } else {
        log('ERROR', `Diretório seeds não encontrado: ${seedsDir}`);
      }
      
      log('WARN', 'Usando serviços básicos como fallback');
      return getBasicServices();
    }
    
    // Importar dinamicamente o módulo de definições de serviços
    return await importarDefinicoes(serviceDefinitionsPath);
  } catch (error) {
    log('ERROR', `Erro ao carregar definições de serviços: ${error.message}`);
    log('ERROR', error.stack);
    log('WARN', 'Usando serviços básicos como fallback');
    return getBasicServices();
  }
}

/**
 * Função para importar definições de serviços de um arquivo
 * @param {string} filePath - Caminho do arquivo
 * @returns {Array} Array de definições de serviços
 */
async function importarDefinicoes(filePath) {
  log('INFO', `Importando definições de: ${filePath}`);
  
  try {
    // Verificar conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    log('INFO', `Tamanho do arquivo: ${fileContent.length} bytes`);
    log('INFO', `Primeiros 200 caracteres: ${fileContent.substring(0, 200)}...`);
    
    // Determinar o formato de importação
    const useImport = process.env.NODE_ENV === 'production' || process.env.RENDER;
    
    if (useImport) {
      // Usar import dinâmico (ESM)
      log('INFO', `Usando import dinâmico para: ${filePath}`);
      try {
        // Converter para URL de arquivo
        const fileUrl = `file://${filePath}`;
        log('INFO', `URL do arquivo: ${fileUrl}`);
        
        const module = await import(fileUrl);
        log('INFO', `Módulo importado. Exportações: ${Object.keys(module).join(', ')}`);
        
        // Verificar diferentes formatos de exportação
        if (module.updatedServiceDefinitions && Array.isArray(module.updatedServiceDefinitions)) {
          log('INFO', 'Usando array updatedServiceDefinitions');
          return module.updatedServiceDefinitions;
        } else if (module.getUpdatedServiceDefinitions && typeof module.getUpdatedServiceDefinitions === 'function') {
          log('INFO', 'Usando função getUpdatedServiceDefinitions');
          return module.getUpdatedServiceDefinitions();
        } else if (module.default && Array.isArray(module.default)) {
          log('INFO', 'Usando array default');
          return module.default;
        } else if (module.default && typeof module.default === 'function') {
          log('INFO', 'Usando função default');
          return module.default();
        } else {
          // Tentar encontrar qualquer array exportado
          for (const key in module) {
            if (Array.isArray(module[key]) && module[key].length > 0 && module[key][0].nome) {
              log('INFO', `Usando array encontrado em '${key}'`);
              return module[key];
            }
          }
          
          log('WARN', 'Nenhuma exportação válida encontrada no módulo');
          return getBasicServices();
        }
      } catch (importError) {
        log('ERROR', `Erro ao importar módulo: ${importError.message}`);
        log('ERROR', importError.stack);
        
        // Tentar extrair definições diretamente do conteúdo do arquivo
        return extrairDefinicoesDoConteudo(fileContent);
      }
    } else {
      // Extrair definições diretamente do conteúdo do arquivo
      return extrairDefinicoesDoConteudo(fileContent);
    }
  } catch (error) {
    log('ERROR', `Erro ao importar definições: ${error.message}`);
    log('ERROR', error.stack);
    return getBasicServices();
  }
}

/**
 * Extrai definições de serviços diretamente do conteúdo do arquivo
 * @param {string} content - Conteúdo do arquivo
 * @returns {Array} Array de definições de serviços
 */
function extrairDefinicoesDoConteudo(content) {
  log('INFO', 'Tentando extrair definições diretamente do conteúdo do arquivo');
  
  try {
    // Remover comentários e quebras de linha para facilitar a análise
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\n/g, ' ');
    
    // Procurar por array de definições
    const arrayMatch = cleanContent.match(/export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\];/);
    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      log('INFO', `Encontrado array '${arrayName}' no conteúdo`);
      
      // Tentar avaliar o array (não seguro, mas é um fallback)
      try {
        // Criar um ambiente seguro para avaliar o código
        const tempFilePath = path.join(logDir, 'temp-definitions.js');
        fs.writeFileSync(tempFilePath, `export const ${arrayName} = ${arrayMatch[2]}];`);
        
        log('INFO', `Arquivo temporário criado: ${tempFilePath}`);
        
        // Importar o arquivo temporário
        const tempModule = await import(`file://${tempFilePath}`);
        const result = tempModule[arrayName];
        
        // Limpar arquivo temporário
        fs.unlinkSync(tempFilePath);
        
        if (Array.isArray(result) && result.length > 0) {
          log('INFO', `Extraídas ${result.length} definições do conteúdo`);
          return result;
        }
      } catch (evalError) {
        log('ERROR', `Erro ao avaliar array: ${evalError.message}`);
      }
    }
    
    log('WARN', 'Não foi possível extrair definições do conteúdo');
    return getBasicServices();
  } catch (error) {
    log('ERROR', `Erro ao extrair definições: ${error.message}`);
    return getBasicServices();
  }
}

/**
 * Função para obter serviços básicos (fallback)
 * @returns {Array} Array de serviços básicos
 */
function getBasicServices() {
  log('INFO', 'Usando definições de serviços básicos (fallback)');
  
  return [
    {
      nome: 'Ensaio Fotográfico Pessoal',
      descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal.',
      preco_base: 200.00,
      duracao_media_captura: '2 a 3 horas',
      duracao_media_tratamento: 'até 7 dias úteis',
      entregaveis: '20 fotos editadas em alta resolução',
      possiveis_adicionais: 'Edição avançada, maquiagem profissional',
      valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
      detalhes: {
        captura: '2 a 3 horas',
        tratamento: 'até 7 dias úteis',
        entregaveis: '20 fotos editadas em alta resolução',
        adicionais: 'Edição avançada, maquiagem profissional',
        deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      }
    },
    {
      nome: 'Ensaio Externo de Casal ou Família',
      descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos.',
      preco_base: 350.00,
      duracao_media_captura: '2 a 4 horas',
      duracao_media_tratamento: 'até 10 dias úteis',
      entregaveis: '30 fotos editadas em alta resolução',
      possiveis_adicionais: 'Álbum impresso, fotos adicionais',
      valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
      detalhes: {
        captura: '2 a 4 horas',
        tratamento: 'até 10 dias úteis',
        entregaveis: '30 fotos editadas em alta resolução',
        adicionais: 'Álbum impresso, fotos adicionais',
        deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      }
    },
    {
      nome: 'Fotografia de Eventos',
      descricao: 'Cobertura fotográfica de eventos sociais, corporativos ou festas, com entrega de galeria digital.',
      preco_base: 500.00,
      duracao_media_captura: '4 a 8 horas',
      duracao_media_tratamento: 'até 14 dias úteis',
      entregaveis: '100+ fotos editadas em alta resolução, galeria online',
      possiveis_adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
      valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km',
      detalhes: {
        captura: '4 a 8 horas',
        tratamento: 'até 14 dias úteis',
        entregaveis: '100+ fotos editadas em alta resolução, galeria online',
        adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
        deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
      }
    }
  ];
}

/**
 * Função para limpar o cache da API
 */
async function limparCacheAPI() {
  log('INFO', 'Limpando cache da API...');
  
  // Determinar a URL base da API
  const baseUrl = process.env.RENDER ? 'http://localhost:3000' : (process.env.BASE_URL || 'http://localhost:3000');
  log('INFO', `URL base para limpeza de cache: ${baseUrl}`);
  
  try {
    // Limpar cache específico de pricing
    log('INFO', 'Limpando cache de pricing...');
    await axios.get(`${baseUrl}/api/cache/clear?key=/api/pricing`);
    
    // Limpar cache completo para garantir
    log('INFO', 'Limpando cache completo...');
    await axios.get(`${baseUrl}/api/cache/clear`);
    
    // Verificar status do cache
    log('INFO', 'Verificando status do cache após limpeza...');
    const response = await axios.get(`${baseUrl}/api/cache/status`);
    log('INFO', `Status do cache: ${JSON.stringify(response.data)}`);
    
    log('INFO', 'Cache limpo com sucesso!');
  } catch (error) {
    log('ERROR', `Erro ao limpar cache: ${error.message}`);
    log('WARN', 'Falha ao limpar cache via API. Isso é esperado durante o deploy inicial.');
    log('INFO', 'Continuando com a atualização de serviços...');
  }
}

/**
 * Função principal para atualizar serviços
 */
async function atualizarServicos() {
  log('INFO', '=== ATUALIZANDO SERVIÇOS NO AMBIENTE RENDER ===');
  log('INFO', `Data e hora: ${new Date().toISOString()}`);
  log('INFO', `Ambiente: ${process.env.NODE_ENV || 'development'}`);
  log('INFO', `Render: ${process.env.RENDER ? 'Sim' : 'Não'}`);
  log('INFO', `Forçar atualização: ${process.env.FORCE_UPDATE === 'true' ? 'Sim' : 'Não'}`);
  
  // Verificar o caminho do banco de dados
  const databaseUrl = process.env.DATABASE_URL || 'file:../database.sqlite';
  log('INFO', `DATABASE_URL: ${databaseUrl}`);
  
  // Inicializar Prisma Client
  const prisma = new PrismaClient();
  
  try {
    // Testar conexão com o banco de dados
    log('INFO', 'Testando conexão com o banco de dados...');
    await prisma.$connect();
    log('INFO', 'Conexão estabelecida com sucesso');
    
    // Obter definições de serviços
    const servicosDemo = await obterDefinicaoServicos();
    log('INFO', `Obtidos ${servicosDemo.length} serviços de demonstração`);
    
    if (servicosDemo.length === 0) {
      log('ERROR', 'Nenhum serviço encontrado para atualização. Abortando.');
      return;
    }
    
    // Listar nomes dos serviços para verificação
    log('INFO', 'Lista de serviços a serem atualizados:');
    servicosDemo.forEach((servico, index) => {
      log('INFO', `${index + 1}. ${servico.nome}`);
    });
    
    // Verificar serviços existentes antes da atualização
    const servicosExistentesAntes = await prisma.servico.findMany({
      select: {
        id: true,
        nome: true,
        preco_base: true,
        updatedAt: true
      }
    });
    
    log('INFO', `Serviços existentes antes da atualização: ${servicosExistentesAntes.length}`);
    servicosExistentesAntes.forEach((servico, index) => {
      log('INFO', `${index + 1}. ID: ${servico.id}, Nome: ${servico.nome}, Preço: ${servico.preco_base}, Atualizado: ${servico.updatedAt}`);
    });
    
    // Atualizar serviços no banco de dados
    let atualizados = 0;
    let criados = 0;
    let semMudancas = 0;
    
    for (const servico of servicosDemo) {
      // Verificar se o serviço já existe
      const servicoExistente = await prisma.servico.findFirst({
        where: {
          nome: servico.nome
        }
      });
      
      // Garantir que detalhes seja um objeto JSON e não uma string
      if (typeof servico.detalhes === 'string') {
        try {
          servico.detalhes = JSON.parse(servico.detalhes);
          log('INFO', `Convertido campo detalhes de string para objeto para o serviço "${servico.nome}"`);
        } catch (e) {
          log('WARN', `Erro ao converter detalhes para JSON para o serviço "${servico.nome}": ${e.message}`);
          // Manter como string se não for possível converter
        }
      }
      
      if (servicoExistente) {
        // Verificar se há mudanças
        const mudancas = {};
        let temMudancas = false;
        
        for (const campo in servico) {
          if (campo === 'detalhes') {
            // Comparar objetos de detalhes
            const detalhesAtuais = typeof servicoExistente.detalhes === 'string' 
              ? JSON.parse(servicoExistente.detalhes) 
              : servicoExistente.detalhes;
              
            const detalhesNovos = typeof servico.detalhes === 'string'
              ? JSON.parse(servico.detalhes)
              : servico.detalhes;
              
            if (JSON.stringify(detalhesAtuais) !== JSON.stringify(detalhesNovos)) {
              mudancas.detalhes = detalhesNovos;
              temMudancas = true;
            }
          } else if (servicoExistente[campo] !== servico[campo]) {
            mudancas[campo] = servico[campo];
            temMudancas = true;
          }
        }
        
        if (temMudancas || process.env.FORCE_UPDATE === 'true') {
          // Atualizar serviço existente
          log('INFO', `Atualizando serviço "${servico.nome}" (ID: ${servicoExistente.id})`);
          
          if (Object.keys(mudancas).length > 0) {
            log('INFO', `Mudanças detectadas: ${Object.keys(mudancas).join(', ')}`);
          } else {
            log('INFO', 'Forçando atualização sem mudanças detectadas');
          }
          
          await prisma.servico.update({
            where: {
              id: servicoExistente.id
            },
            data: servico
          });
          
          log('INFO', `Serviço "${servico.nome}" atualizado com sucesso (ID: ${servicoExistente.id})`);
          atualizados++;
        } else {
          log('INFO', `Nenhuma mudança detectada para o serviço "${servico.nome}" (ID: ${servicoExistente.id})`);
          semMudancas++;
        }
      } else {
        // Criar novo serviço
        log('INFO', `Criando novo serviço "${servico.nome}"`);
        
        const novoServico = await prisma.servico.create({
          data: servico
        });
        
        log('INFO', `Serviço "${servico.nome}" criado com sucesso (ID: ${novoServico.id})`);
        criados++;
      }
    }
    
    // Contar total de serviços após atualização
    const totalServicos = await prisma.servico.count();
    log('INFO', `Total de serviços após atualização: ${totalServicos}`);
    log('INFO', `Serviços atualizados: ${atualizados}, Serviços criados: ${criados}, Serviços sem mudanças: ${semMudancas}`);
    
    // Listar todos os serviços após atualização
    const servicosAtuais = await prisma.servico.findMany({
      select: {
        id: true,
        nome: true,
        preco_base: true,
        updatedAt: true
      }
    });
    
    log('INFO', 'Serviços atuais no banco de dados:');
    servicosAtuais.forEach((servico, index) => {
      log('INFO', `${index + 1}. ID: ${servico.id}, Nome: ${servico.nome}, Preço: ${servico.preco_base}, Atualizado: ${servico.updatedAt}`);
    });
    
    // Limpar cache da API
    await limparCacheAPI();
    
    log('INFO', '=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===');
  } catch (error) {
    log('ERROR', `Erro durante a atualização: ${error.message}`);
    log('ERROR', error.stack);
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    log('INFO', 'Desconectado do banco de dados');
  }
}

// Executar a função principal
atualizarServicos().catch(error => {
  log('ERROR', `Erro fatal: ${error.message}`);
  log('ERROR', error.stack);
  process.exit(1);
});
