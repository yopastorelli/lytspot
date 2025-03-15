/**
 * Módulo para carregamento de definições de serviços
 * @version 1.1.0 - 2025-03-16 - Melhorada robustez e logs detalhados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Função para registrar logs com timestamp
 * @param {string} level - Nível do log (INFO, ERROR, etc)
 * @param {string} message - Mensagem do log
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
  
  // Se a função de log externa for fornecida, usá-la também
  if (typeof global.logFunction === 'function') {
    global.logFunction(level, message);
  }
}

/**
 * Carrega definições de serviços de um arquivo
 * @param {string} filePath - Caminho para o arquivo de definições
 * @param {Function} logFunction - Função de log opcional
 * @returns {Promise<Array>} Lista de definições de serviços
 */
export async function loadServiceDefinitions(filePath, logFunction) {
  // Se uma função de log for fornecida, armazená-la globalmente
  if (typeof logFunction === 'function') {
    global.logFunction = logFunction;
  }
  
  try {
    log('INFO', `Carregando definições de serviços de: ${filePath}`);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      log('ERROR', `Arquivo não encontrado: ${filePath}`);
      
      // Em ambiente de produção, não usar fallback silenciosamente
      if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
        throw new Error(`Arquivo de definições não encontrado: ${filePath}`);
      }
      
      log('WARN', 'Usando definições básicas como fallback (apenas em ambiente de desenvolvimento)');
      return loadBasicServiceDefinitions();
    }
    
    // Ler o conteúdo do arquivo
    const content = fs.readFileSync(filePath, 'utf8');
    log('INFO', `Arquivo lido com sucesso (${content.length} bytes)`);
    
    // Extrair definições do conteúdo
    const definitions = extractDefinitionsFromContent(content);
    
    if (Array.isArray(definitions) && definitions.length > 0) {
      log('INFO', `${definitions.length} definições de serviços carregadas com sucesso`);
      
      // Log detalhado para diagnóstico
      log('DEBUG', `Primeiro serviço: ${JSON.stringify(definitions[0].nome)}`);
      log('DEBUG', `Último serviço: ${JSON.stringify(definitions[definitions.length - 1].nome)}`);
      
      return definitions;
    } else {
      log('ERROR', 'Nenhuma definição de serviço encontrada no arquivo');
      
      // Em ambiente de produção, não usar fallback silenciosamente
      if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
        throw new Error('Nenhuma definição de serviço encontrada no arquivo');
      }
      
      log('WARN', 'Usando definições básicas como fallback (apenas em ambiente de desenvolvimento)');
      return loadBasicServiceDefinitions();
    }
  } catch (error) {
    log('ERROR', `Erro ao carregar definições de serviços: ${error.message}`);
    
    // Em ambiente de produção, propagar o erro
    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
      throw error;
    }
    
    log('WARN', 'Usando definições básicas como fallback (apenas em ambiente de desenvolvimento)');
    return loadBasicServiceDefinitions();
  }
}

/**
 * Extrai definições de serviços do conteúdo do arquivo
 * @param {string} content - Conteúdo do arquivo
 * @returns {Array} Lista de definições de serviços
 */
function extractDefinitionsFromContent(content) {
  try {
    log('INFO', 'Extraindo definições do conteúdo do arquivo');
    
    // Remover comentários e quebras de linha para facilitar a análise
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\n/g, ' ');
    
    // Procurar por array de definições (suporta diferentes formatos de exportação)
    const arrayMatches = [
      cleanContent.match(/export\s+const\s+serviceDefinitions\s*=\s*\[([\s\S]*?)\];/),
      cleanContent.match(/export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\];/),
      cleanContent.match(/const\s+(\w+)\s*=\s*\[([\s\S]*?)\];\s*export/),
      cleanContent.match(/export\s+default\s*\[([\s\S]*?)\];/),
      cleanContent.match(/export\s+function\s+\w+\s*\(\s*\)\s*{\s*return\s*\[([\s\S]*?)\];\s*}/)
    ].filter(Boolean);
    
    if (arrayMatches.length > 0) {
      // Usar o primeiro match encontrado
      const match = arrayMatches[0];
      const arrayContent = match[match.length - 1]; // Último grupo de captura contém o conteúdo do array
      
      log('INFO', `Padrão de array encontrado: ${match[0].substring(0, 50)}...`);
      
      // Usar Function para avaliar o conteúdo do array (mais seguro que eval)
      try {
        const tempFunction = new Function(`return [${arrayContent}]`);
        const result = tempFunction();
        
        log('INFO', `Array avaliado com sucesso, contém ${result.length} itens`);
        return result;
      } catch (evalError) {
        log('WARN', `Erro ao avaliar conteúdo do array: ${evalError.message}`);
        
        // Tentar abordagem alternativa com JSON
        try {
          // Converter para formato JSON
          const jsonString = `[${arrayContent}]`
            .replace(/(\w+):/g, '"$1":') // Converter propriedades para formato JSON
            .replace(/'/g, '"')          // Converter aspas simples para duplas
            .replace(/,(\s*[}\]])/g, '$1'); // Remover vírgulas extras
          
          const result = JSON.parse(jsonString);
          log('INFO', `JSON parseado com sucesso, contém ${result.length} itens`);
          return result;
        } catch (jsonError) {
          log('ERROR', `Erro ao fazer parse do JSON: ${jsonError.message}`);
          throw new Error('Não foi possível extrair definições do conteúdo');
        }
      }
    } else {
      log('WARN', 'Nenhum padrão de array de definições encontrado no conteúdo');
      
      // Tentar encontrar a função getServiceDefinitionsForFrontend
      const functionMatch = cleanContent.match(/getServiceDefinitionsForFrontend\s*\(\s*\)\s*{\s*.*?return\s+(.*?);\s*}/);
      if (functionMatch) {
        log('INFO', 'Encontrada função getServiceDefinitionsForFrontend, tentando extrair dados');
        
        // Verificar se retorna demonstrationData
        if (functionMatch[1].trim() === 'demonstrationData') {
          // Procurar pela definição de demonstrationData
          const demoDataMatch = cleanContent.match(/demonstrationData\s*=\s*\[([\s\S]*?)\];/);
          if (demoDataMatch) {
            try {
              const tempFunction = new Function(`return [${demoDataMatch[1]}]`);
              const result = tempFunction();
              log('INFO', `Dados de demonstração extraídos com sucesso, contém ${result.length} itens`);
              return result;
            } catch (error) {
              log('ERROR', `Erro ao extrair dados de demonstração: ${error.message}`);
            }
          }
        }
      }
      
      return [];
    }
  } catch (error) {
    log('ERROR', `Erro ao extrair definições: ${error.message}`);
    return [];
  }
}

/**
 * Carrega definições básicas de serviços (fallback)
 * @returns {Array} Lista básica de definições de serviços
 */
function loadBasicServiceDefinitions() {
  log('INFO', 'Carregando definições básicas de serviços');
  
  return [
    {
      nome: 'Pacote VLOG Family',
      descricao: 'Documentação em vídeo e foto da sua viagem em família.',
      preco_base: 1500.00,
      duracao_media_captura: '6 a 8 horas',
      duracao_media_tratamento: 'até 30 dias',
      entregaveis: 'Vídeo editado + Fotos em alta resolução',
      possiveis_adicionais: 'Horas Adicionais, Versão para Redes Sociais',
      valor_deslocamento: 'Sob consulta',
      detalhes: {
        captura: '6 a 8 horas',
        tratamento: 'até 30 dias',
        entregaveis: 'Vídeo editado + Fotos em alta resolução',
        adicionais: 'Horas Adicionais, Versão para Redes Sociais',
        deslocamento: 'Sob consulta'
      }
    },
    {
      nome: 'Ensaio Fotográfico Pessoal',
      descricao: 'Sessão individual em locação externa ou estúdio.',
      preco_base: 450.00,
      duracao_media_captura: '1 a 2 horas',
      duracao_media_tratamento: 'até 7 dias',
      entregaveis: '20 fotos em alta resolução',
      possiveis_adicionais: 'Fotos adicionais, Maquiagem',
      valor_deslocamento: 'Incluso em Curitiba',
      detalhes: {
        captura: '1 a 2 horas',
        tratamento: 'até 7 dias',
        entregaveis: '20 fotos em alta resolução',
        adicionais: 'Fotos adicionais, Maquiagem',
        deslocamento: 'Incluso em Curitiba'
      }
    }
  ];
}

// Exportar funções para uso em outros módulos
export default {
  loadServiceDefinitions,
  loadBasicServiceDefinitions
};
