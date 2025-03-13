/**
 * Script de Sincronização do Catálogo de Serviços
 * @version 1.0.0 - 2025-03-13
 * @description Atualiza o catálogo de serviços em todos os pontos do sistema (banco de dados e frontend)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const serverDir = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(serverDir, '.env') });

// Verificar a URL do banco de dados
console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL}`);
const dbPath = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('file:', '') : '';
console.log(`📊 Caminho do banco de dados: ${dbPath}`);

// Atualizar a URL do banco de dados para usar o caminho correto
// Garantir que estamos usando o mesmo banco de dados que o servidor
process.env.DATABASE_URL = 'file:C:\\GIT DESKTOP\\lytspot\\server\\database.sqlite';
console.log(`📊 DATABASE_URL atualizada: ${process.env.DATABASE_URL}`);

// Cliente Prisma
const prisma = new PrismaClient();

// Caminhos para arquivos
const frontendServicesPath = path.join(rootDir, 'src', 'data', 'servicos.js');
const backupDir = path.join(rootDir, 'backups', `${new Date().toISOString().split('T')[0]}`);

// Novos serviços conforme catálogo atualizado
const novosServicos = [
  {
    nome: "VLOG - Aventuras em Família",
    descricao: "Documentação em vídeo e fotos de aventuras familiares, ideal para viagens, passeios e momentos especiais. Inclui edição profissional e trilha sonora personalizada.",
    preco_base: 1500,
    duracao_media: 8, // Em horas
    detalhes: {
      captura: "6 a 8 horas",
      tratamento: "14 dias úteis",
      entregaveis: "Vídeo editado de 5-7 minutos + 30 fotos em alta resolução",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)"
    }
  },
  {
    nome: "VLOG - Amigos e Comunidade",
    descricao: "Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.",
    preco_base: 900,
    duracao_media: 4, // Em horas
    detalhes: {
      captura: "4 a 6 horas",
      tratamento: "10 dias úteis",
      entregaveis: "Vídeo editado de 3-5 minutos + 25 fotos em alta resolução",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)"
    }
  },
  {
    nome: "Cobertura Fotográfica de Evento Social",
    descricao: "Registro fotográfico profissional para eventos sociais como aniversários, confraternizações e pequenas celebrações. Inclui edição básica e entrega digital.",
    preco_base: 700,
    duracao_media: 4, // Em horas
    detalhes: {
      captura: "3 a 4 horas",
      tratamento: "7 dias úteis",
      entregaveis: "50 fotos em alta resolução com edição básica",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    nome: "Filmagem de Evento Social",
    descricao: "Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.",
    preco_base: 800,
    duracao_media: 4, // Em horas
    detalhes: {
      captura: "3 a 4 horas",
      tratamento: "10 dias úteis",
      entregaveis: "Vídeo editado de 3-5 minutos em alta resolução",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    nome: "Ensaio Fotográfico de Família",
    descricao: "Sessão fotográfica para famílias em locação externa ou estúdio, ideal para registrar momentos especiais e criar recordações duradouras.",
    preco_base: 450,
    duracao_media: 2, // Em horas
    detalhes: {
      captura: "1 a 2 horas",
      tratamento: "7 dias úteis",
      entregaveis: "20 fotos editadas em alta resolução",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    nome: "Filmagem Aérea com Drone",
    descricao: "Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.",
    preco_base: 450,
    duracao_media: 2, // Em horas
    detalhes: {
      captura: "1 a 2 horas",
      tratamento: "7 dias úteis",
      entregaveis: "Vídeo editado de 1-2 minutos em alta resolução",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)"
    }
  },
  {
    nome: "Fotografia Aérea com Drone",
    descricao: "Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.",
    preco_base: 350,
    duracao_media: 2, // Em horas
    detalhes: {
      captura: "1 a 2 horas",
      tratamento: "5 dias úteis",
      entregaveis: "10 fotos em alta resolução com edição básica",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)"
    }
  }
];

/**
 * Função para converter os novos serviços para o formato do banco de dados
 * @returns {Array} Array de objetos no formato esperado pelo Prisma
 */
function converterParaFormatoBancoDados() {
  return novosServicos.map(servico => ({
    nome: servico.nome,
    descricao: servico.descricao,
    preco_base: servico.preco_base,
    duracao_media_captura: servico.detalhes.captura,
    duracao_media_tratamento: servico.detalhes.tratamento,
    entregaveis: servico.detalhes.entregaveis,
    possiveis_adicionais: servico.detalhes.adicionais,
    valor_deslocamento: servico.detalhes.deslocamento
  }));
}

// Versão simplificada dos serviços para o banco de dados
const servicosParaBanco = converterParaFormatoBancoDados();

/**
 * Cria diretório de backup se não existir
 */
async function criarDiretorioBackup() {
  try {
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`✅ Diretório de backup criado: ${backupDir}`);
  } catch (error) {
    console.error(`❌ Erro ao criar diretório de backup: ${error.message}`);
    throw error;
  }
}

/**
 * Faz backup de um arquivo
 * @param {string} filePath Caminho do arquivo
 */
async function fazerBackupArquivo(filePath) {
  try {
    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, `${fileName}.bak`);
    
    try {
      await fs.access(filePath);
      await fs.copyFile(filePath, backupPath);
      console.log(`✅ Backup criado: ${backupPath}`);
    } catch (error) {
      console.log(`ℹ️ Arquivo original não encontrado, nenhum backup necessário: ${filePath}`);
    }
    
    return backupPath;
  } catch (error) {
    console.error(`❌ Erro ao fazer backup do arquivo: ${error.message}`);
    throw error;
  }
}

/**
 * Atualiza o arquivo de serviços do frontend
 */
async function atualizarArquivoFrontend() {
  try {
    console.log('🔄 Atualizando arquivo de serviços do frontend...');
    
    // Fazer backup do arquivo original
    await fazerBackupArquivo(frontendServicesPath);
    
    // Gerar novo conteúdo
    const dataAtual = new Date().toISOString().split('T')[0];
    const conteudo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 2.1
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script syncDatabase.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(novosServicos, null, 2)};
`;
    
    // Escrever novo conteúdo
    await fs.writeFile(frontendServicesPath, conteudo, 'utf8');
    console.log(`✅ Arquivo de serviços do frontend atualizado: ${frontendServicesPath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar arquivo de serviços do frontend: ${error.message}`);
    return false;
  }
}

/**
 * Atualiza o banco de dados com os novos serviços
 */
async function atualizarBancoDados() {
  try {
    console.log('🔄 Atualizando banco de dados...');
    
    // Verificar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida');
    
    // Limpar serviços existentes
    await prisma.servico.deleteMany({});
    console.log('✅ Serviços anteriores removidos com sucesso');
    
    // Inserir novos serviços
    for (const servico of servicosParaBanco) {
      await prisma.servico.create({
        data: servico
      });
    }
    
    console.log(`✅ ${servicosParaBanco.length} serviços inseridos com sucesso no banco de dados!`);
    
    // Verificar se todos os serviços foram inseridos
    const countServicos = await prisma.servico.count();
    console.log(`📊 Total de serviços no banco de dados: ${countServicos}`);
    
    if (countServicos !== servicosParaBanco.length) {
      console.warn(`⚠️ Atenção: Número de serviços no banco (${countServicos}) difere do número de serviços atualizados (${servicosParaBanco.length})`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar banco de dados: ${error.message}`);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  }
}

/**
 * Função principal que orquestra todo o processo
 */
async function sincronizarDados() {
  console.log('=== INICIANDO SINCRONIZAÇÃO DE DADOS ===');
  console.log(`Data e hora: ${new Date().toISOString()}`);
  console.log(`Versão: 1.0.0 - 2025-03-13`);
  
  try {
    // Criar diretório de backup
    await criarDiretorioBackup();
    
    // Atualizar arquivo do frontend
    const frontendAtualizado = await atualizarArquivoFrontend();
    
    if (!frontendAtualizado) {
      console.error('❌ Falha ao atualizar arquivo do frontend. Continuando com o banco de dados...');
    }
    
    // Atualizar banco de dados
    const bancoDadosAtualizado = await atualizarBancoDados();
    
    if (!bancoDadosAtualizado) {
      console.error('❌ Falha ao atualizar banco de dados.');
    }
    
    // Verificar resultado geral
    if (frontendAtualizado && bancoDadosAtualizado) {
      console.log('✅ Sincronização de dados concluída com sucesso!');
    } else {
      console.warn('⚠️ Sincronização concluída com avisos ou erros. Verifique os logs acima.');
    }
    
    // Registrar no log de versão
    const logPath = path.join(rootDir, 'logs', 'atualizacoes.log');
    const logMessage = `[${new Date().toISOString()}] Atualização do catálogo de serviços v1.0.0 - ${frontendAtualizado ? 'Frontend OK' : 'Frontend FALHA'} - ${bancoDadosAtualizado ? 'Banco OK' : 'Banco FALHA'}\n`;
    
    try {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.appendFile(logPath, logMessage, 'utf8');
      console.log(`✅ Log de atualização registrado: ${logPath}`);
    } catch (error) {
      console.error(`❌ Erro ao registrar log de atualização: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Erro durante sincronização de dados: ${error.message}`);
  }
  
  console.log('=== SINCRONIZAÇÃO CONCLUÍDA ===');
}

// Executar função principal
sincronizarDados()
  .then(() => {
    console.log('✨ Processo finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
