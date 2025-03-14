/**
 * Script para verificar a API de serviços em produção
 * @version 1.0.0 - 2025-03-14
 * @description Verifica se a API de serviços em produção está retornando os dados corretos
 */

import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

// URLs da API
const DEV_API_URL = 'http://localhost:3000/api/pricing';
const PROD_API_URL = 'https://lytspot.onrender.com/api/pricing';

/**
 * Compara dois objetos de serviço para verificar se são equivalentes
 * @param {Object} servico1 - Primeiro serviço
 * @param {Object} servico2 - Segundo serviço
 * @returns {boolean} - True se os serviços forem equivalentes
 */
function servicosEquivalentes(servico1, servico2) {
  // Verificar campos principais
  if (servico1.id !== servico2.id || servico1.nome !== servico2.nome) {
    return false;
  }
  
  // Verificar campo detalhes
  const detalhes1 = typeof servico1.detalhes === 'string' 
    ? JSON.parse(servico1.detalhes) 
    : servico1.detalhes;
    
  const detalhes2 = typeof servico2.detalhes === 'string' 
    ? JSON.parse(servico2.detalhes) 
    : servico2.detalhes;
  
  // Verificar campos específicos dentro de detalhes
  if (detalhes1 && detalhes2) {
    if (detalhes1.captura !== detalhes2.captura || 
        detalhes1.tratamento !== detalhes2.tratamento) {
      return false;
    }
  }
  
  return true;
}

/**
 * Busca serviços da API
 * @param {string} url - URL da API
 * @returns {Promise<Array>} - Array de serviços
 */
async function buscarServicosApi(url) {
  console.log(`🔍 Consultando API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Resposta inválida: esperava um array de serviços');
    }
    
    console.log(`✅ Sucesso! Recebidos ${data.length} serviços da API.`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao consultar API ${url}:`, error.message);
    return null;
  }
}

/**
 * Busca serviços do banco de dados
 * @returns {Promise<Array>} - Array de serviços
 */
async function buscarServicosBanco() {
  console.log('🔍 Consultando serviços diretamente no banco de dados...');
  
  try {
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    return servicos;
  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error.message);
    return null;
  }
}

/**
 * Verifica a API de serviços em produção
 */
async function verificarApiProducao() {
  console.log('🚀 Iniciando verificação da API de serviços em produção...');
  
  try {
    // Buscar serviços da API de produção
    const servicosProd = await buscarServicosApi(PROD_API_URL);
    
    if (!servicosProd) {
      console.log('⚠️ Não foi possível obter serviços da API de produção.');
      return;
    }
    
    // Buscar serviços da API de desenvolvimento (opcional)
    const servicosDev = await buscarServicosApi(DEV_API_URL);
    
    // Buscar serviços diretamente do banco de dados
    const servicosBanco = await buscarServicosBanco();
    
    if (!servicosBanco) {
      console.log('⚠️ Não foi possível obter serviços do banco de dados.');
      return;
    }
    
    // Transformar serviços do banco para o formato do simulador
    const { default: serviceTransformer } = await import('../transformers/serviceTransformer.js');
    const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicosBanco);
    
    console.log('\n📊 Comparação de serviços:');
    console.log(`- Serviços na API de produção: ${servicosProd.length}`);
    console.log(`- Serviços transformados do banco: ${servicosTransformados.length}`);
    
    if (servicosDev) {
      console.log(`- Serviços na API de desenvolvimento: ${servicosDev.length}`);
    }
    
    // Verificar se os serviços da API de produção correspondem aos do banco
    console.log('\n🔍 Verificando correspondência entre API de produção e banco de dados...');
    
    // Mapear serviços por ID para facilitar a comparação
    const mapaProd = {};
    servicosProd.forEach(servico => {
      mapaProd[servico.id] = servico;
    });
    
    const mapaTransformados = {};
    servicosTransformados.forEach(servico => {
      mapaTransformados[servico.id] = servico;
    });
    
    // Verificar serviços que estão em ambos
    const idsComuns = Object.keys(mapaProd).filter(id => mapaTransformados[id]);
    console.log(`✅ Serviços em comum: ${idsComuns.length}`);
    
    // Verificar serviços que estão apenas na produção
    const idsSoProd = Object.keys(mapaProd).filter(id => !mapaTransformados[id]);
    console.log(`ℹ️ Serviços apenas na API de produção: ${idsSoProd.length}`);
    
    // Verificar serviços que estão apenas no banco
    const idsSoBanco = Object.keys(mapaTransformados).filter(id => !mapaProd[id]);
    console.log(`ℹ️ Serviços apenas no banco de dados: ${idsSoBanco.length}`);
    
    // Verificar diferenças nos serviços comuns
    console.log('\n🔍 Verificando diferenças nos serviços comuns...');
    
    let servicosDiferentes = 0;
    let detalhesProblematicos = 0;
    
    for (const id of idsComuns) {
      const servicoProd = mapaProd[id];
      const servicoBanco = mapaTransformados[id];
      
      if (!servicosEquivalentes(servicoProd, servicoBanco)) {
        servicosDiferentes++;
        
        // Verificar especificamente o campo detalhes
        const detalhesProd = typeof servicoProd.detalhes === 'string' 
          ? JSON.parse(servicoProd.detalhes) 
          : servicoProd.detalhes;
          
        const detalhesBanco = typeof servicoBanco.detalhes === 'string' 
          ? JSON.parse(servicoBanco.detalhes) 
          : servicoBanco.detalhes;
        
        if (!detalhesProd || !detalhesBanco || 
            !detalhesProd.captura || !detalhesProd.tratamento ||
            !detalhesBanco.captura || !detalhesBanco.tratamento) {
          detalhesProblematicos++;
          
          console.log(`\n❌ Serviço com problema no campo detalhes: ${servicoProd.nome} (ID: ${id})`);
          console.log('API de produção:');
          console.log(JSON.stringify(detalhesProd, null, 2));
          console.log('Banco de dados transformado:');
          console.log(JSON.stringify(detalhesBanco, null, 2));
        }
      }
    }
    
    console.log(`ℹ️ Serviços com diferenças: ${servicosDiferentes}`);
    console.log(`ℹ️ Serviços com problemas no campo detalhes: ${detalhesProblematicos}`);
    
    if (servicosDiferentes === 0) {
      console.log('\n✅ Todos os serviços comuns estão idênticos entre a API de produção e o banco de dados!');
    } else {
      console.log('\n⚠️ Existem diferenças entre os serviços da API de produção e do banco de dados.');
      console.log('Possíveis causas:');
      console.log('1. Cache da API não foi limpo após atualização');
      console.log('2. A API está conectada a um banco de dados diferente');
      console.log('3. Problemas na transformação dos dados');
      
      console.log('\n💡 Sugestões:');
      console.log('1. Limpar o cache da API em produção');
      console.log('2. Verificar a conexão do banco de dados em produção');
      console.log('3. Executar novamente o script de atualização de serviços');
    }
    
    // Salvar resultado em um arquivo de log
    const logContent = `
=== Verificação da API de Produção (${new Date().toISOString()}) ===
Serviços na API de produção: ${servicosProd.length}
Serviços transformados do banco: ${servicosTransformados.length}
Serviços em comum: ${idsComuns.length}
Serviços apenas na API de produção: ${idsSoProd.length}
Serviços apenas no banco de dados: ${idsSoBanco.length}
Serviços com diferenças: ${servicosDiferentes}
Serviços com problemas no campo detalhes: ${detalhesProblematicos}
    `;
    
    const logDir = path.join(rootDir, 'server', 'logs');
    
    // Criar diretório de logs se não existir
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(logDir, 'verificacao-api-producao.log'), logContent, 'utf8');
    
    console.log('\n✅ Verificação concluída!');
    console.log('📝 Log salvo em server/logs/verificacao-api-producao.log');
  } catch (error) {
    console.error('\n❌ Erro durante a verificação:', error);
  } finally {
    // Fechar conexão com o banco de dados
    await prisma.$disconnect();
  }
}

// Função para carregar os dados estáticos do arquivo servicos.js
function carregarDadosEstaticos() {
  try {
    const servicosPath = path.join(__dirname, '../../src/data/servicos.js');
    const conteudo = fs.readFileSync(servicosPath, 'utf8');
    
    // Extrai o array de serviços do conteúdo do arquivo
    const match = conteudo.match(/export const servicos = (\[[\s\S]*?\]);/);
    if (match && match[1]) {
      // Avalia o array de serviços como JavaScript
      const servicosArray = eval(match[1]);
      return servicosArray;
    }
    
    console.error('Formato do arquivo servicos.js não reconhecido');
    return [];
  } catch (error) {
    console.error('Erro ao carregar dados estáticos:', error.message);
    return [];
  }
}

// Função para comparar arrays de serviços
function compararServicos(servicosA, servicosB, nomeA, nomeB) {
  console.log(`\n=== Comparando ${nomeA} vs ${nomeB} ===`);
  
  // Verificar quantidade
  console.log(`Quantidade em ${nomeA}: ${servicosA.length}`);
  console.log(`Quantidade em ${nomeB}: ${servicosB.length}`);
  
  // Mapear serviços por nome para facilitar a comparação
  const mapA = servicosA.reduce((acc, s) => {
    acc[s.nome] = s;
    return acc;
  }, {});
  
  const mapB = servicosB.reduce((acc, s) => {
    acc[s.nome] = s;
    return acc;
  }, {});
  
  // Verificar serviços presentes em A mas não em B
  console.log(`\nServiços presentes em ${nomeA} mas não em ${nomeB}:`);
  let encontrouDiferenca = false;
  for (const nome in mapA) {
    if (!mapB[nome]) {
      console.log(`- ${nome}`);
      encontrouDiferenca = true;
    }
  }
  if (!encontrouDiferenca) console.log('Nenhum');
  
  // Verificar serviços presentes em B mas não em A
  console.log(`\nServiços presentes em ${nomeB} mas não em ${nomeA}:`);
  encontrouDiferenca = false;
  for (const nome in mapB) {
    if (!mapA[nome]) {
      console.log(`- ${nome}`);
      encontrouDiferenca = true;
    }
  }
  if (!encontrouDiferenca) console.log('Nenhum');
  
  // Verificar diferenças nos serviços comuns
  console.log('\nDiferenças nos serviços comuns:');
  encontrouDiferenca = false;
  for (const nome in mapA) {
    if (mapB[nome]) {
      const servicoA = mapA[nome];
      const servicoB = mapB[nome];
      
      // Comparar IDs
      if (servicoA.id !== servicoB.id) {
        console.log(`- ${nome}: ID diferente (${nomeA}: ${servicoA.id}, ${nomeB}: ${servicoB.id})`);
        encontrouDiferenca = true;
      }
      
      // Comparar preço base
      if (servicoA.preco_base !== servicoB.preco_base) {
        console.log(`- ${nome}: Preço base diferente (${nomeA}: ${servicoA.preco_base}, ${nomeB}: ${servicoB.preco_base})`);
        encontrouDiferenca = true;
      }
      
      // Verificar estrutura de detalhes
      if (servicoA.detalhes && servicoB.detalhes) {
        if (servicoA.detalhes.captura !== servicoB.detalhes.captura) {
          console.log(`- ${nome}: Captura diferente (${nomeA}: ${servicoA.detalhes.captura}, ${nomeB}: ${servicoB.detalhes.captura})`);
          encontrouDiferenca = true;
        }
        if (servicoA.detalhes.tratamento !== servicoB.detalhes.tratamento) {
          console.log(`- ${nome}: Tratamento diferente (${nomeA}: ${servicoA.detalhes.tratamento}, ${nomeB}: ${servicoB.detalhes.tratamento})`);
          encontrouDiferenca = true;
        }
      } else if ((servicoA.detalhes && !servicoB.detalhes) || (!servicoA.detalhes && servicoB.detalhes)) {
        console.log(`- ${nome}: Estrutura de detalhes diferente (${nomeA}: ${!!servicoA.detalhes}, ${nomeB}: ${!!servicoB.detalhes})`);
        encontrouDiferenca = true;
      }
    }
  }
  if (!encontrouDiferenca) console.log('Nenhuma diferença encontrada nos serviços comuns');
}

// Função principal
async function verificarApis() {
  try {
    console.log('=== Verificação de APIs e Dados de Serviços ===');
    
    // 1. Carregar dados da API de produção
    console.log('\nCarregando dados da API de produção...');
    const resProd = await axios.get(PROD_API_URL);
    const servicosProd = resProd.data;
    console.log(`Carregados ${servicosProd.length} serviços da API de produção`);
    
    // 2. Carregar dados do banco local
    console.log('\nCarregando dados do banco local...');
    const servicosDB = await prisma.service.findMany();
    console.log(`Carregados ${servicosDB.length} serviços do banco local`);
    
    // 3. Carregar dados estáticos do arquivo servicos.js
    console.log('\nCarregando dados estáticos...');
    const servicosEstaticos = carregarDadosEstaticos();
    console.log(`Carregados ${servicosEstaticos.length} serviços estáticos`);
    
    // 4. Obter definições originais
    console.log('\nDefinições originais de serviços:');
    console.log(`${serviceDefinitions.length} definições encontradas`);
    
    // 5. Comparar dados
    compararServicos(servicosProd, servicosDB, 'API Produção', 'Banco Local');
    compararServicos(servicosProd, servicosEstaticos, 'API Produção', 'Dados Estáticos');
    compararServicos(servicosDB, servicosEstaticos, 'Banco Local', 'Dados Estáticos');
    
    // 6. Verificar estrutura dos detalhes
    console.log('\n=== Verificando estrutura dos detalhes ===');
    console.log('\nAPI Produção:');
    if (servicosProd.length > 0) {
      console.log(JSON.stringify(servicosProd[0].detalhes, null, 2));
    }
    
    console.log('\nBanco Local:');
    if (servicosDB.length > 0) {
      console.log(JSON.stringify(servicosDB[0].detalhes, null, 2));
    }
    
    console.log('\nDados Estáticos:');
    if (servicosEstaticos.length > 0) {
      console.log(JSON.stringify(servicosEstaticos[0].detalhes, null, 2));
    }
    
  } catch (error) {
    console.error('Erro durante a verificação:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a verificação
verificarApis();

// Script para verificar e comparar dados de serviços entre produção e desenvolvimento
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { serviceDefinitions } from '../models/seeds/serviceDefinitions.js';

// Configuração para obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

// URLs para verificação
const PROD_API_URL = 'https://lytspot.onrender.com/api/pricing';
const LOCAL_API_URL = 'http://localhost:3000/api/pricing';

/**
 * Carrega os dados estáticos do arquivo servicos.js
 * @returns {Array} Array de serviços do arquivo estático
 */
async function carregarDadosEstaticos() {
  try {
    const servicosPath = path.join(__dirname, '../../src/data/servicos.js');
    const conteudo = fs.readFileSync(servicosPath, 'utf8');
    
    // Extrai o array de serviços do conteúdo do arquivo usando regex
    const match = conteudo.match(/export const servicos = (\[[\s\S]*?\]);/);
    if (match && match[1]) {
      // Converte a string para um objeto JavaScript
      // Nota: Usar eval não é recomendado em produção, mas neste caso é um script de diagnóstico
      const servicosArray = eval(match[1]);
      return servicosArray;
    }
    
    console.error('❌ Formato do arquivo servicos.js não reconhecido');
    return [];
  } catch (error) {
    console.error('❌ Erro ao carregar dados estáticos:', error.message);
    return [];
  }
}

/**
 * Compara dois arrays de serviços e exibe as diferenças
 * @param {Array} servicosA Primeiro array de serviços
 * @param {Array} servicosB Segundo array de serviços
 * @param {string} nomeA Nome da primeira fonte de dados
 * @param {string} nomeB Nome da segunda fonte de dados
 */
function compararServicos(servicosA, servicosB, nomeA, nomeB) {
  console.log(`\n=== Comparando ${nomeA} vs ${nomeB} ===`);
  
  // Verificar quantidade
  console.log(`Quantidade em ${nomeA}: ${servicosA.length}`);
  console.log(`Quantidade em ${nomeB}: ${servicosB.length}`);
  
  // Mapear serviços por nome para facilitar a comparação
  const mapA = servicosA.reduce((acc, s) => {
    acc[s.nome] = s;
    return acc;
  }, {});
  
  const mapB = servicosB.reduce((acc, s) => {
    acc[s.nome] = s;
    return acc;
  }, {});
  
  // Verificar serviços presentes em A mas não em B
  console.log(`\nServiços presentes em ${nomeA} mas não em ${nomeB}:`);
  let encontrouDiferenca = false;
  for (const nome in mapA) {
    if (!mapB[nome]) {
      console.log(`- ${nome}`);
      encontrouDiferenca = true;
    }
  }
  if (!encontrouDiferenca) console.log('Nenhum');
  
  // Verificar serviços presentes em B mas não em A
  console.log(`\nServiços presentes em ${nomeB} mas não em ${nomeA}:`);
  encontrouDiferenca = false;
  for (const nome in mapB) {
    if (!mapA[nome]) {
      console.log(`- ${nome}`);
      encontrouDiferenca = true;
    }
  }
  if (!encontrouDiferenca) console.log('Nenhum');
  
  // Verificar diferenças nos serviços comuns
  console.log('\nDiferenças nos serviços comuns:');
  encontrouDiferenca = false;
  for (const nome in mapA) {
    if (mapB[nome]) {
      const servicoA = mapA[nome];
      const servicoB = mapB[nome];
      
      // Comparar IDs
      if (servicoA.id !== servicoB.id) {
        console.log(`- ${nome}: ID diferente (${nomeA}: ${servicoA.id}, ${nomeB}: ${servicoB.id})`);
        encontrouDiferenca = true;
      }
      
      // Comparar preço base
      if (servicoA.preco_base !== servicoB.preco_base) {
        console.log(`- ${nome}: Preço base diferente (${nomeA}: ${servicoA.preco_base}, ${nomeB}: ${servicoB.preco_base})`);
        encontrouDiferenca = true;
      }
      
      // Verificar estrutura de detalhes
      if (servicoA.detalhes && servicoB.detalhes) {
        if (servicoA.detalhes.captura !== servicoB.detalhes.captura) {
          console.log(`- ${nome}: Captura diferente (${nomeA}: ${servicoA.detalhes.captura}, ${nomeB}: ${servicoB.detalhes.captura})`);
          encontrouDiferenca = true;
        }
        if (servicoA.detalhes.tratamento !== servicoB.detalhes.tratamento) {
          console.log(`- ${nome}: Tratamento diferente (${nomeA}: ${servicoA.detalhes.tratamento}, ${nomeB}: ${servicoB.detalhes.tratamento})`);
          encontrouDiferenca = true;
        }
      } else if ((servicoA.detalhes && !servicoB.detalhes) || (!servicoA.detalhes && servicoB.detalhes)) {
        console.log(`- ${nome}: Estrutura de detalhes diferente (${nomeA}: ${!!servicoA.detalhes}, ${nomeB}: ${!!servicoB.detalhes})`);
        encontrouDiferenca = true;
      }
    }
  }
  if (!encontrouDiferenca) console.log('Nenhuma diferença encontrada nos serviços comuns');
}

/**
 * Função principal para verificar e comparar dados de serviços
 */
async function verificarApiProducao() {
  console.log('🔍 Iniciando verificação de APIs e Dados de Serviços');
  
  try {
    // 1. Carregar dados da API de produção
    console.log('\n📡 Carregando dados da API de produção...');
    const resProd = await axios.get(PROD_API_URL);
    const servicosProd = resProd.data;
    console.log(`✅ Carregados ${servicosProd.length} serviços da API de produção`);
    
    // 2. Tentar carregar dados da API local
    let servicosLocal = [];
    try {
      console.log('\n📡 Tentando carregar dados da API local...');
      const resLocal = await axios.get(LOCAL_API_URL, { timeout: 5000 });
      servicosLocal = resLocal.data;
      console.log(`✅ Carregados ${servicosLocal.length} serviços da API local`);
    } catch (error) {
      console.log('⚠️ API local não disponível, continuando sem esses dados');
    }
    
    // 3. Carregar dados do banco local
    console.log('\n💾 Carregando dados do banco local...');
    const servicosDB = await prisma.service.findMany();
    console.log(`✅ Carregados ${servicosDB.length} serviços do banco local`);
    
    // 4. Carregar dados estáticos do arquivo servicos.js
    console.log('\n📄 Carregando dados estáticos...');
    const servicosEstaticos = await carregarDadosEstaticos();
    console.log(`✅ Carregados ${servicosEstaticos.length} serviços estáticos`);
    
    // 5. Obter definições originais
    console.log('\n📋 Definições originais de serviços:');
    console.log(`✅ ${serviceDefinitions.length} definições encontradas`);
    
    // 6. Comparar dados
    compararServicos(servicosProd, servicosDB, 'API Produção', 'Banco Local');
    compararServicos(servicosProd, servicosEstaticos, 'API Produção', 'Dados Estáticos');
    compararServicos(servicosDB, servicosEstaticos, 'Banco Local', 'Dados Estáticos');
    
    if (servicosLocal.length > 0) {
      compararServicos(servicosProd, servicosLocal, 'API Produção', 'API Local');
    }
    
    // 7. Verificar estrutura dos detalhes
    console.log('\n🔍 Verificando estrutura dos detalhes');
    
    console.log('\nAPI Produção (primeiro serviço):');
    if (servicosProd.length > 0) {
      console.log(JSON.stringify(servicosProd[0], null, 2));
    }
    
    console.log('\nBanco Local (primeiro serviço):');
    if (servicosDB.length > 0) {
      console.log(JSON.stringify(servicosDB[0], null, 2));
    }
    
    console.log('\nDados Estáticos (primeiro serviço):');
    if (servicosEstaticos.length > 0) {
      console.log(JSON.stringify(servicosEstaticos[0], null, 2));
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
verificarApiProducao()
  .catch((error) => {
    console.error('❌ Erro fatal durante execução do script:', error);
    process.exit(1);
  });
