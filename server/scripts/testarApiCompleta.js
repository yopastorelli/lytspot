/**
 * Script para testar a API completa de serviços
 * @version 1.0.0 - 2025-03-14
 * @description Simula o comportamento completo da API de serviços
 */

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const serviceTransformer = require('../transformers/serviceTransformer');
const pricingController = require('../controllers/pricingController');

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

/**
 * Função para testar a API completa
 */
async function testarApiCompleta() {
  try {
    console.log('🚀 Iniciando teste da API completa...');
    
    // Criar aplicação Express
    const app = express();
    
    // Configurar middleware
    app.use(cors());
    app.use(express.json());
    
    // Configurar variável de ambiente para depuração
    process.env.DEBUG = 'true';
    
    // Rota para listar todos os serviços
    app.get('/api/pricing', (req, res) => {
      console.log('\n📝 Recebida requisição para listar serviços...');
      pricingController.getAllServices(req, res);
    });
    
    // Iniciar servidor na porta 3001
    const server = app.listen(3001, () => {
      console.log('✅ Servidor de teste iniciado na porta 3001');
      console.log('📊 Acesse http://localhost:3001/api/pricing para ver os serviços');
      console.log('⚠️ Pressione Ctrl+C para encerrar o servidor');
      
      // Verificar serviços no banco de dados
      verificarServicos();
    });
    
    // Configurar encerramento do servidor
    process.on('SIGINT', async () => {
      console.log('\n🛑 Encerrando servidor...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erro ao testar API completa:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

/**
 * Função para verificar serviços no banco de dados
 */
async function verificarServicos() {
  try {
    console.log('\n🔍 Verificando serviços no banco de dados...');
    
    // Buscar serviços diretamente do banco
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    
    if (servicos.length > 0) {
      // Mostrar exemplo do primeiro serviço
      console.log('\nExemplo de serviço do banco:');
      const exemploServico = { ...servicos[0] };
      
      // Tentar fazer parse do campo detalhes para exibição
      try {
        if (typeof exemploServico.detalhes === 'string') {
          exemploServico.detalhes = JSON.parse(exemploServico.detalhes);
        }
      } catch (error) {
        console.log('Erro ao fazer parse do campo detalhes para exibição:', error.message);
      }
      
      console.log(JSON.stringify(exemploServico, null, 2));
      
      // Transformar serviços para o formato do simulador
      console.log('\nTransformando serviços para o formato do simulador...');
      const servicosTransformados = serviceTransformer.toSimulatorFormatList(servicos);
      console.log(`✅ Total de serviços transformados: ${servicosTransformados.length}`);
      
      // Mostrar exemplo do primeiro serviço transformado
      if (servicosTransformados.length > 0) {
        console.log('\nExemplo de serviço transformado:');
        const exemploTransformado = { ...servicosTransformados[0] };
        console.log(JSON.stringify(exemploTransformado, null, 2));
        
        // Verificar se o campo detalhes está presente e tem a estrutura esperada
        if (exemploTransformado.detalhes) {
          console.log('\nVerificação da estrutura do campo detalhes:');
          console.log('- Campo captura:', exemploTransformado.detalhes.captura ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo tratamento:', exemploTransformado.detalhes.tratamento ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo entregaveis:', exemploTransformado.detalhes.entregaveis ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo adicionais:', exemploTransformado.detalhes.adicionais ? '✅ Presente' : '❌ Ausente');
          console.log('- Campo deslocamento:', exemploTransformado.detalhes.deslocamento ? '✅ Presente' : '❌ Ausente');
        } else {
          console.log('\n❌ Campo detalhes ausente no serviço transformado!');
        }
      }
    } else {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar serviços:', error);
  }
}

// Executar a função
testarApiCompleta()
  .catch((error) => {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  });
