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

// Executar a função principal
verificarApiProducao()
  .catch((error) => {
    console.error('❌ Erro fatal durante execução do script:', error);
    process.exit(1);
  });
