/**
 * Rotas de sincronização de dados
 * 
 * Este arquivo contém as rotas para sincronização de dados entre ambientes
 * (desenvolvimento e produção) e entre o banco de dados e os arquivos de demonstração.
 * 
 * @version 1.0.5 - 2025-03-14 - Melhorada a sincronização para garantir a ordem correta dos serviços
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { syncServicesToDatabase, syncDatabaseToDemo } from '../scripts/syncDatabase.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ordem específica dos serviços conforme solicitado
const ORDEM_SERVICOS = [
  'VLOG - Aventuras em Família',
  'VLOG - Amigos e Comunidade',
  'Cobertura Fotográfica de Evento Social',
  'Filmagem de Evento Social',
  'Ensaio Fotográfico de Família',
  'Filmagem Aérea com Drone',
  'Fotografia Aérea com Drone'
];

/**
 * @route POST /sync/sync-to-production
 * @desc Sincroniza dados de demonstração para o banco de dados de produção
 * @access Restrito (em produção)
 */
router.post('/sync-to-production', async (req, res) => {
  try {
    console.log('Iniciando sincronização para produção');
    console.log('Parâmetros recebidos:', req.body);
    
    const { forceUpdate = false, deleteExisting = false } = req.body;
    
    // Executar sincronização
    const result = await syncServicesToDatabase(prisma, forceUpdate, deleteExisting);
    
    if (result.success) {
      console.log('Sincronização para produção concluída com sucesso');
      return res.json({
        sucesso: true,
        mensagem: `Sincronização concluída: ${result.stats.created} criados, ${result.stats.updated} atualizados, ${result.stats.skipped} ignorados, ${result.stats.errors.length} erros`,
        estatisticas: {
          total: result.stats.created + result.stats.updated + result.stats.skipped + result.stats.errors.length,
          created: result.stats.created,
          updated: result.stats.updated,
          skipped: result.stats.skipped,
          errors: result.stats.errors.length
        }
      });
    } else {
      console.error('Erro na sincronização para produção:', result.error);
      return res.status(500).json({
        sucesso: false,
        mensagem: `Erro na sincronização: ${result.error}`,
        detalhes: result.stats?.errors || []
      });
    }
  } catch (error) {
    console.error('Erro ao processar sincronização para produção:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: `Erro ao processar sincronização: ${error.message}`
    });
  }
});

/**
 * @route POST /sync/sync-to-demo
 * @desc Sincroniza dados do banco de dados para os arquivos de demonstração
 * @access Restrito (em produção)
 */
router.post('/sync-to-demo', async (req, res) => {
  try {
    console.log('Iniciando sincronização para arquivos de demonstração');
    
    // Executar sincronização
    const result = await syncDatabaseToDemo(prisma);
    
    if (result.success) {
      console.log('Sincronização para arquivos de demonstração concluída com sucesso');
      return res.json({
        sucesso: true,
        mensagem: `Sincronização concluída: ${result.stats.updated} serviços atualizados`,
        estatisticas: result.stats
      });
    } else {
      console.error('Erro na sincronização para arquivos de demonstração:', result.error);
      return res.status(500).json({
        sucesso: false,
        mensagem: `Erro na sincronização: ${result.error}`,
        detalhes: result.stats?.errors || []
      });
    }
  } catch (error) {
    console.error('Erro ao processar sincronização para arquivos de demonstração:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: `Erro ao processar sincronização: ${error.message}`
    });
  }
});

/**
 * @route GET /sync/status
 * @desc Verifica o status do sistema de sincronização
 * @access Público
 */
router.get('/status', async (req, res) => {
  try {
    console.log('Verificando status do sistema de sincronização');
    
    // Verificar conexão com o banco de dados
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Contar serviços no banco
    const servicosCount = await prisma.servico.count();
    
    // Buscar serviços para verificar a ordem
    const servicos = await prisma.servico.findMany({
      orderBy: {
        ordem: 'asc'
      },
      select: {
        id: true,
        nome: true,
        ordem: true
      }
    });
    
    // Verificar se todos os serviços da ordem específica estão presentes
    const servicosEncontrados = servicos.map(s => s.nome);
    const servicosFaltando = ORDEM_SERVICOS.filter(nome => !servicosEncontrados.includes(nome));
    
    // Verificar se a ordem está correta
    let ordemCorreta = true;
    const ordemAtual = servicos.map(s => s.nome);
    const ordemEsperadaExistente = ORDEM_SERVICOS.filter(nome => ordemAtual.includes(nome));
    
    let ultimoIndiceEncontrado = -1;
    for (const nome of ordemEsperadaExistente) {
      const indiceAtual = ordemAtual.indexOf(nome);
      if (indiceAtual > ultimoIndiceEncontrado) {
        ultimoIndiceEncontrado = indiceAtual;
      } else {
        ordemCorreta = false;
        break;
      }
    }
    
    console.log('Status do sistema de sincronização verificado com sucesso');
    
    return res.json({
      sucesso: true,
      status: {
        conexao: 'OK',
        servicos: {
          total: servicosCount,
          ordem: ordemCorreta ? 'Correta' : 'Incorreta',
          servicosFaltando: servicosFaltando,
          servicosExistentes: servicos.map(s => ({
            id: s.id,
            nome: s.nome,
            ordem: s.ordem
          }))
        },
        ambiente: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do sistema de sincronização:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: `Erro ao verificar status: ${error.message}`
    });
  }
});

/**
 * @route GET /sync/fix-order
 * @desc Corrige a ordem dos serviços no banco de dados
 * @access Restrito (em produção)
 */
router.get('/fix-order', async (req, res) => {
  try {
    console.log('Iniciando correção da ordem dos serviços');
    
    // Buscar todos os serviços
    const servicos = await prisma.servico.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log(`Encontrados ${servicos.length} serviços no banco de dados`);
    
    // Criar um mapa de serviços por nome para facilitar o acesso
    const servicosPorNome = {};
    servicos.forEach(s => {
      servicosPorNome[s.nome] = s;
    });
    
    // Atualizar a ordem dos serviços
    const atualizacoes = [];
    
    // Primeiro, processar os serviços na ordem específica
    for (let i = 0; i < ORDEM_SERVICOS.length; i++) {
      const nomeServico = ORDEM_SERVICOS[i];
      const servico = servicosPorNome[nomeServico];
      
      if (servico) {
        console.log(`Atualizando ordem do serviço "${nomeServico}" para ${i + 1}`);
        
        const atualizacao = await prisma.servico.update({
          where: { id: servico.id },
          data: { ordem: i + 1 }
        });
        
        atualizacoes.push({
          id: servico.id,
          nome: servico.nome,
          ordemAnterior: servico.ordem,
          ordemNova: i + 1
        });
      }
    }
    
    // Depois, processar os serviços que não estão na ordem específica
    const servicosForaOrdem = servicos.filter(s => !ORDEM_SERVICOS.includes(s.nome));
    let ordemAtual = ORDEM_SERVICOS.length;
    
    for (const servico of servicosForaOrdem) {
      console.log(`Atualizando ordem do serviço "${servico.nome}" para ${ordemAtual + 1}`);
      
      const atualizacao = await prisma.servico.update({
        where: { id: servico.id },
        data: { ordem: ordemAtual + 1 }
      });
      
      atualizacoes.push({
        id: servico.id,
        nome: servico.nome,
        ordemAnterior: servico.ordem,
        ordemNova: ordemAtual + 1
      });
      
      ordemAtual++;
    }
    
    console.log('Correção da ordem dos serviços concluída com sucesso');
    
    return res.json({
      sucesso: true,
      mensagem: `Ordem dos serviços corrigida com sucesso: ${atualizacoes.length} serviços atualizados`,
      atualizacoes
    });
  } catch (error) {
    console.error('Erro ao corrigir ordem dos serviços:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: `Erro ao corrigir ordem dos serviços: ${error.message}`
    });
  }
});

/**
 * @route GET /sync
 * @desc Página de administração para sincronização
 * @access Público (interface), Restrito (operações)
 */
router.get('/', (req, res) => {
  // Servir a página de sincronização sem verificação JWT inicial
  // A autenticação básica é implementada no server.js para controle de acesso
  const htmlPath = path.join(__dirname, '../views/admin/sync.html');
  
  try {
    res.sendFile(htmlPath);
  } catch (error) {
    console.error('Erro ao servir página de sincronização:', error);
    res.status(500).send('Erro ao carregar a interface de sincronização');
  }
});

export default router;