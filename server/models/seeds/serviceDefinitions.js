/**
 * Definições centralizadas de serviços para o Lytspot
 * @description Este arquivo serve como a fonte única de verdade (Single Source of Truth) para todos os serviços
 * @version 1.0.0 - 2025-03-12
 * 
 * IMPORTANTE: NÃO MODIFIQUE ESTE ARQUIVO DIRETAMENTE
 * Para atualizar os serviços, utilize o painel administrativo ou os scripts de atualização
 */

/**
 * Definições de serviços para o banco de dados
 * Formato compatível com o modelo Prisma
 */
export const serviceDefinitions = [
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
 * Transforma as definições de serviços para o formato do frontend
 * @returns {Array} Array de serviços no formato do frontend
 */
export function getServiceDefinitionsForFrontend() {
  return serviceDefinitions.map((servico, index) => {
    // Calcula a duração média aproximada baseada nos campos individuais
    const duracaoCaptura = parseInt(servico.duracao_media_captura?.split(' ')[0] || 0);
    const duracaoTratamento = parseInt(servico.duracao_media_tratamento?.split(' ')[0] || 0);
    const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
    
    return {
      id: index + 1, // Simula IDs sequenciais
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
}

export default serviceDefinitions;
