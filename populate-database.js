/**
 * Script para popular o banco de dados com serviços básicos
 * @version 1.0.0 - 2025-03-12 - Script inicial para população do banco de dados
 * @description Este script pode ser executado independentemente para garantir que o banco de dados tenha os serviços básicos
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

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
    
    if (servicosExistentes === 0) {
      console.log("Nenhum serviço encontrado. Inicializando banco de dados com serviços básicos...");
      
      // Dados básicos para o simulador de preços
      const servicos = [
        {
          nome: 'Ensaio Fotográfico Pessoal',
          descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal.',
          preco_base: 200.00,
          duracao_media_captura: '2 a 3 horas',
          duracao_media_tratamento: 'até 7 dias úteis',
          entregaveis: '20 fotos editadas em alta resolução',
          possiveis_adicionais: 'Edição avançada, maquiagem profissional',
          valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
        },
        {
          nome: 'Ensaio Externo de Casal ou Família',
          descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos.',
          preco_base: 350.00,
          duracao_media_captura: '2 a 4 horas',
          duracao_media_tratamento: 'até 10 dias úteis',
          entregaveis: '30 fotos editadas em alta resolução',
          possiveis_adicionais: 'Álbum impresso, fotos adicionais',
          valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
        },
        {
          nome: 'Fotografia de Eventos',
          descricao: 'Cobertura fotográfica de eventos sociais, corporativos ou festas, com entrega de galeria digital.',
          preco_base: 500.00,
          duracao_media_captura: '4 a 8 horas',
          duracao_media_tratamento: 'até 14 dias úteis',
          entregaveis: '100+ fotos editadas em alta resolução, galeria online',
          possiveis_adicionais: 'Impressões, segundo fotógrafo, entrega expressa',
          valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
        },
        {
          nome: 'Fotografia de Produto',
          descricao: 'Fotografias profissionais de produtos para e-commerce, catálogos ou marketing digital.',
          preco_base: 300.00,
          duracao_media_captura: '2 a 4 horas',
          duracao_media_tratamento: 'até 5 dias úteis',
          entregaveis: '10 fotos por produto em alta resolução',
          possiveis_adicionais: 'Vídeos 360°, composições especiais',
          valor_deslocamento: 'gratuito em estúdio, externo sob consulta'
        },
        {
          nome: 'Ensaio Pré-Wedding',
          descricao: 'Sessão fotográfica para casais antes do casamento, em locação especial.',
          preco_base: 450.00,
          duracao_media_captura: '3 a 5 horas',
          duracao_media_tratamento: 'até 12 dias úteis',
          entregaveis: '40 fotos editadas em alta resolução',
          possiveis_adicionais: 'Álbum de luxo, vídeo do ensaio',
          valor_deslocamento: 'gratuito até 30 km do centro de Curitiba, excedente R$1,50/km'
        }
      ];
      
      // Criar os serviços no banco de dados
      console.log('Inserindo serviços no banco de dados...');
      
      for (const servico of servicos) {
        await prisma.servico.create({
          data: servico
        });
        console.log(`Serviço "${servico.nome}" adicionado com sucesso!`);
      }
      
      console.log(`${servicos.length} serviços básicos adicionados ao banco de dados com sucesso!`);
    } else {
      console.log(`Banco de dados já possui ${servicosExistentes} serviços. Pulando inicialização.`);
    }
    
    // Verificar novamente após a operação
    const servicosAposOperacao = await prisma.servico.count();
    console.log(`Total de serviços no banco de dados após a operação: ${servicosAposOperacao}`);
    
    // Listar os serviços para verificação
    const listaServicos = await prisma.servico.findMany({
      select: {
        id: true,
        nome: true,
        preco_base: true
      }
    });
    
    console.log('Lista de serviços no banco de dados:');
    console.table(listaServicos);
    
  } catch (error) {
    console.error("Erro ao inicializar serviços:", error);
  } finally {
    // Fechar a conexão com o banco de dados
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados fechada.');
  }
}

// Executar a função principal
popularBancoDados()
  .then(() => {
    console.log('Script de população do banco de dados concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar script de população do banco de dados:', error);
    process.exit(1);
  });
