/**
 * Script para corrigir serviços no banco de dados
 * @version 1.0.0 - 2025-03-13
 * @description Corrige inconsistências entre o banco de dados e os dados de demonstração
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Definição correta dos serviços
const servicosCorretos = [
  {
    id: 1,
    nome: 'Ensaio Fotográfico Pessoal',
    descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Inclui direção de poses, correção básica de cor e entrega digital em alta resolução.',
    preco_base: 350.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '7 dias úteis',
    entregaveis: '20 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 2,
    nome: 'Ensaio Externo de Casal ou Família',
    descricao: 'Sessão fotográfica em ambiente externo para casais ou famílias, com foco em momentos naturais e espontâneos. Inclui direção de poses e edição básica.',
    preco_base: 450.00,
    duracao_media_captura: '2 a 4 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: '30 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 3,
    nome: 'Cobertura Fotográfica de Evento Social',
    descricao: 'Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Inclui edição básica e entrega digital.',
    preco_base: 800.00,
    duracao_media_captura: '4 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: '40 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 4,
    nome: 'Filmagem de Evento Social (Solo)',
    descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
    preco_base: 1200.00,
    duracao_media_captura: '4 horas',
    duracao_media_tratamento: '15 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
    possiveis_adicionais: 'Edição Avançada, Versão Estendida',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 5,
    nome: 'Fotografia Aérea com Drone',
    descricao: 'Captação de imagens aéreas para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
    preco_base: 700.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '7 dias úteis',
    entregaveis: '15 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Avançada, Impressão em Grande Formato',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 6,
    nome: 'Filmagem Aérea com Drone',
    descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
    preco_base: 900.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
    possiveis_adicionais: 'Edição Avançada, Versão Estendida',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    id: 7,
    nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
    descricao: 'Documentação em vídeo e foto da sua viagem em família, com edição profissional e entrega em formato de vlog para compartilhamento nas redes sociais.',
    preco_base: 1500.00,
    duracao_media_captura: '1 dia (8 horas)',
    duracao_media_tratamento: '15 dias úteis',
    entregaveis: 'Vlog de 5-7 minutos + 30 fotos editadas',
    possiveis_adicionais: 'Dia adicional de captação, Versão Estendida',
    valor_deslocamento: 'Incluído para Curitiba e Região Metropolitana (outros destinos sob consulta)'
  },
  {
    id: 8,
    nome: 'Pacote VLOG Friends & Community',
    descricao: 'Documentação em vídeo e foto de eventos com amigos ou comunidade, com edição profissional e entrega em formato de vlog para compartilhamento nas redes sociais.',
    preco_base: 1800.00,
    duracao_media_captura: '1 dia (8 horas)',
    duracao_media_tratamento: '15 dias úteis',
    entregaveis: 'Vlog de 7-10 minutos + 40 fotos editadas',
    possiveis_adicionais: 'Dia adicional de captação, Versão Estendida',
    valor_deslocamento: 'Incluído para Curitiba e Região Metropolitana (outros destinos sob consulta)'
  }
];

async function main() {
  try {
    console.log('🔄 Iniciando processo de correção de serviços...');
    
    // Verificar conexão com o banco de dados
    console.log('🔍 Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco de dados estabelecida.');
    
    // Consultar todos os serviços
    console.log('📋 Consultando serviços no banco de dados...');
    const servicosBanco = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Total de serviços encontrados: ${servicosBanco.length}`);
    
    // Remover todos os serviços existentes
    console.log('🧹 Removendo todos os serviços existentes...');
    await prisma.servico.deleteMany({});
    console.log('✅ Todos os serviços foram removidos.');
    
    // Inserir serviços corretos
    console.log('📝 Inserindo serviços corretos...');
    for (const servico of servicosCorretos) {
      await prisma.servico.create({
        data: servico
      });
      console.log(`   ✅ Serviço "${servico.nome}" criado com sucesso.`);
    }
    
    // Consultar serviços após a correção
    const servicosAtualizados = await prisma.servico.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Total de serviços após correção: ${servicosAtualizados.length}`);
    console.log('📋 Lista de serviços atual:');
    servicosAtualizados.forEach(servico => {
      console.log(`   ID ${servico.id}: ${servico.nome} - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    console.log('✅ Processo de correção concluído com sucesso!');
    console.log('⚠️ Para aplicar as alterações, reinicie o servidor de desenvolvimento.');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
