import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script para atualizar os serviços no banco de dados
 * Baseado no catálogo completo da Lytspot
 */
async function main() {
  try {
    console.log('Iniciando a atualização dos serviços...');

    // Catálogo completo de serviços da Lytspot
    const servicosAtualizados = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Direção de poses, edição profissional básica e entrega digital em alta resolução.',
        preco_base: 300.00,
        duracao_media_captura: '2 a 3 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '20 fotos editadas em alta resolução',
        possiveis_adicionais: 'Maquiagem e cabelo, troca adicional de figurino, cenário especializado',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com tratamento profissional.',
        preco_base: 500.00,
        duracao_media_captura: '2 a 4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '30 fotos editadas em alta resolução',
        possiveis_adicionais: 'participantes adicionais, maquiagem e produção de figurino, sessão na "Golden Hour"',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao: 'Cobertura profissional de fotos em eventos como aniversários, batizados e eventos corporativos.',
        preco_base: 1000.00,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '40 fotos editadas em alta resolução',
        possiveis_adicionais: 'horas extras, álbum físico ou fotolivro, segundo fotógrafo',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao: 'Filmagem profissional para eventos sociais e corporativos, com edição dinâmica e trilha sonora.',
        preco_base: 1500.00,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 15 dias úteis',
        entregaveis: 'vídeo editado de 3 a 5 minutos',
        possiveis_adicionais: 'horas extras, depoimentos, vídeo bruto',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao: 'Imagens aéreas profissionais para imóveis, paisagens ou eventos.',
        preco_base: 600.00,
        duracao_media_captura: '2 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '15 fotos aéreas editadas',
        possiveis_adicionais: 'autorizações especiais, pós-produção avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao: 'Filmagens aéreas para eventos, vídeos institucionais ou publicidade, com edição profissional.',
        preco_base: 800.00,
        duracao_media_captura: '2 horas',
        duracao_media_tratamento: 'até 12 dias úteis',
        entregaveis: 'vídeo editado de 1 a 3 minutos',
        possiveis_adicionais: 'autorizações especiais, legendas e logotipos, integração com filmagens em solo',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        descricao: 'Produção personalizada de vlog familiar em destinos especiais com fotos e vídeos editados.',
        preco_base: 1600.00,
        duracao_media_captura: '8 a 12 horas',
        duracao_media_tratamento: 'até 20 dias úteis',
        entregaveis: 'vídeo principal (10 min), teaser (1 a 3 min), fotos editadas',
        possiveis_adicionais: 'edição adicional, cobertura complementar, dias extras',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        descricao: 'Pacote exclusivo para grupos de amigos ou comunidades, perfeito para registrar viagens, encontros ou eventos colaborativos com fotos e vídeos profissionais.',
        preco_base: 1400.00,
        duracao_media_captura: '6 a 10 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: 'vídeo principal (7 a 10 min), teaser (até 2 min), 30 fotos editadas',
        possiveis_adicionais: 'dias adicionais, filmagens aéreas, edição especial para redes sociais',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      }
    ];

    // Limpar todos os serviços existentes
    await prisma.servico.deleteMany({});
    console.log('Serviços existentes removidos com sucesso.');
    
    // Criar os novos serviços
    for (const servico of servicosAtualizados) {
      await prisma.servico.create({
        data: servico
      });
    }
    
    console.log(`${servicosAtualizados.length} serviços atualizados criados com sucesso!`);
    console.log('Atualização dos serviços concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a atualização dos serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
