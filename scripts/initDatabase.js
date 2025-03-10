// Script para inicializar o banco de dados com serviços padrão
// Este script verifica se existem serviços no banco e, se não, insere os serviços padrão
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configurar variáveis de ambiente
dotenv.config();
console.log('Inicializando banco de dados...');

// Serviços padrão a serem inseridos no banco de dados
const SERVICOS_PADRAO = [
  {
    nome: "Ensaio Fotográfico Pessoal",
    descricao: "Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Direção de poses, edição profissional básica e entrega digital em alta resolução.",
    preco_base: 300.00,
    duracao_media_captura: "2 a 3 horas",
    duracao_media_tratamento: "até 7 dias úteis",
    entregaveis: "20 fotos editadas em alta resolução",
    possiveis_adicionais: "Maquiagem e cabelo, troca adicional de figurino, cenário especializado",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    nome: "Ensaio Externo de Casal ou Família",
    descricao: "Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com tratamento profissional.",
    preco_base: 500.00,
    duracao_media_captura: "2 a 4 horas",
    duracao_media_tratamento: "até 10 dias úteis",
    entregaveis: "30 fotos editadas em alta resolução",
    possiveis_adicionais: "participantes adicionais, maquiagem e produção de figurino, sessão na \"Golden Hour\"",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    nome: "Cobertura Fotográfica de Evento Social",
    descricao: "Cobertura profissional de fotos em eventos como aniversários, batizados e eventos corporativos.",
    preco_base: 1000.00,
    duracao_media_captura: "4 horas",
    duracao_media_tratamento: "até 10 dias úteis",
    entregaveis: "40 fotos editadas em alta resolução",
    possiveis_adicionais: "horas extras, álbum físico ou fotolivro, segundo fotógrafo",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    nome: "Filmagem de Evento Social (Solo)",
    descricao: "Filmagem profissional para eventos sociais e corporativos, com edição dinâmica e trilha sonora.",
    preco_base: 1500.00,
    duracao_media_captura: "4 horas",
    duracao_media_tratamento: "até 15 dias úteis",
    entregaveis: "vídeo editado de 3 a 5 minutos",
    possiveis_adicionais: "horas extras, depoimentos, vídeo bruto",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  },
  {
    nome: "Fotografia Aérea com Drone",
    descricao: "Imagens aéreas profissionais para imóveis, paisagens ou eventos.",
    preco_base: 600.00,
    duracao_media_captura: "2 horas",
    duracao_media_tratamento: "até 7 dias úteis",
    entregaveis: "15 fotos aéreas editadas",
    possiveis_adicionais: "autorizações especiais, pós-produção avançada",
    valor_deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
  }
];

// Função principal
async function inicializarBancoDeDados() {
  // Criar instância do Prisma
  const prisma = new PrismaClient();
  
  try {
    // Verificar se já existem serviços no banco
    console.log('Verificando se existem serviços no banco de dados...');
    const servicosExistentes = await prisma.servico.count();
    
    if (servicosExistentes === 0) {
      console.log('Nenhum serviço encontrado. Inserindo serviços padrão...');
      
      // Inserir serviços padrão
      await prisma.servico.createMany({
        data: SERVICOS_PADRAO
      });
      
      console.log(`${SERVICOS_PADRAO.length} serviços inseridos com sucesso!`);
    } else {
      console.log(`${servicosExistentes} serviços encontrados. Não é necessário inicializar.`);
    }
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  } finally {
    // Fechar conexão com o Prisma
    await prisma.$disconnect();
  }
}

// Executar a função principal
inicializarBancoDeDados()
  .then(() => {
    console.log('Processo de inicialização do banco de dados concluído!');
  })
  .catch((error) => {
    console.error('Erro durante o processo de inicialização:', error);
    process.exit(1);
  });
