/**
 * Atualizador Universal de Serviços para Lytspot
 * @description Script unificado para atualizar serviços em todos os ambientes
 * @version 1.0.0 - 2025-03-15
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Configuração de ambiente
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

// Caminho para o arquivo de definições de serviços
const serviceDefinitionsPath = path.join(rootDir, 'server', 'models', 'seeds', 'serviceDefinitions.js');

// Caminho para o arquivo de serviços do simulador
const simulatorServicesPath = path.join(rootDir, 'src', 'data', 'servicos.js');

// Inicializar o cliente Prisma
const prisma = new PrismaClient();

/**
 * Carrega as definições de serviços do arquivo
 * @returns {Promise<Array>} Array de definições de serviços
 */
async function loadServiceDefinitions() {
  try {
    console.log(`[update-services] Carregando definições de serviços de: ${serviceDefinitionsPath}`);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(serviceDefinitionsPath);
    } catch (error) {
      console.error(`[update-services] Arquivo de definições não encontrado: ${serviceDefinitionsPath}`);
      return [];
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = await fs.readFile(serviceDefinitionsPath, 'utf8');
    
    // Extrair o array de definições usando regex
    const match = fileContent.match(/export const serviceDefinitions = (\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
      console.error('[update-services] Não foi possível extrair as definições de serviços do arquivo');
      return [];
    }
    
    // Avaliar o array extraído
    const definitionsArray = eval(match[1]);
    console.log(`[update-services] Carregadas ${definitionsArray.length} definições de serviços`);
    
    return definitionsArray;
  } catch (error) {
    console.error('[update-services] Erro ao carregar definições de serviços:', error);
    return [];
  }
}

/**
 * Atualiza os serviços no banco de dados local
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<Object>} Estatísticas de atualização
 */
async function updateLocalDatabase(services) {
  console.log('[update-services] Atualizando serviços no banco de dados local...');
  
  let stats = {
    atualizados: 0,
    criados: 0,
    erros: 0
  };
  
  try {
    // Buscar serviços existentes
    const existingServices = await prisma.servico.findMany();
    console.log(`[update-services] Encontrados ${existingServices.length} serviços no banco de dados local`);
    
    // Criar mapa de serviços por nome
    const servicesByName = {};
    existingServices.forEach(service => {
      servicesByName[service.nome] = service;
    });
    
    // Processar cada serviço
    for (const service of services) {
      try {
        // Preparar dados para o banco
        const serviceData = prepareServiceForDatabase(service);
        
        // Verificar se o serviço já existe
        const existingService = servicesByName[service.nome];
        
        if (existingService) {
          // Atualizar serviço existente
          await prisma.servico.update({
            where: { id: existingService.id },
            data: serviceData
          });
          console.log(`[update-services] Serviço atualizado no banco local: ${service.nome}`);
          stats.atualizados++;
        } else {
          // Criar novo serviço
          await prisma.servico.create({
            data: serviceData
          });
          console.log(`[update-services] Serviço criado no banco local: ${service.nome}`);
          stats.criados++;
        }
      } catch (error) {
        console.error(`[update-services] Erro ao processar serviço ${service.nome}:`, error);
        stats.erros++;
      }
    }
    
    console.log(`[update-services] Atualização do banco local concluída: ${stats.atualizados} atualizados, ${stats.criados} criados, ${stats.erros} erros`);
    return stats;
  } catch (error) {
    console.error('[update-services] Erro ao atualizar banco de dados local:', error);
    return stats;
  }
}

/**
 * Autentica na API de produção e obtém um token JWT
 * @returns {Promise<string|null>} Token JWT ou null em caso de erro
 * @version 1.0.0 - 2025-03-15
 */
async function authenticateProductionAPI() {
  console.log('[update-services] Autenticando na API de produção...');
  
  // Verificar se a URL da API está configurada
  const apiUrl = process.env.PRODUCTION_API_URL;
  const apiEmail = process.env.PRODUCTION_API_EMAIL;
  const apiPassword = process.env.PRODUCTION_API_PASSWORD;
  
  if (!apiUrl) {
    console.error('[update-services] URL da API de produção não configurada. Defina PRODUCTION_API_URL no arquivo .env');
    return null;
  }
  
  if (!apiEmail || !apiPassword) {
    console.error('[update-services] Credenciais da API de produção não configuradas. Defina PRODUCTION_API_EMAIL e PRODUCTION_API_PASSWORD no arquivo .env');
    return null;
  }
  
  try {
    // Fazer login na API
    console.log(`[update-services] Tentando login com email: ${apiEmail}`);
    const loginResponse = await axios.post(`${apiUrl}/api/auth/login`, {
      email: apiEmail,
      password: apiPassword
    });
    
    // Verificar resposta
    if (loginResponse.status === 200 && loginResponse.data && loginResponse.data.token) {
      console.log('[update-services] Autenticação bem-sucedida!');
      return loginResponse.data.token;
    } else {
      console.error('[update-services] Erro na resposta de autenticação:', loginResponse.status);
      console.error(loginResponse.data);
      return null;
    }
  } catch (error) {
    console.error('[update-services] Erro ao autenticar na API de produção:', error.message);
    if (error.response) {
      console.error(`[update-services] Detalhes do erro: Status ${error.response.status} - ${error.response.statusText}`);
      console.error(`[update-services] Corpo da resposta: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('[update-services] Não houve resposta do servidor. Verifique se a URL está correta e se o servidor está online.');
    } else {
      console.error('[update-services] Erro ao configurar a requisição:', error.stack);
    }
    return null;
  }
}

/**
 * Atualiza os serviços no banco de dados de produção via API
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<Object>} Estatísticas de atualização
 * @version 1.3.0 - 2025-03-15 - Adicionado suporte para autenticação JWT
 */
async function updateProductionDatabase(services) {
  console.log('[update-services] Atualizando serviços no banco de dados de produção...');
  
  // Verificar se a URL da API está configurada
  const apiUrl = process.env.PRODUCTION_API_URL;
  
  if (!apiUrl) {
    console.error('[update-services] URL da API de produção não configurada. Defina PRODUCTION_API_URL no arquivo .env');
    return { atualizados: 0, criados: 0, erros: services.length };
  }
  
  // Autenticar na API
  const token = await authenticateProductionAPI();
  
  if (!token) {
    console.error('[update-services] Não foi possível autenticar na API de produção. Verifique as credenciais.');
    return { atualizados: 0, criados: 0, erros: services.length };
  }
  
  let stats = {
    atualizados: 0,
    criados: 0,
    erros: 0
  };
  
  try {
    // Configurar cabeçalhos com o token JWT
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('[update-services] Estratégia de atualização: usando endpoints CRUD individuais');
    
    // 1. Primeiro, obter os serviços existentes na API
    console.log('[update-services] Obtendo serviços existentes da API...');
    const getResponse = await axios.get(`${apiUrl}/api/pricing`, { headers });
    const existingServices = getResponse.data || [];
    
    console.log(`[update-services] Encontrados ${existingServices.length} serviços na API`);
    
    // Mapear serviços existentes por nome para facilitar a busca
    const servicesByName = {};
    existingServices.forEach(service => {
      servicesByName[service.nome] = service;
    });
    
    // 2. Para cada serviço nas definições, criar ou atualizar na API
    for (const service of services) {
      try {
        const serviceData = prepareServiceForDatabase(service);
        const existingService = servicesByName[service.nome];
        
        if (existingService) {
          // Atualizar serviço existente
          console.log(`[update-services] Atualizando serviço na API: ${service.nome}`);
          await axios.put(
            `${apiUrl}/api/pricing/${existingService.id}`,
            serviceData,
            { headers }
          );
          stats.atualizados++;
        } else {
          // Criar novo serviço
          console.log(`[update-services] Criando serviço na API: ${service.nome}`);
          await axios.post(
            `${apiUrl}/api/pricing`,
            serviceData,
            { headers }
          );
          stats.criados++;
        }
      } catch (serviceError) {
        console.error(`[update-services] Erro ao processar serviço ${service.nome}:`, serviceError.message);
        if (serviceError.response) {
          console.error(`Detalhes: ${serviceError.response.status} - ${serviceError.response.statusText}`);
          console.error(JSON.stringify(serviceError.response.data));
        }
        stats.erros++;
      }
    }
    
    // 3. Após atualizar todos os serviços, sincronizar os dados de demonstração
    console.log('[update-services] Sincronizando dados de demonstração...');
    try {
      const syncResponse = await axios.post(
        `${apiUrl}/api/sync/demo-data`,
        {},
        { headers }
      );
      
      if (syncResponse.status === 200 && syncResponse.data.sucesso) {
        console.log(`[update-services] Dados de demonstração sincronizados com sucesso: ${syncResponse.data.mensagem}`);
      } else {
        console.warn(`[update-services] Aviso na sincronização de dados de demonstração: ${syncResponse.data.mensagem}`);
      }
    } catch (syncError) {
      console.error('[update-services] Erro ao sincronizar dados de demonstração:', syncError.message);
      if (syncError.response) {
        console.error(`Detalhes: ${syncError.response.status} - ${syncError.response.statusText}`);
        console.error(JSON.stringify(syncError.response.data));
      }
      // Não contabilizar como erro, pois os serviços já foram atualizados
    }
    
    console.log(`[update-services] Atualização do banco de produção concluída: ${stats.atualizados} atualizados, ${stats.criados} criados, ${stats.erros} erros`);
    return stats;
  } catch (error) {
    console.error('[update-services] Erro ao atualizar banco de dados de produção:', error.message);
    if (error.response) {
      console.error(`[update-services] Detalhes do erro: Status ${error.response.status} - ${error.response.statusText}`);
      console.error(`[update-services] Corpo da resposta: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('[update-services] Não houve resposta do servidor. Verifique se a URL está correta e se o servidor está online.');
      console.error(`[update-services] Detalhes da requisição: ${JSON.stringify(error.request)}`);
    } else {
      console.error('[update-services] Erro ao configurar a requisição:', error.stack);
    }
    
    // Verificar se o endpoint existe
    console.log('[update-services] Verificando se o endpoint da API existe...');
    try {
      const checkResponse = await axios.get(`${apiUrl}/api/health`, { timeout: 5000 });
      console.log(`[update-services] Servidor respondeu com status: ${checkResponse.status}`);
    } catch (checkError) {
      console.error('[update-services] Não foi possível verificar o servidor:', checkError.message);
    }
    
    return { atualizados: 0, criados: 0, erros: services.length };
  }
}

/**
 * Prepara um serviço para armazenamento no banco de dados
 * @param {Object} service Definição do serviço
 * @returns {Object} Dados formatados para o banco de dados
 * @version 1.1.0 - 2025-03-15 - Corrigido o tipo dos campos de duração para garantir que sejam sempre strings
 */
function prepareServiceForDatabase(service) {
  // Garantir que os detalhes estejam no formato correto
  const detalhes = {
    captura: service.duracao_media_captura || service.detalhes?.captura || 'Sob consulta',
    tratamento: service.duracao_media_tratamento || service.detalhes?.tratamento || 'Sob consulta',
    entregaveis: service.entregaveis || service.detalhes?.entregaveis || '',
    adicionais: service.possiveis_adicionais || service.detalhes?.adicionais || '',
    deslocamento: service.valor_deslocamento || service.detalhes?.deslocamento || 'Sob consulta'
  };
  
  // Garantir que os campos de duração sejam sempre strings
  const duracao_media_captura = typeof detalhes.captura === 'number' 
    ? String(detalhes.captura) + ' horas' 
    : String(detalhes.captura);
    
  const duracao_media_tratamento = typeof detalhes.tratamento === 'number' 
    ? String(detalhes.tratamento) + ' dias' 
    : String(detalhes.tratamento);
  
  // Criar objeto para o banco de dados
  return {
    nome: service.nome,
    descricao: service.descricao,
    preco_base: parseFloat(service.preco_base) || 0,
    duracao_media_captura: duracao_media_captura,
    duracao_media_tratamento: duracao_media_tratamento,
    entregaveis: String(detalhes.entregaveis),
    possiveis_adicionais: String(detalhes.adicionais),
    valor_deslocamento: String(detalhes.deslocamento),
    detalhes: JSON.stringify(detalhes)
  };
}

/**
 * Atualiza o arquivo de serviços estáticos para o frontend
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function updateStaticServicesFile(services) {
  try {
    console.log(`[update-services] Atualizando arquivo de serviços estáticos em: ${simulatorServicesPath}`);
    
    // Fazer backup do arquivo original se existir
    try {
      const backupPath = `${simulatorServicesPath}.bak`;
      await fs.copyFile(simulatorServicesPath, backupPath);
      console.log(`[update-services] Backup criado em: ${backupPath}`);
    } catch (error) {
      console.log(`[update-services] Não foi possível criar backup: arquivo original não existe`);
    }
    
    // Transformar serviços para o formato do frontend
    const formattedServices = services.map((service, index) => {
      // Garantir que os detalhes estejam no formato correto
      const detalhes = {
        captura: service.duracao_media_captura || service.detalhes?.captura || 'Sob consulta',
        tratamento: service.duracao_media_tratamento || service.detalhes?.tratamento || 'Sob consulta',
        entregaveis: service.entregaveis || service.detalhes?.entregaveis || '',
        adicionais: service.possiveis_adicionais || service.detalhes?.adicionais || '',
        deslocamento: service.valor_deslocamento || service.detalhes?.deslocamento || 'Sob consulta'
      };
      
      // Extrair valores numéricos para cálculo da duração média
      const duracaoCaptura = extrairValorNumerico(detalhes.captura) || 0;
      const duracaoTratamento = extrairValorNumerico(detalhes.tratamento) || 0;
      const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3;
      
      // Criar objeto para o frontend
      return {
        id: service.id || index + 1,
        nome: service.nome,
        descricao: service.descricao,
        preco_base: parseFloat(service.preco_base) || 0,
        duracao_media: duracaoMedia,
        detalhes: detalhes,
        // Manter campos planos para compatibilidade
        duracao_media_captura: detalhes.captura,
        duracao_media_tratamento: detalhes.tratamento,
        entregaveis: detalhes.entregaveis,
        possiveis_adicionais: detalhes.adicionais,
        valor_deslocamento: detalhes.deslocamento,
        ativo: service.ativo !== undefined ? service.ativo : true,
        ordem: service.ordem !== undefined ? parseInt(service.ordem) : 999
      };
    });
    
    // Gerar conteúdo do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const novoConteudo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 3.0
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script update-services-all.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(formattedServices, null, 2)};

/**
 * @deprecated Mantido para compatibilidade retroativa. Use 'servicos' em novos componentes.
 * @version 1.1.0 - 2025-03-15
 */
export const dadosDemonstracao = servicos;

export default servicos;
`;
    
    // Escrever arquivo
    await fs.writeFile(simulatorServicesPath, novoConteudo, 'utf8');
    console.log(`[update-services] Arquivo de serviços estáticos atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    console.error('[update-services] Erro ao atualizar arquivo de serviços estáticos:', error);
    return false;
  }
}

/**
 * Extrai um valor numérico de uma string de duração
 * @param {string} duracao String contendo informação de duração
 * @returns {number} Valor numérico extraído ou null se não for possível extrair
 */
function extrairValorNumerico(duracao) {
  if (!duracao || typeof duracao !== 'string') return null;
  
  // Tenta extrair um número da string
  const match = duracao.match(/(\d+(\.\d+)?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  // Casos especiais
  if (duracao.toLowerCase().includes('hora')) {
    // Se contém "hora", assume que é menos de um dia
    return 1;
  }
  
  if (duracao.toLowerCase().includes('dia')) {
    // Tenta extrair o número de dias
    const diasMatch = duracao.match(/(\d+).*dia/);
    if (diasMatch && diasMatch[1]) {
      return parseInt(diasMatch[1]);
    }
    return 1; // Assume 1 dia se não conseguir extrair
  }
  
  // Se contém "a", pode ser um intervalo como "2 a 3 horas"
  if (duracao.includes(' a ')) {
    const partes = duracao.split(' a ');
    const valores = [];
    
    for (const parte of partes) {
      const num = parte.match(/(\d+(\.\d+)?)/);
      if (num && num[1]) {
        valores.push(parseFloat(num[1]));
      }
    }
    
    if (valores.length > 0) {
      // Retorna a média dos valores encontrados
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    }
  }
  
  return null;
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(50));
  console.log('ATUALIZADOR UNIVERSAL DE SERVIÇOS LYTSPOT - v1.0.0');
  console.log('Data: ' + new Date().toISOString());
  console.log('='.repeat(50));
  
  try {
    // Carregar definições de serviços
    console.log('\n1. Carregando definições de serviços...');
    const services = await loadServiceDefinitions();
    
    if (services.length === 0) {
      console.error('Nenhuma definição de serviço encontrada. Abortando.');
      process.exit(1);
    }
    
    console.log(`Carregados ${services.length} serviços.`);
    
    // Atualizar banco de dados local
    console.log('\n2. Atualizando banco de dados local...');
    const localStats = await updateLocalDatabase(services);
    
    // Atualizar banco de dados de produção
    console.log('\n3. Atualizando banco de dados de produção...');
    const productionStats = await updateProductionDatabase(services);
    
    // Atualizar arquivo estático
    console.log('\n4. Atualizando arquivo estático para o frontend...');
    const staticSuccess = await updateStaticServicesFile(services);
    
    // Exibir resumo
    console.log('\n=== RESUMO DA ATUALIZAÇÃO ===');
    console.log('Banco de dados local:');
    console.log(`- Serviços atualizados: ${localStats.atualizados}`);
    console.log(`- Serviços criados: ${localStats.criados}`);
    console.log(`- Erros: ${localStats.erros}`);
    
    console.log('\nBanco de dados de produção:');
    console.log(`- Serviços atualizados: ${productionStats.atualizados}`);
    console.log(`- Serviços criados: ${productionStats.criados}`);
    console.log(`- Erros: ${productionStats.erros}`);
    
    console.log('\nArquivo estático:');
    console.log(`- Atualizado: ${staticSuccess ? 'Sim' : 'Não'}`);
    
    console.log('\nAtualização concluída!');
  } catch (error) {
    console.error('Erro fatal durante a atualização:', error);
    process.exit(1);
  }
}

// Verificar se o script está sendo executado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().finally(() => {
    // Fechar conexão com o banco de dados
    prisma.$disconnect();
  });
}

// Exportar funções para uso em outros scripts
export const updateDatabaseServices = updateLocalDatabase;
