/**
 * Script para popular o banco de dados com serviços básicos
 * @version 1.1.0 - 2025-03-12 - Atualizado com novos serviços e preços
 * @description Este script pode ser executado independentemente para garantir que o banco de dados tenha os serviços atualizados
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Função principal
async function popularBancoDados() {
  console.log('Iniciando script de população do banco de dados...');
  
  // Verificar variáveis de ambiente
  console.log('DATABASE_URL:', process.env.DATABASE_URL || 'Não definida');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Não definido');
  
  const prisma = new PrismaClient();
  
  try {
    // Verificar conexão com o banco de dados
    console.log('Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    // Verificar se já existem serviços
    const servicosExistentes = await prisma.servico.count();
    console.log(`Serviços existentes no banco de dados: ${servicosExistentes}`);
    
    // Remover serviços existentes para garantir que os dados estejam atualizados
    console.log('Removendo serviços existentes para atualização...');
    await prisma.servico.deleteMany({});
    console.log('Serviços existentes removidos com sucesso.');
    
    console.log("Inicializando banco de dados com serviços atualizados...");
    
    // Dados atualizados para o simulador de preços (conforme seedServicos.js)
    const servicos = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        descricao: 'Sessão fotográfica individual para capturar sua melhor versão, com direção profissional e tratamento básico de imagem.',
        preco_base: 350.00,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '20 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana (R$150), Edição Avançada (R$250)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com edição básica.',
        preco_base: 450.00,
        duracao_media_captura: '2 a 4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '30 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana (R$200), Edição Avançada (R$300)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao: 'Cobertura profissional para eventos como aniversários, batizados e eventos corporativos.',
        preco_base: 800.00,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '40 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana (R$200), Edição Avançada (R$300)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao: 'Captação profissional de vídeo para eventos sociais, com edição básica.',
        preco_base: 1200.00,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
        possiveis_adicionais: 'Edição Mediana (R$250), Edição Avançada (R$400)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao: 'Imagens aéreas em alta resolução para imóveis, eventos e paisagens.',
        preco_base: 700.00,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '15 fotos aéreas editadas',
        possiveis_adicionais: 'Edição Mediana (R$100), Edição Avançada (R$150)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao: 'Filmagens aéreas para eventos, vídeos institucionais e publicidade, com edição básica.',
        preco_base: 900.00,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: 'Vídeo editado de 1-2 minutos em 4K',
        possiveis_adicionais: 'Edição Mediana (R$150), Edição Avançada (R$250)',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        descricao: 'Registro completo de viagens e passeios familiares, com fotos e vídeos de alta qualidade.',
        preco_base: 1500.00,
        duracao_media_captura: '4 a 6 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: '30 fotos editadas + vídeo de 3-5 minutos',
        possiveis_adicionais: 'Edição Mediana (R$300), Edição Avançada (R$500)',
        valor_deslocamento: 'Sob consulta, dependendo da localidade'
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        descricao: 'Pacote ideal para registrar encontros e eventos comunitários com fotos e vídeos profissionais.',
        preco_base: 1800.00,
        duracao_media_captura: '6 a 8 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: '40 fotos editadas + vídeo de 5-7 minutos',
        possiveis_adicionais: 'Edição Mediana (R$350), Edição Avançada (R$600)',
        valor_deslocamento: 'Sob consulta, dependendo da localidade'
      }
    ];
    
    // Inserir os serviços no banco de dados
    console.log('Inserindo serviços no banco de dados...');
    
    for (const servico of servicos) {
      await prisma.servico.create({
        data: {
          ...servico,
          // Adicionar campos de data
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`Serviço inserido: ${servico.nome}`);
    }
    
    // Verificar se os serviços foram inseridos corretamente
    const servicosAposInsercao = await prisma.servico.count();
    console.log(`Total de serviços após inserção: ${servicosAposInsercao}`);
    
    // Sincronizar dados de demonstração para o frontend
    console.log('Sincronizando dados de demonstração para o frontend...');
    await sincronizarDadosDemonstracao(prisma);
    
    console.log('Todos os serviços foram inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Sincroniza os dados de demonstração para o frontend
 * @param {PrismaClient} prisma - Cliente Prisma para acesso ao banco de dados
 */
async function sincronizarDadosDemonstracao(prisma) {
  try {
    // Buscar todos os serviços do banco de dados
    const servicos = await prisma.servico.findMany();
    
    if (servicos.length === 0) {
      console.log('Nenhum serviço encontrado para sincronizar.');
      return;
    }
    
    // Transformar os serviços no formato esperado pelo frontend
    const servicosTransformados = servicos.map(servico => {
      // Extrair a duração média em horas a partir da string
      let duracaoMedia = 3; // Valor padrão
      
      if (servico.duracao_media_captura) {
        const match = servico.duracao_media_captura.match(/(\d+)/);
        if (match) {
          duracaoMedia = parseInt(match[0], 10);
        }
      }
      
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
    
    // Atualizar os arquivos de dados de demonstração
    await atualizarArquivoDadosDemonstracao(servicosTransformados);
  } catch (error) {
    console.error('Erro ao sincronizar dados de demonstração:', error);
  }
}

/**
 * Atualiza os arquivos de dados de demonstração com os serviços atuais
 * @param {Array} servicos - Lista de serviços transformados
 */
async function atualizarArquivoDadosDemonstracao(servicos) {
  try {
    // Caminhos para os arquivos de dados de demonstração
    const caminhos = [
      './src/data/servicos.js',
      './src/components/pricing/dadosDemonstracao.js'
    ];
    
    for (const caminho of caminhos) {
      // Verificar se o diretório existe
      const diretorio = path.dirname(caminho);
      try {
        await fs.access(diretorio);
      } catch (error) {
        console.log(`Criando diretório ${diretorio}...`);
        await fs.mkdir(diretorio, { recursive: true });
      }
      
      // Conteúdo do arquivo
      const conteudoArquivo = `/**
 * Dados de demonstração para o simulador de preços
 * Gerado automaticamente a partir do banco de dados em ${new Date().toISOString()}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE
 */

export const servicos = ${JSON.stringify(servicos, null, 2)};
export const dadosDemonstracao = servicos;

export default servicos;
`;
      
      // Escrever o arquivo
      await fs.writeFile(caminho, conteudoArquivo, 'utf8');
      console.log(`Arquivo de dados de demonstração atualizado: ${caminho}`);
    }
    
    console.log(`Dados de demonstração sincronizados com sucesso! (${servicos.length} serviços)`);
  } catch (error) {
    console.error('Erro ao atualizar arquivos de dados de demonstração:', error);
  }
}

// Executar a função principal
popularBancoDados()
  .then(() => {
    console.log('Script de população do banco de dados concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
  });
