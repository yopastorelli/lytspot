/**
 * Dados de demonstração para o simulador de preços
 * @version 2.0.0 - 2025-03-12 - Atualização dos serviços oferecidos
 * @description Dados de fallback usados quando a API não está disponível
 */

export const dadosDemonstracao = [
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
    descricao: "Sessão fotográfica externa para casais e famílias, com momentos espontâneos e dirigidos, correção básica e entrega digital em alta resolução.",
    preco_base: 350.00,
    duracao_media: 4,
    detalhes: {
      captura: "2 a 4 horas",
      tratamento: "10 dias úteis",
      entregaveis: "30 fotos com correção básica (em alta resolução)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    id: 3,
    nome: "Cobertura Fotográfica de Evento Social",
    descricao: "Cobertura profissional de fotos em eventos (aniversários, batizados, corporativos, etc.), com 4 horas de captura, correção básica e entrega digital em alta resolução.",
    preco_base: 600.00,
    duracao_media: 7,
    detalhes: {
      captura: "4 horas",
      tratamento: "10 dias úteis",
      entregaveis: "40 fotos com correção básica (em alta resolução)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    id: 4,
    nome: "Filmagem de Evento Social (Solo)",
    descricao: "Filmagem profissional para eventos sociais ou corporativos, com 4 horas de captura. Entrega dos arquivos colorizados e organizados (sem edição completa).",
    preco_base: 1000.00,
    duracao_media: 7,
    detalhes: {
      captura: "4 horas",
      tratamento: "10 dias úteis",
      entregaveis: "Arquivos de vídeo brutos (já colorizados e cortados, porém sem montagem final)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    id: 5,
    nome: "Fotografia Aérea com Drone",
    descricao: "Captação de imagens aéreas profissionais para imóveis, paisagens ou eventos, com correção básica aplicada.",
    preco_base: 400.00,
    duracao_media: 5,
    detalhes: {
      captura: "2 horas",
      tratamento: "7 dias úteis",
      entregaveis: "15 fotos aéreas com correção básica (em alta resolução)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    id: 6,
    nome: "Filmagem Aérea com Drone",
    descricao: "Filmagens aéreas para eventos, vídeos institucionais ou publicidade, com 2 horas de captura e entrega dos arquivos brutos colorizados (sem edição final).",
    preco_base: 600.00,
    duracao_media: 5,
    detalhes: {
      captura: "2 horas",
      tratamento: "7 dias úteis",
      entregaveis: "Arquivos de vídeo bruto (colorizados e cortados)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)"
    }
  },
  {
    id: 7,
    nome: "Pacote VLOG Family (Ilha do Mel ou Outros Lugares)",
    descricao: "Produção personalizada de vlog familiar em destinos especiais, com cobertura fotográfica e de vídeo (8 a 12 horas de captura). Entrega de fotos e vídeos brutos organizados.",
    preco_base: 1000.00,
    duracao_media: 14,
    detalhes: {
      captura: "8 a 12 horas",
      tratamento: "14 dias úteis",
      entregaveis: "Arquivos de foto e vídeo em formato bruto (já com correção básica)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba, excedente de R$ 1,20/km + despesas adicionais"
    }
  },
  {
    id: 8,
    nome: "Pacote VLOG Friends & Community",
    descricao: "Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades (6 a 10 horas), perfeita para registrar viagens, encontros ou eventos colaborativos. Entrega de fotos e vídeos brutos organizados.",
    preco_base: 900.00,
    duracao_media: 10,
    detalhes: {
      captura: "6 a 10 horas",
      tratamento: "14 dias úteis",
      entregaveis: "Arquivos de foto e vídeo em formato bruto (já com correção básica)",
      adicionais: "Edição Mediana, Edição Avançada",
      deslocamento: "Gratuito até 20 km do centro de Curitiba, excedente de R$ 1,20/km + despesas adicionais"
    }
  }
];

export default dadosDemonstracao;
