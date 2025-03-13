/**
 * Script para fazer deploy dos serviços para o ambiente de produção
 * @version 1.0.0 - 2025-03-12
 * @description Atualiza os dados de serviços no servidor de produção
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(rootDir, '.env') });

// Serviços atualizados conforme solicitado
const servicosAtualizados = [
  {
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
    nome: 'Filmagem de Evento Social (Solo)',
    descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
    preco_base: 1200.00,
    duracao_media_captura: '4 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    nome: 'Fotografia Aérea com Drone',
    descricao: 'Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.',
    preco_base: 700.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '7 dias úteis',
    entregaveis: '15 fotos em alta resolução com edição básica',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)'
  },
  {
    nome: 'Filmagem Aérea com Drone',
    descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
    preco_base: 900.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)'
  },
  {
    nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
    descricao: 'Documentação em vídeo e foto da sua viagem em família, com edição profissional e entrega em formato digital.',
    preco_base: 1500.00,
    duracao_media_captura: '4 a 6 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos + 30 fotos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Sob consulta (depende da localização)'
  },
  {
    nome: 'Pacote VLOG Friends & Community',
    descricao: 'Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.',
    preco_base: 1800.00,
    duracao_media_captura: '6 a 8 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 5-7 minutos + 40 fotos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Sob consulta (depende da localização)'
  }
];

/**
 * Faz login na API e obtém um token de autenticação
 * @param {string} apiUrl URL base da API
 * @returns {Promise<string>} Token de autenticação
 */
async function obterToken(apiUrl) {
  try {
    console.log(`🔐 Autenticando na API: ${apiUrl}/auth/login`);
    
    const response = await axios.post(`${apiUrl}/auth/login`, {
      email: 'admin@lytspot.com.br',
      password: 'admin123'
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Autenticação bem-sucedida!');
      return response.data.token;
    } else {
      throw new Error('Token não encontrado na resposta');
    }
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

/**
 * Atualiza os serviços na API remota
 * @param {string} apiUrl URL base da API
 * @param {string} token Token de autenticação
 * @returns {Promise<void>}
 */
async function atualizarServicosRemotamente(apiUrl, token) {
  try {
    console.log('🔄 Iniciando atualização dos serviços remotamente...');
    
    // 1. Primeiro, excluir todos os serviços existentes
    console.log('🗑️ Excluindo serviços existentes...');
    
    // 1.1 Obter lista de serviços existentes
    const listaResponse = await axios.get(`${apiUrl}/pricing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const servicosExistentes = listaResponse.data;
    console.log(`📊 Encontrados ${servicosExistentes.length} serviços existentes.`);
    
    // 1.2 Excluir cada serviço
    for (const servico of servicosExistentes) {
      console.log(`🗑️ Excluindo serviço ID ${servico.id}: ${servico.nome}`);
      await axios.delete(`${apiUrl}/pricing/${servico.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    console.log('✅ Todos os serviços existentes foram excluídos.');
    
    // 2. Criar os novos serviços
    console.log('🆕 Criando novos serviços...');
    
    for (const servico of servicosAtualizados) {
      console.log(`➕ Criando serviço: ${servico.nome}`);
      await axios.post(`${apiUrl}/pricing`, servico, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    console.log('✅ Todos os novos serviços foram criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar serviços remotamente:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

/**
 * Função principal que executa o deploy dos serviços
 */
async function main() {
  try {
    console.log('🚀 Iniciando deploy dos serviços para produção...');
    
    // Definir a URL da API
    const apiUrl = process.env.PRODUCTION_API_URL || 'https://lytspot.onrender.com/api';
    console.log(`📡 API URL: ${apiUrl}`);
    
    // Obter token de autenticação
    const token = await obterToken(apiUrl);
    
    // Atualizar serviços remotamente
    await atualizarServicosRemotamente(apiUrl, token);
    
    console.log('✨ Deploy concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o deploy:', error.message);
    process.exit(1);
  }
}

// Executar a função principal
main();
