/**
 * Script para testar a API de serviços diretamente
 * @version 1.0.0 - 2025-03-14
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import serviceTransformer from '../transformers/serviceTransformer.js';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient();

// Função para testar a API
async function testarApiServicos() {
  try {
    console.log('🔍 Consultando serviços no banco de dados...');
    
    // Buscar serviços diretamente do banco
    const servicos = await prisma.servico.findMany();
    console.log(`✅ Total de serviços encontrados no banco: ${servicos.length}`);
    
    if (servicos.length > 0) {
      // Mostrar exemplo do primeiro serviço
      console.log('\nExemplo de serviço do banco:');
      const exemploServico = { ...servicos[0] };
      // Remover campos muito longos para melhor visualização
      if (exemploServico.descricao && exemploServico.descricao.length > 100) {
        exemploServico.descricao = exemploServico.descricao.substring(0, 100) + '...';
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
      }
      
      // Simular o que a API retornaria
      console.log('\nSimulando resposta da API...');
      
      // Criar um servidor Express temporário para simular a API
      const app = express();
      app.use(cors());
      
      // Rota de teste que retorna os serviços transformados
      app.get('/api/pricing', (req, res) => {
        res.json(servicosTransformados);
      });
      
      // Iniciar servidor na porta 3001
      const server = http.createServer(app);
      server.listen(3001, () => {
        console.log('Servidor de teste iniciado na porta 3001');
        console.log('Acesse http://localhost:3001/api/pricing para ver os serviços');
        console.log('Pressione Ctrl+C para encerrar o servidor');
      });
    } else {
      console.log('❌ Nenhum serviço encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao testar API de serviços:', error);
  }
}

// Executar a função
testarApiServicos()
  .catch((error) => {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  });
