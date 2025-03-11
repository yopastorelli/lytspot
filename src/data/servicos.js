/**
 * Dados de serviços para o Simulador de Preços - Versão 2.0
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: 11/03/2025
 */

export const servicos = [
  {
    id: 1,
    nome: "Ensaio Fotográfico Pessoal",
    descricao: "Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Direção de poses, edição profissional básica e entrega digital em alta resolução.",
    preco_base: 300.00,
    duracao_media: 3,
    detalhes: {
      captura: "2 a 3 horas",
      tratamento: "até 7 dias úteis",
      entregaveis: "20 fotos editadas em alta resolução",
      adicionais: "Maquiagem e cabelo, troca adicional de figurino, cenário especializado",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 2,
    nome: "Ensaio Externo de Casal ou Família",
    descricao: "Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com tratamento profissional.",
    preco_base: 500.00,
    duracao_media: 4,
    detalhes: {
      captura: "2 a 4 horas",
      tratamento: "até 10 dias úteis",
      entregaveis: "30 fotos editadas em alta resolução",
      adicionais: "participantes adicionais, maquiagem e produção de figurino, sessão na 'Golden Hour'",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 3,
    nome: "Cobertura Fotográfica de Evento Social",
    descricao: "Cobertura profissional de fotos em eventos como aniversários, batizados e eventos corporativos.",
    preco_base: 1000.00,
    duracao_media: 4,
    detalhes: {
      captura: "4 horas",
      tratamento: "até 10 dias úteis",
      entregaveis: "40 fotos editadas em alta resolução",
      adicionais: "horas extras, álbum físico ou fotolivro, segundo fotógrafo",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 4,
    nome: "Filmagem de Evento Social (Solo)",
    descricao: "Filmagem profissional para eventos sociais e corporativos, com edição dinâmica e trilha sonora.",
    preco_base: 1500.00,
    duracao_media: 4,
    detalhes: {
      captura: "4 horas",
      tratamento: "até 15 dias úteis",
      entregaveis: "vídeo editado de 3 a 5 minutos",
      adicionais: "horas extras, depoimentos, vídeo bruto",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 5,
    nome: "Fotografia Aérea com Drone",
    descricao: "Imagens aéreas profissionais para imóveis, paisagens ou eventos.",
    preco_base: 600.00,
    duracao_media: 2,
    detalhes: {
      captura: "2 horas",
      tratamento: "até 7 dias úteis",
      entregaveis: "15 fotos aéreas editadas",
      adicionais: "autorizações especiais, pós-produção avançada",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 6,
    nome: "Filmagem Aérea com Drone",
    descricao: "Filmagens aéreas para eventos, vídeos institucionais ou publicidade, com edição profissional.",
    preco_base: 800.00,
    duracao_media: 2,
    detalhes: {
      captura: "2 horas",
      tratamento: "até 12 dias úteis",
      entregaveis: "vídeo editado de 1 a 3 minutos",
      adicionais: "autorizações especiais, legendas e logotipos, integração com filmagens em solo",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    id: 7,
    nome: "Pacote VLOG Family (Ilha do Mel ou Outros Lugares)",
    descricao: "Produção personalizada de vlog familiar em destinos especiais com fotos e vídeos editados.",
    preco_base: 1600.00,
    duracao_media: 10,
    detalhes: {
      captura: "8 a 12 horas",
      tratamento: "até 20 dias úteis",
      entregaveis: "vídeo principal (10 min), teaser (1 a 3 min), fotos editadas",
      adicionais: "edição adicional, cobertura complementar, dias extras",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente"
    }
  },
  {
    id: 8,
    nome: "Pacote VLOG Friends & Community",
    descricao: "Pacote exclusivo para grupos de amigos ou comunidades, perfeito para registrar viagens, encontros ou eventos colaborativos com fotos e vídeos profissionais.",
    preco_base: 1400.00,
    duracao_media: 8,
    detalhes: {
      captura: "6 a 10 horas",
      tratamento: "até 14 dias úteis",
      entregaveis: "vídeo principal (7 a 10 min), teaser (até 2 min), 30 fotos editadas",
      adicionais: "dias adicionais, filmagens aéreas, edição especial para redes sociais",
      deslocamento: "gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente"
    }
  }
];
