import express from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateJWT } from '../middleware/auth.js';
import { syncServicesToDatabase, syncDatabaseToDemo } from '../scripts/syncDatabase.js';

const router = express.Router();
const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rota para sincronizar dados de demonstração
 * @version 1.0.0
 * @date 2025-03-11
 */
router.post('/demo-data', authenticateJWT, async (req, res) => {
  try {
    // Buscar todos os serviços do banco de dados
    const servicos = await prisma.servico.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    
    if (servicos.length === 0) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Nenhum serviço encontrado no banco de dados.' 
      });
    }
    
    // Transformar os serviços para o formato do PriceSimulator
    const servicosTransformados = servicos.map(servico => {
      // Calcula a duração média aproximada baseada nos campos individuais
      const duracaoCaptura = parseInt(servico.duracao_media_captura?.split(' ')[0] || 0);
      const duracaoTratamento = parseInt(servico.duracao_media_tratamento?.split(' ')[0] || 0);
      const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
      
      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco_base: servico.preco_base,
        duracao_media: duracaoMedia,
        detalhes: {
          captura: servico.duracao_media_captura || '',
          tratamento: servico.duracao_media_tratamento || '',
          entregaveis: servico.entregaveis || '',
          adicionais: servico.possiveis_adicionais || '',
          deslocamento: servico.valor_deslocamento || ''
        }
      };
    });
    
    // Caminho para o arquivo de dados de demonstração
    const caminhoArquivo = path.resolve(__dirname, '../../src/data/servicos.js');
    
    // Criar o conteúdo do arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const conteudoArquivo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 2.0
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pela API de sincronização
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(servicosTransformados, null, 2)};
`;
    
    // Escrever o arquivo
    await fs.writeFile(caminhoArquivo, conteudoArquivo, 'utf8');
    
    return res.status(200).json({ 
      sucesso: true, 
      mensagem: `Dados de demonstração sincronizados com sucesso! (${servicosTransformados.length} serviços)` 
    });
    
  } catch (error) {
    console.error('Erro ao sincronizar dados de demonstração:', error);
    return res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao sincronizar dados de demonstração.', 
      erro: error.message 
    });
  }
});

/**
 * Rota para sincronizar dados de demonstração com o banco de dados de produção
 * @version 1.0.0
 * @date 2025-03-13
 */
router.post('/sync-to-production', authenticateJWT, async (req, res) => {
  try {
    const { forceUpdate = false, deleteExisting = false } = req.body;
    
    console.log(`Iniciando sincronização com o banco de dados de produção...`);
    console.log(`Parâmetros: forceUpdate=${forceUpdate}, deleteExisting=${deleteExisting}`);
    
    // Validar parâmetros
    if (deleteExisting === true && process.env.NODE_ENV === 'production') {
      console.warn('Tentativa de exclusão de dados em ambiente de produção!');
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Exclusão de dados não permitida em ambiente de produção.'
      });
    }
    
    // Executar a sincronização
    const resultado = await syncServicesToDatabase(forceUpdate, deleteExisting);
    
    if (resultado.success) {
      return res.status(200).json({
        sucesso: true,
        mensagem: resultado.message,
        estatisticas: resultado.stats
      });
    } else {
      return res.status(500).json({
        sucesso: false,
        mensagem: resultado.message,
        erro: resultado.error
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar com o banco de dados de produção:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao sincronizar com o banco de dados de produção.',
      erro: error.message
    });
  }
});

/**
 * Rota para sincronizar o banco de dados com o arquivo de dados de demonstração
 * @version 1.0.0
 * @date 2025-03-13
 */
router.post('/sync-from-production', authenticateJWT, async (req, res) => {
  try {
    console.log(`Iniciando sincronização do banco de dados para o arquivo de demonstração...`);
    
    // Executar a sincronização
    const resultado = await syncDatabaseToDemo();
    
    if (resultado.success) {
      return res.status(200).json({
        sucesso: true,
        mensagem: resultado.message,
        quantidade: resultado.count
      });
    } else {
      return res.status(500).json({
        sucesso: false,
        mensagem: resultado.message,
        erro: resultado.error
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar do banco de dados para o arquivo de demonstração:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao sincronizar do banco de dados para o arquivo de demonstração.',
      erro: error.message
    });
  }
});

export default router;