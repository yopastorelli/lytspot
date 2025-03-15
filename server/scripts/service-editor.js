/**
 * Editor de Serviços Simplificado para Lytspot
 * @description Ferramenta para editar e atualizar serviços em todos os ambientes
 * @version 1.0.0 - 2025-03-15
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import readline from 'readline';

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

// Interface para leitura de entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Carrega as definições de serviços do arquivo
 * @returns {Promise<Array>} Array de definições de serviços
 */
async function loadServiceDefinitions() {
  try {
    console.log(`[service-editor] Carregando definições de serviços de: ${serviceDefinitionsPath}`);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(serviceDefinitionsPath);
    } catch (error) {
      console.error(`[service-editor] Arquivo de definições não encontrado: ${serviceDefinitionsPath}`);
      return [];
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = await fs.readFile(serviceDefinitionsPath, 'utf8');
    
    // Extrair o array de definições usando regex
    const match = fileContent.match(/export const serviceDefinitions = (\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
      console.error('[service-editor] Não foi possível extrair as definições de serviços do arquivo');
      return [];
    }
    
    // Avaliar o array extraído
    const definitionsArray = eval(match[1]);
    console.log(`[service-editor] Carregadas ${definitionsArray.length} definições de serviços`);
    
    return definitionsArray;
  } catch (error) {
    console.error('[service-editor] Erro ao carregar definições de serviços:', error);
    return [];
  }
}

/**
 * Salva as definições de serviços no arquivo
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function saveServiceDefinitions(services) {
  try {
    console.log(`[service-editor] Salvando ${services.length} definições de serviços em: ${serviceDefinitionsPath}`);
    
    // Fazer backup do arquivo original
    const backupPath = `${serviceDefinitionsPath}.bak`;
    try {
      await fs.copyFile(serviceDefinitionsPath, backupPath);
      console.log(`[service-editor] Backup criado em: ${backupPath}`);
    } catch (error) {
      console.warn(`[service-editor] Não foi possível criar backup: ${error.message}`);
    }
    
    // Ler o conteúdo atual do arquivo
    const currentContent = await fs.readFile(serviceDefinitionsPath, 'utf8');
    
    // Substituir a seção de definições
    const newContent = currentContent.replace(
      /export const serviceDefinitions = \[[\s\S]*?\];/,
      `export const serviceDefinitions = ${JSON.stringify(services, null, 2)};`
    );
    
    // Escrever o novo conteúdo
    await fs.writeFile(serviceDefinitionsPath, newContent, 'utf8');
    console.log(`[service-editor] Definições de serviços salvas com sucesso!`);
    
    return true;
  } catch (error) {
    console.error('[service-editor] Erro ao salvar definições de serviços:', error);
    return false;
  }
}

/**
 * Atualiza os serviços no banco de dados
 * @param {Array} services Array de definições de serviços
 * @returns {Promise<Object>} Estatísticas de atualização
 */
async function updateDatabaseServices(services) {
  console.log('[service-editor] Atualizando serviços no banco de dados...');
  
  let stats = {
    atualizados: 0,
    criados: 0,
    erros: 0
  };
  
  try {
    // Buscar serviços existentes
    const existingServices = await prisma.servico.findMany();
    console.log(`[service-editor] Encontrados ${existingServices.length} serviços no banco de dados`);
    
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
          console.log(`[service-editor] Serviço atualizado: ${service.nome}`);
          stats.atualizados++;
        } else {
          // Criar novo serviço
          await prisma.servico.create({
            data: serviceData
          });
          console.log(`[service-editor] Serviço criado: ${service.nome}`);
          stats.criados++;
        }
      } catch (error) {
        console.error(`[service-editor] Erro ao processar serviço ${service.nome}:`, error);
        stats.erros++;
      }
    }
    
    console.log(`[service-editor] Atualização concluída: ${stats.atualizados} atualizados, ${stats.criados} criados, ${stats.erros} erros`);
    return stats;
  } catch (error) {
    console.error('[service-editor] Erro ao atualizar banco de dados:', error);
    return stats;
  }
}

/**
 * Prepara um serviço para armazenamento no banco de dados
 * @param {Object} service Definição do serviço
 * @returns {Object} Dados formatados para o banco de dados
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
  
  // Criar objeto para o banco de dados
  return {
    nome: service.nome,
    descricao: service.descricao,
    preco_base: parseFloat(service.preco_base) || 0,
    duracao_media_captura: detalhes.captura,
    duracao_media_tratamento: detalhes.tratamento,
    entregaveis: detalhes.entregaveis,
    possiveis_adicionais: detalhes.adicionais,
    valor_deslocamento: detalhes.deslocamento,
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
    console.log(`[service-editor] Atualizando arquivo de serviços estáticos em: ${simulatorServicesPath}`);
    
    // Fazer backup do arquivo original se existir
    try {
      const backupPath = `${simulatorServicesPath}.bak`;
      await fs.copyFile(simulatorServicesPath, backupPath);
      console.log(`[service-editor] Backup criado em: ${backupPath}`);
    } catch (error) {
      console.log(`[service-editor] Não foi possível criar backup: arquivo original não existe`);
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
        valor_deslocamento: detalhes.deslocamento
      };
    });
    
    // Gerar conteúdo do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const novoConteudo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 3.0
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script service-editor.js
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
    console.log(`[service-editor] Arquivo de serviços estáticos atualizado com sucesso!`);
    
    return true;
  } catch (error) {
    console.error('[service-editor] Erro ao atualizar arquivo de serviços estáticos:', error);
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
 * Exibe o menu principal
 */
function showMainMenu() {
  console.log('\n=== EDITOR DE SERVIÇOS LYTSPOT ===');
  console.log('1. Listar serviços');
  console.log('2. Editar serviço');
  console.log('3. Adicionar serviço');
  console.log('4. Remover serviço');
  console.log('5. Sincronizar com banco de dados');
  console.log('6. Atualizar arquivo estático');
  console.log('7. Sincronizar tudo');
  console.log('0. Sair');
  
  rl.question('\nEscolha uma opção: ', async (answer) => {
    switch (answer.trim()) {
      case '1':
        await listServices();
        break;
      case '2':
        await editService();
        break;
      case '3':
        await addService();
        break;
      case '4':
        await removeService();
        break;
      case '5':
        await syncDatabase();
        break;
      case '6':
        await updateStaticFile();
        break;
      case '7':
        await syncAll();
        break;
      case '0':
        console.log('Saindo...');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Opção inválida!');
        showMainMenu();
        break;
    }
  });
}

/**
 * Lista todos os serviços
 */
async function listServices() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== LISTA DE SERVIÇOS ===');
  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.nome} - R$ ${service.preco_base.toFixed(2)}`);
  });
  
  showMainMenu();
}

/**
 * Edita um serviço existente
 */
async function editService() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== EDITAR SERVIÇO ===');
  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.nome}`);
  });
  
  rl.question('\nEscolha o número do serviço para editar (0 para cancelar): ', (answer) => {
    const index = parseInt(answer.trim()) - 1;
    
    if (isNaN(index) || index < -1 || index >= services.length) {
      console.log('Opção inválida!');
      showMainMenu();
      return;
    }
    
    if (index === -1) {
      console.log('Operação cancelada.');
      showMainMenu();
      return;
    }
    
    const service = services[index];
    console.log(`\nEditando serviço: ${service.nome}`);
    
    // Editar campos
    editServiceFields(service, async (updatedService) => {
      services[index] = updatedService;
      await saveServiceDefinitions(services);
      console.log(`Serviço "${updatedService.nome}" atualizado com sucesso!`);
      showMainMenu();
    });
  });
}

/**
 * Adiciona um novo serviço
 */
async function addService() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== ADICIONAR SERVIÇO ===');
  
  // Criar serviço vazio
  const newService = {
    nome: '',
    descricao: '',
    preco_base: 0,
    detalhes: {
      captura: 'Sob consulta',
      tratamento: 'Sob consulta',
      entregaveis: '',
      adicionais: '',
      deslocamento: 'Sob consulta'
    }
  };
  
  // Editar campos
  editServiceFields(newService, async (updatedService) => {
    services.push(updatedService);
    await saveServiceDefinitions(services);
    console.log(`Serviço "${updatedService.nome}" adicionado com sucesso!`);
    showMainMenu();
  });
}

/**
 * Remove um serviço existente
 */
async function removeService() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== REMOVER SERVIÇO ===');
  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.nome}`);
  });
  
  rl.question('\nEscolha o número do serviço para remover (0 para cancelar): ', async (answer) => {
    const index = parseInt(answer.trim()) - 1;
    
    if (isNaN(index) || index < -1 || index >= services.length) {
      console.log('Opção inválida!');
      showMainMenu();
      return;
    }
    
    if (index === -1) {
      console.log('Operação cancelada.');
      showMainMenu();
      return;
    }
    
    const service = services[index];
    
    rl.question(`\nTem certeza que deseja remover o serviço "${service.nome}"? (s/n): `, async (answer) => {
      if (answer.trim().toLowerCase() === 's') {
        services.splice(index, 1);
        await saveServiceDefinitions(services);
        console.log(`Serviço "${service.nome}" removido com sucesso!`);
      } else {
        console.log('Operação cancelada.');
      }
      
      showMainMenu();
    });
  });
}

/**
 * Sincroniza com o banco de dados
 */
async function syncDatabase() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== SINCRONIZAR COM BANCO DE DADOS ===');
  
  const stats = await updateDatabaseServices(services);
  console.log(`\nSincronização concluída: ${stats.atualizados} atualizados, ${stats.criados} criados, ${stats.erros} erros`);
  
  showMainMenu();
}

/**
 * Atualiza o arquivo estático
 */
async function updateStaticFile() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== ATUALIZAR ARQUIVO ESTÁTICO ===');
  
  const success = await updateStaticServicesFile(services);
  
  if (success) {
    console.log('\nArquivo estático atualizado com sucesso!');
  } else {
    console.log('\nErro ao atualizar arquivo estático!');
  }
  
  showMainMenu();
}

/**
 * Sincroniza tudo
 */
async function syncAll() {
  const services = await loadServiceDefinitions();
  
  console.log('\n=== SINCRONIZAR TUDO ===');
  
  // Sincronizar com banco de dados
  console.log('\n1. Sincronizando com banco de dados...');
  const dbStats = await updateDatabaseServices(services);
  console.log(`Sincronização com banco concluída: ${dbStats.atualizados} atualizados, ${dbStats.criados} criados, ${dbStats.erros} erros`);
  
  // Atualizar arquivo estático
  console.log('\n2. Atualizando arquivo estático...');
  const staticSuccess = await updateStaticServicesFile(services);
  
  if (staticSuccess) {
    console.log('Arquivo estático atualizado com sucesso!');
  } else {
    console.log('Erro ao atualizar arquivo estático!');
  }
  
  console.log('\nSincronização completa!');
  showMainMenu();
}

/**
 * Edita os campos de um serviço
 * @param {Object} service Serviço a ser editado
 * @param {Function} callback Função de callback com o serviço atualizado
 */
function editServiceFields(service, callback) {
  // Extrair detalhes
  const detalhes = service.detalhes || {};
  
  // Editar nome
  rl.question(`Nome (${service.nome || 'Novo serviço'}): `, (nome) => {
    service.nome = nome.trim() || service.nome || 'Novo serviço';
    
    // Editar descrição
    rl.question(`Descrição (${service.descricao || ''}): `, (descricao) => {
      service.descricao = descricao.trim() || service.descricao || '';
      
      // Editar preço base
      rl.question(`Preço base (${service.preco_base || 0}): `, (preco) => {
        service.preco_base = parseFloat(preco) || service.preco_base || 0;
        
        // Editar duração média de captura
        rl.question(`Duração média de captura (${detalhes.captura || service.duracao_media_captura || 'Sob consulta'}): `, (captura) => {
          const capturaValue = captura.trim() || detalhes.captura || service.duracao_media_captura || 'Sob consulta';
          
          // Editar duração média de tratamento
          rl.question(`Duração média de tratamento (${detalhes.tratamento || service.duracao_media_tratamento || 'Sob consulta'}): `, (tratamento) => {
            const tratamentoValue = tratamento.trim() || detalhes.tratamento || service.duracao_media_tratamento || 'Sob consulta';
            
            // Editar entregáveis
            rl.question(`Entregáveis (${detalhes.entregaveis || service.entregaveis || ''}): `, (entregaveis) => {
              const entregaveisValue = entregaveis.trim() || detalhes.entregaveis || service.entregaveis || '';
              
              // Editar adicionais
              rl.question(`Adicionais (${detalhes.adicionais || service.possiveis_adicionais || ''}): `, (adicionais) => {
                const adicionaisValue = adicionais.trim() || detalhes.adicionais || service.possiveis_adicionais || '';
                
                // Editar deslocamento
                rl.question(`Deslocamento (${detalhes.deslocamento || service.valor_deslocamento || 'Sob consulta'}): `, (deslocamento) => {
                  const deslocamentoValue = deslocamento.trim() || detalhes.deslocamento || service.valor_deslocamento || 'Sob consulta';
                  
                  // Atualizar serviço
                  service.detalhes = {
                    captura: capturaValue,
                    tratamento: tratamentoValue,
                    entregaveis: entregaveisValue,
                    adicionais: adicionaisValue,
                    deslocamento: deslocamentoValue
                  };
                  
                  // Manter campos planos para compatibilidade
                  service.duracao_media_captura = capturaValue;
                  service.duracao_media_tratamento = tratamentoValue;
                  service.entregaveis = entregaveisValue;
                  service.possiveis_adicionais = adicionaisValue;
                  service.valor_deslocamento = deslocamentoValue;
                  
                  // Chamar callback
                  callback(service);
                });
              });
            });
          });
        });
      });
    });
  });
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(50));
  console.log('EDITOR DE SERVIÇOS LYTSPOT - v1.0.0');
  console.log('='.repeat(50));
  
  showMainMenu();
}

// Iniciar o programa
main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
