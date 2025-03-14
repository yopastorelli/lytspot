/**
 * Script de atualização de serviços específico para ambiente Render
 * @version 1.5.1 - 2025-03-14 - Corrigido tratamento do campo detalhes para compatibilidade com Prisma
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
const serviceDefinitionsPath = process.env.SERVICE_DEFINITIONS_PATH || (
  process.env.RENDER 
    ? path.join(projectRoot, 'server', 'models', 'seeds', 'updatedServiceDefinitions.js')
    : path.join(__dirname, '..', 'models', 'seeds', 'updatedServiceDefinitions.js')
);

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
    // Tentar criar o diretório de logs se não existir
    try {
      fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
      fs.appendFileSync(logFilePath, logMessage);
    } catch (mkdirError) {
      console.error(`Erro ao criar diretório de logs: ${mkdirError.message}`);
    }
  }
}

// Verificar versão do Node.js
const nodeVersion = process.version;
log('INFO', `Versão do Node.js: ${nodeVersion}`);

// Extrair a versão principal do Node.js (por exemplo, v18.x.x -> 18)
const majorVersion = parseInt(nodeVersion.match(/^v(\d+)\./)?.[1] || '0');
if (majorVersion < 18) {
  log('WARN', `Esta versão do Node.js (${nodeVersion}) pode não ser totalmente compatível com este script. Recomendado: v18+`);
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
        
        // Tentar importar o módulo
        try {
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
            
            // Se não encontrou exportações válidas, tentar extrair do conteúdo
            log('INFO', 'Tentando extrair definições do conteúdo do arquivo');
            return extrairDefinicoesDoConteudo(fileContent);
          }
        } catch (importError) {
          log('ERROR', `Erro ao importar módulo: ${importError.message}`);
          log('ERROR', importError.stack);
          
          // Tentar extrair definições diretamente do conteúdo do arquivo
          log('INFO', 'Tentando extrair definições do conteúdo do arquivo após falha no import');
          return extrairDefinicoesDoConteudo(fileContent);
        }
      } catch (urlError) {
        log('ERROR', `Erro ao criar URL do arquivo: ${urlError.message}`);
        log('ERROR', urlError.stack);
        
        // Tentar extrair definições diretamente do conteúdo do arquivo
        log('INFO', 'Tentando extrair definições do conteúdo do arquivo após falha na URL');
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
    
    // Procurar por array de definições (suporta diferentes formatos de exportação)
    const arrayMatches = [
      cleanContent.match(/export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\];/),
      cleanContent.match(/const\s+(\w+)\s*=\s*\[([\s\S]*?)\];\s*export/),
      cleanContent.match(/export\s+default\s*\[([\s\S]*?)\];/),
      cleanContent.match(/export\s+function\s+\w+\s*\(\s*\)\s*{\s*return\s*\[([\s\S]*?)\];\s*}/)
    ].filter(Boolean);
    
    log('INFO', `Encontrados ${arrayMatches.length} possíveis padrões de array no conteúdo`);
    
    // Tentar cada um dos padrões encontrados
    for (const arrayMatch of arrayMatches) {
      const arrayContent = arrayMatch[1] || arrayMatch[2];
      if (!arrayContent) continue;
      
      log('INFO', `Analisando conteúdo do array (primeiros 100 caracteres): ${arrayContent.substring(0, 100)}...`);
      
      // Usar uma abordagem mais robusta para extrair os objetos de serviço
      const servicosExtraidos = [];
      
      // Regex melhorada para capturar objetos completos
      const regex = /{(?:[^{}]|{[^{}]*})*nome\s*:\s*['"]([^'"]+)['"](?:[^{}]|{[^{}]*})*}/g;
      let match;
      let matchCount = 0;
      
      while ((match = regex.exec(arrayContent)) !== null) {
        matchCount++;
        const servicoStr = match[0];
        const nomeServico = match[1];
        log('INFO', `Encontrado serviço #${matchCount}: ${nomeServico}`);
        
        try {
          // Extrair propriedades do serviço
          const nome = extrairPropriedade(servicoStr, 'nome');
          const descricao = extrairPropriedade(servicoStr, 'descricao');
          
          // Tratar o preço base com mais robustez
          let preco_base = 0;
          const precoStr = extrairPropriedade(servicoStr, 'preco_base');
          if (precoStr) {
            // Remover qualquer caractere não numérico exceto ponto e vírgula
            const precoLimpo = precoStr.replace(/[^\d.,]/g, '').replace(',', '.');
            preco_base = parseFloat(precoLimpo) || 0;
          }
          
          const duracao_media_captura = extrairPropriedade(servicoStr, 'duracao_media_captura');
          const duracao_media_tratamento = extrairPropriedade(servicoStr, 'duracao_media_tratamento');
          const entregaveis = extrairPropriedade(servicoStr, 'entregaveis');
          const possiveis_adicionais = extrairPropriedade(servicoStr, 'possiveis_adicionais');
          const valor_deslocamento = extrairPropriedade(servicoStr, 'valor_deslocamento');
          
          // Calcular duração média total para compatibilidade com o frontend
          let duracao_media = 0;
          if (duracao_media_captura) {
            // Extrair o primeiro número da string (ex: "1 a 2 horas" -> 1)
            const capturaDias = parseInt(duracao_media_captura.match(/\d+/)?.[0] || '0');
            duracao_media += capturaDias;
          }
          if (duracao_media_tratamento) {
            // Extrair o primeiro número da string (ex: "até 7 dias" -> 7)
            const tratamentoDias = parseInt(duracao_media_tratamento.match(/\d+/)?.[0] || '0');
            duracao_media += tratamentoDias;
          }
          
          // Extrair detalhes com tratamento de erro melhorado
          let detalhes = {};
          try {
            const detalhesStr = extrairPropriedadeObjeto(servicoStr, 'detalhes');
            if (detalhesStr) {
              detalhes = {
                captura: extrairPropriedade(detalhesStr, 'captura') || duracao_media_captura,
                tratamento: extrairPropriedade(detalhesStr, 'tratamento') || duracao_media_tratamento,
                entregaveis: extrairPropriedade(detalhesStr, 'entregaveis') || entregaveis,
                adicionais: extrairPropriedade(detalhesStr, 'adicionais') || possiveis_adicionais,
                deslocamento: extrairPropriedade(detalhesStr, 'deslocamento') || valor_deslocamento
              };
            } else {
              // Se não encontrou o objeto detalhes, criar um a partir dos campos principais
              log('INFO', `Criando objeto detalhes para serviço ${nome} a partir dos campos principais`);
              detalhes = {
                captura: duracao_media_captura || '',
                tratamento: duracao_media_tratamento || '',
                entregaveis: entregaveis || '',
                adicionais: possiveis_adicionais || '',
                deslocamento: valor_deslocamento || ''
              };
            }
          } catch (detalhesError) {
            log('WARN', `Erro ao extrair detalhes para serviço ${nome}: ${detalhesError.message}`);
            // Criar objeto detalhes básico
            detalhes = {
              captura: duracao_media_captura || '',
              tratamento: duracao_media_tratamento || '',
              entregaveis: entregaveis || '',
              adicionais: possiveis_adicionais || '',
              deslocamento: valor_deslocamento || ''
            };
          }
          
          // Criar objeto de serviço
          const servico = {
            nome,
            descricao,
            preco_base,
            duracao_media_captura,
            duracao_media_tratamento,
            duracao_media: duracao_media || 5, // Valor padrão se não conseguir calcular
            entregaveis,
            possiveis_adicionais,
            valor_deslocamento,
            detalhes
          };
          
          log('INFO', `Serviço extraído: ${nome}, Preço: ${preco_base}, Duração: ${duracao_media}`);
          servicosExtraidos.push(servico);
        } catch (servicoError) {
          log('ERROR', `Erro ao processar serviço ${nomeServico}: ${servicoError.message}`);
        }
      }
      
      if (servicosExtraidos.length > 0) {
        log('INFO', `Extraídos ${servicosExtraidos.length} serviços do conteúdo`);
        return servicosExtraidos;
      } else {
        log('WARN', `Nenhum serviço extraído do padrão de array encontrado`);
      }
    }
    
    // Se chegou aqui, tentar uma abordagem ainda mais simples
    log('INFO', 'Tentando abordagem alternativa para extrair serviços');
    const servicosSimples = extrairServicosSimples(content);
    if (servicosSimples.length > 0) {
      log('INFO', `Extraídos ${servicosSimples.length} serviços usando método simples`);
      return servicosSimples;
    }
    
    log('WARN', 'Não foi possível extrair definições do conteúdo');
    return getBasicServices();
  } catch (error) {
    log('ERROR', `Erro ao extrair definições: ${error.message}`);
    log('ERROR', error.stack);
    return getBasicServices();
  }
}

/**
 * Extrai serviços usando uma abordagem mais simples
 * @param {string} content - Conteúdo do arquivo
 * @returns {Array} Array de serviços
 */
function extrairServicosSimples(content) {
  try {
    // Procurar por nomes de serviços
    const nomeRegex = /nome\s*:\s*['"]([^'"]+)['"]/g;
    const precoRegex = /preco_base\s*:\s*(\d+(?:\.\d+)?)/g;
    
    const nomes = [];
    let match;
    while ((match = nomeRegex.exec(content)) !== null) {
      nomes.push(match[1]);
    }
    
    const precos = [];
    while ((match = precoRegex.exec(content)) !== null) {
      precos.push(parseFloat(match[1]));
    }
    
    log('INFO', `Encontrados ${nomes.length} nomes e ${precos.length} preços`);
    
    if (nomes.length > 0) {
      return nomes.map((nome, index) => {
        const preco = index < precos.length ? precos[index] : 0;
        return {
          nome,
          descricao: `Serviço ${nome}`,
          preco_base: preco,
          duracao_media: 5,
          detalhes: {
            captura: '1 a 2 horas',
            tratamento: 'até 7 dias',
            entregaveis: 'Entrega digital',
            adicionais: 'Consulte opções adicionais',
            deslocamento: 'Sob consulta'
          }
        };
      });
    }
    
    return [];
  } catch (error) {
    log('ERROR', `Erro ao extrair serviços simples: ${error.message}`);
    return [];
  }
}

/**
 * Extrai o valor de uma propriedade de uma string de objeto
 * @param {string} str - String do objeto
 * @param {string} prop - Nome da propriedade
 * @returns {string} Valor da propriedade
 */
function extrairPropriedade(str, prop) {
  const regex = new RegExp(`${prop}\\s*:\\s*['"]([^'"]+)['\"]|${prop}\\s*:\\s*([0-9.]+)`, 'i');
  const match = str.match(regex);
  return match ? (match[1] || match[2] || '') : '';
}

/**
 * Extrai um objeto de uma string
 * @param {string} str - String do objeto principal
 * @param {string} prop - Nome da propriedade que contém o objeto
 * @returns {string} String do objeto
 */
function extrairPropriedadeObjeto(str, prop) {
  const inicio = str.indexOf(`${prop}:`);
  if (inicio === -1) return '';
  
  let contador = 0;
  let inicioObj = -1;
  let fimObj = -1;
  
  for (let i = inicio; i < str.length; i++) {
    if (str[i] === '{') {
      if (inicioObj === -1) inicioObj = i;
      contador++;
    } else if (str[i] === '}') {
      contador--;
      if (contador === 0) {
        fimObj = i;
        break;
      }
    }
  }
  
  if (inicioObj !== -1 && fimObj !== -1) {
    return str.substring(inicioObj, fimObj + 1);
  }
  
  return '';
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
 * @returns {Promise<boolean>} Resultado da operação
 */
async function limparCacheAPI() {
  log('INFO', 'Tentando limpar cache da API...');
  
  try {
    // Determinar a URL base
    const baseUrl = process.env.BASE_URL || (process.env.RENDER ? 'http://localhost:10000' : 'http://localhost:4321');
    const cacheUrl = `${baseUrl}/api/cache/clear`;
    
    log('INFO', `URL para limpeza de cache: ${cacheUrl}`);
    
    // Tentar limpar o cache (alterado para GET conforme implementação da rota)
    const response = await axios.get(cacheUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CACHE_SECRET || 'cache-secret-key'}`
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    if (response.status === 200) {
      log('INFO', 'Cache limpo com sucesso!');
      log('INFO', `Resposta: ${JSON.stringify(response.data)}`);
      return true;
    } else {
      log('WARN', `Falha ao limpar cache. Status: ${response.status}`);
      log('WARN', `Resposta: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log('ERROR', `Erro ao limpar cache: ${error.message}`);
    
    // Verificar se é um erro de conexão recusada
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect ECONNREFUSED')) {
      log('WARN', 'Servidor não está respondendo. Isso é normal se o servidor não estiver em execução durante o deploy.');
    } 
    // Verificar se é um erro de timeout
    else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      log('WARN', 'Timeout ao tentar limpar cache. O servidor pode estar sobrecarregado ou inacessível.');
    }
    
    log('INFO', 'Continuando sem limpar o cache...');
    return false;
  }
}

/**
 * Função principal para atualizar serviços
 */
async function atualizarServicos() {
  log('INFO', '=== ATUALIZANDO SERVIÇOS NO AMBIENTE RENDER ===');
  log('INFO', `Data e hora: ${new Date().toISOString()}`);
  log('INFO', `Ambiente: ${process.env.NODE_ENV}`);
  log('INFO', `RENDER: ${process.env.RENDER ? 'Sim' : 'Não'}`);
  log('INFO', `Diretório atual: ${process.cwd()}`);
  log('INFO', `Caminho do script: ${__filename}`);
  
  let prisma = null;
  
  try {
    // Obter definições de serviços
    const servicosDefinicoes = await obterDefinicaoServicos();
    log('INFO', `Obtidas ${servicosDefinicoes.length} definições de serviços`);
    
    // Configurar conexão com o banco de dados
    log('INFO', `Conectando ao banco de dados: ${process.env.DATABASE_URL}`);
    prisma = new PrismaClient({
      errorFormat: 'pretty',
      log: ['warn', 'error']
    });
    
    // Verificar conexão com o banco de dados
    try {
      log('INFO', 'Testando conexão com o banco de dados...');
      await prisma.$queryRaw`SELECT 1`;
      log('INFO', 'Conexão com o banco de dados estabelecida com sucesso!');
    } catch (dbError) {
      log('ERROR', `Erro ao conectar ao banco de dados: ${dbError.message}`);
      log('ERROR', dbError.stack);
      throw new Error(`Falha na conexão com o banco de dados: ${dbError.message}`);
    }

    // Listar nomes dos serviços para verificação
    log('INFO', 'Lista de serviços a serem atualizados:');
    servicosDefinicoes.forEach((servico, index) => {
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
    
    for (const servico of servicosDefinicoes) {
      // Verificar se o serviço já existe
      const servicoExistente = await prisma.servico.findFirst({
        where: {
          nome: servico.nome
        }
      });
      
      // Criar uma cópia do objeto serviço para manipulação
      const servicoParaSalvar = { ...servico };
      
      // Garantir que detalhes seja uma string JSON e não um objeto
      if (servicoParaSalvar.detalhes && typeof servicoParaSalvar.detalhes === 'object') {
        try {
          // Converter para string JSON
          servicoParaSalvar.detalhes = JSON.stringify(servicoParaSalvar.detalhes);
          log('INFO', `Convertido campo detalhes de objeto para string JSON para o serviço "${servicoParaSalvar.nome}"`);
        } catch (e) {
          log('WARN', `Erro ao converter detalhes para string JSON para o serviço "${servicoParaSalvar.nome}": ${e.message}`);
          servicoParaSalvar.detalhes = null; // Definir como null se não for possível converter
        }
      } else if (typeof servicoParaSalvar.detalhes === 'string') {
        // Verificar se é uma string JSON válida
        try {
          JSON.parse(servicoParaSalvar.detalhes);
          log('INFO', `Campo detalhes já é uma string JSON válida para o serviço "${servicoParaSalvar.nome}"`);
        } catch (e) {
          log('WARN', `Campo detalhes não é uma string JSON válida para o serviço "${servicoParaSalvar.nome}": ${e.message}`);
          servicoParaSalvar.detalhes = null; // Definir como null se não for uma string JSON válida
        }
      }
      
      if (servicoExistente) {
        // Verificar se há mudanças
        const mudancas = {};
        let temMudancas = false;
        
        // Se FORCE_UPDATE estiver ativo, forçar atualização sem verificar mudanças
        if (process.env.FORCE_UPDATE === 'true') {
          log('INFO', `Forçando atualização do serviço "${servico.nome}" (FORCE_UPDATE=true)`);
          temMudancas = true;
          // Usar todos os campos do serviço para a atualização forçada
          Object.keys(servicoParaSalvar).forEach(campo => {
            if (campo !== 'id') { // Excluir o campo ID
              mudancas[campo] = servicoParaSalvar[campo];
            }
          });
        } else {
          // Verificação normal de mudanças
          for (const campo in servico) {
            if (campo === 'detalhes') {
              // Comparar objetos de detalhes
              const detalhesAtuais = typeof servicoExistente.detalhes === 'string' && servicoExistente.detalhes
                ? JSON.parse(servicoExistente.detalhes) 
                : servicoExistente.detalhes;
                
              const detalhesNovos = typeof servico.detalhes === 'object'
                ? servico.detalhes
                : (typeof servico.detalhes === 'string' && servico.detalhes ? JSON.parse(servico.detalhes) : null);
                
              if (JSON.stringify(detalhesAtuais) !== JSON.stringify(detalhesNovos)) {
                mudancas.detalhes = typeof detalhesNovos === 'object' 
                  ? JSON.stringify(detalhesNovos) 
                  : detalhesNovos;
                temMudancas = true;
              }
            } else if (servicoExistente[campo] !== servico[campo]) {
              mudancas[campo] = servico[campo];
              temMudancas = true;
            }
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
            data: servicoParaSalvar
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
        
        try {
          const novoServico = await prisma.servico.create({
            data: servicoParaSalvar
          });
          
          log('INFO', `Serviço "${servico.nome}" criado com sucesso (ID: ${novoServico.id})`);
          criados++;
        } catch (createError) {
          log('ERROR', `Erro ao criar serviço "${servico.nome}": ${createError.message}`);
          log('INFO', `Dados do serviço: ${JSON.stringify(servicoParaSalvar, null, 2)}`);
          throw createError;
        }
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
    log('ERROR', `Erro durante atualização de serviços: ${error.message}`);
    log('ERROR', error.stack);
    
    // Registrar informações do ambiente para diagnóstico
    log('INFO', '=== INFORMAÇÕES DO AMBIENTE ===');
    log('INFO', `Node.js: ${process.version}`);
    log('INFO', `OS: ${process.platform} ${process.arch}`);
    log('INFO', `Memória: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`);
    
    // Listar variáveis de ambiente (exceto as sensíveis)
    const safeEnvVars = Object.keys(process.env)
      .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD') && !key.includes('TOKEN'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {});
    log('INFO', `Variáveis de ambiente: ${JSON.stringify(safeEnvVars, null, 2)}`);
    
    throw error; // Propagar erro
  } finally {
    // Fechar conexão com o banco de dados
    if (prisma) {
      log('INFO', 'Fechando conexão com o banco de dados...');
      await prisma.$disconnect();
    }
  }
}

// Executar a função principal
atualizarServicos().then(() => {
  log('INFO', '=== ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===');
  process.exit(0);
}).catch(error => {
  log('ERROR', `Erro fatal: ${error.message}`);
  log('ERROR', error.stack);
  log('ERROR', '=== ATUALIZAÇÃO FALHOU ===');
  process.exit(1);
});
