/**
 * Script para popular o banco de dados com serviços básicos
 * @version 1.3.2 - 2025-03-12 - Restaurado controle de execução e simplificado para evitar interferência com autenticação
 * @description Este script pode ser executado independentemente para garantir que o banco de dados tenha os serviços atualizados
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se o script deve ser executado
const FORCE_UPDATE = process.env.FORCE_UPDATE === 'true';
const SKIP_DB_POPULATION = process.env.SKIP_DB_POPULATION === 'false';

// Função principal
async function popularBancoDados() {
  console.log('Iniciando script de população do banco de dados...');
  
  // Verificar se o script deve ser pulado
  if (SKIP_DB_POPULATION && !FORCE_UPDATE) {
    console.log('SKIP_DB_POPULATION está ativado. Pulando população do banco de dados.');
    console.log('Para forçar a execução, defina FORCE_UPDATE=true');
    return;
  }
  
  // Verificar variáveis de ambiente
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
    
    // Remover APENAS serviços existentes, não afetando outras tabelas
    console.log('Removendo APENAS serviços existentes para atualização...');
    await prisma.servico.deleteMany({});
    console.log('Serviços existentes removidos com sucesso.');
    
    console.log("Inicializando banco de dados com serviços atualizados...");
    
    // Dados atualizados para o simulador de preços (conforme seedServicos.js)
    const servicos = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Inclui direção de poses, correção básica de cor e entrega digital em alta resolução.',
        preco_base: 200.00,
        duracao_media_captura: '2 a 3 horas',
        duracao_media_tratamento: '7 dias úteis',
        entregaveis: '20 fotos com correção básica (em alta resolução)',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao: 'Sessão fotográfica em ambiente externo para casais ou famílias, com foco em momentos naturais e espontâneos. Inclui direção de poses e edição básica.',
        preco_base: 300.00,
        duracao_media_captura: '2 a 3 horas',
        duracao_media_tratamento: '10 dias úteis',
        entregaveis: '30 fotos com correção básica (em alta resolução)',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada, Álbum Físico',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao: 'Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Inclui edição básica e entrega digital.',
        preco_base: 600.00,
        duracao_media_captura: '4 a 6 horas',
        duracao_media_tratamento: '15 dias úteis',
        entregaveis: '100 fotos com correção básica (em alta resolução)',
        possiveis_adicionais: 'Horas Adicionais, Álbum Digital, Álbum Físico',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
        preco_base: 800.00,
        duracao_media_captura: '4 a 6 horas',
        duracao_media_tratamento: '20 dias úteis',
        entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
        possiveis_adicionais: 'Horas Adicionais, Edição Estendida, Drone',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao: 'Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.',
        preco_base: 350.00,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: '7 dias úteis',
        entregaveis: '15 fotos em alta resolução com edição básica',
        possiveis_adicionais: 'Horas Adicionais, Edição Avançada',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
        preco_base: 450.00,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: '10 dias úteis',
        entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
        possiveis_adicionais: 'Horas Adicionais, Edição Estendida',
        valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        descricao: 'Documentação em vídeo e foto da sua viagem em família, com edição profissional e entrega em formato digital.',
        preco_base: 700.00,
        duracao_media_captura: '6 a 8 horas',
        duracao_media_tratamento: '15 dias úteis',
        entregaveis: 'Vídeo editado de 3-5 minutos + 30 fotos em alta resolução',
        possiveis_adicionais: 'Dia Adicional, Edição Estendida',
        valor_deslocamento: 'Sob consulta (depende da localização)'
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        descricao: 'Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.',
        preco_base: 900.00,
        duracao_media_captura: '6 a 10 horas',
        duracao_media_tratamento: '20 dias úteis',
        entregaveis: 'Vídeo editado de 5-8 minutos + 50 fotos em alta resolução',
        possiveis_adicionais: 'Dia Adicional, Edição Estendida, Drone',
        valor_deslocamento: 'Sob consulta (depende da localização)'
      }
    ];
    
    // Inserir serviços no banco de dados
    console.log('Inserindo serviços no banco de dados...');
    for (const servico of servicos) {
      await prisma.servico.create({
        data: servico
      });
    }
    
    // Verificar se os serviços foram inseridos corretamente
    const servicosAposInsercao = await prisma.servico.count();
    console.log(`Total de serviços após inserção: ${servicosAposInsercao}`);
    
    console.log('Todos os serviços foram inseridos com sucesso!');
    
    // Atualizar os arquivos de dados de demonstração
    await atualizarArquivosDadosDemonstracao();
    
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Atualiza os arquivos de dados de demonstração com os dados fixos
 */
async function atualizarArquivosDadosDemonstracao() {
  try {
    // Dados de demonstração fixos
    const dadosDemonstracao = [
      {
        id: 1,
        nome: "Ensaio Fotográfico Pessoal",
        descricao: "Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Inclui direção de poses, correção básica de cor e entrega digital em alta resolução.",
        preco_base: 200.00,
        duracao_media: 3,
        detalhes: {
          captura: "2 a 3 horas",
          tratamento: "7 dias úteis",
          entregaveis: "20 fotos com correção básica (em alta resolução)",
          adicionais: "Edição Mediana, Edição Avançada",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 2,
        nome: "Ensaio Externo de Casal ou Família",
        descricao: "Sessão fotográfica em ambiente externo para casais ou famílias, com foco em momentos naturais e espontâneos. Inclui direção de poses e edição básica.",
        preco_base: 300.00,
        duracao_media: 3,
        detalhes: {
          captura: "2 a 3 horas",
          tratamento: "10 dias úteis",
          entregaveis: "30 fotos com correção básica (em alta resolução)",
          adicionais: "Edição Mediana, Edição Avançada, Álbum Físico",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 3,
        nome: "Cobertura Fotográfica de Evento Social",
        descricao: "Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Inclui edição básica e entrega digital.",
        preco_base: 600.00,
        duracao_media: 5,
        detalhes: {
          captura: "4 a 6 horas",
          tratamento: "15 dias úteis",
          entregaveis: "100 fotos com correção básica (em alta resolução)",
          adicionais: "Horas Adicionais, Álbum Digital, Álbum Físico",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 4,
        nome: "Filmagem de Evento Social (Solo)",
        descricao: "Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.",
        preco_base: 800.00,
        duracao_media: 5,
        detalhes: {
          captura: "4 a 6 horas",
          tratamento: "20 dias úteis",
          entregaveis: "Vídeo editado de 3-5 minutos em alta resolução",
          adicionais: "Horas Adicionais, Edição Estendida, Drone",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 5,
        nome: "Fotografia Aérea com Drone",
        descricao: "Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.",
        preco_base: 350.00,
        duracao_media: 2,
        detalhes: {
          captura: "1 a 2 horas",
          tratamento: "7 dias úteis",
          entregaveis: "15 fotos em alta resolução com edição básica",
          adicionais: "Horas Adicionais, Edição Avançada",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 6,
        nome: "Filmagem Aérea com Drone",
        descricao: "Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.",
        preco_base: 450.00,
        duracao_media: 2,
        detalhes: {
          captura: "1 a 2 horas",
          tratamento: "10 dias úteis",
          entregaveis: "Vídeo editado de 1-2 minutos em alta resolução",
          adicionais: "Horas Adicionais, Edição Estendida",
          deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
        }
      },
      {
        id: 7,
        nome: "Pacote VLOG Family (Ilha do Mel ou Outros Lugares)",
        descricao: "Documentação em vídeo e foto da sua viagem em família, com edição profissional e entrega em formato digital.",
        preco_base: 700.00,
        duracao_media: 7,
        detalhes: {
          captura: "6 a 8 horas",
          tratamento: "15 dias úteis",
          entregaveis: "Vídeo editado de 3-5 minutos + 30 fotos em alta resolução",
          adicionais: "Dia Adicional, Edição Estendida",
          deslocamento: "Sob consulta (depende da localização)"
        }
      },
      {
        id: 8,
        nome: "Pacote VLOG Friends & Community",
        descricao: "Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.",
        preco_base: 900.00,
        duracao_media: 8,
        detalhes: {
          captura: "6 a 10 horas",
          tratamento: "20 dias úteis",
          entregaveis: "Vídeo editado de 5-8 minutos + 50 fotos em alta resolução",
          adicionais: "Dia Adicional, Edição Estendida, Drone",
          deslocamento: "Sob consulta (depende da localização)"
        }
      }
    ];
    
    // Caminhos para os arquivos de dados de demonstração
    const caminhos = [
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
 * Gerado automaticamente em ${new Date().toISOString()}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE
 */

export const dadosDemonstracao = ${JSON.stringify(dadosDemonstracao, null, 2)};
export const servicos = dadosDemonstracao;

export default dadosDemonstracao;
`;
      
      // Escrever o arquivo
      await fs.writeFile(caminho, conteudoArquivo, 'utf8');
      console.log(`Arquivo de dados de demonstração atualizado: ${caminho}`);
    }
    
    console.log(`Dados de demonstração atualizados com sucesso!`);
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
