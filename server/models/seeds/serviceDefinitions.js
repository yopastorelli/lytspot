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
    nome: 'Pacote VLOG Friends & Community',
    descricao: 'Documentação em vídeo e foto de eventos com amigos ou comunidade, com edição profissional e entrega em formato de vlog para compartilhamento nas redes sociais.',
    preco_base: 1800.00,
    duracao_media_captura: '1 dia (8 horas)',
    duracao_media_tratamento: '15 dias úteis',
    entregaveis: 'Vlog de 7-10 minutos + 40 fotos editadas',
    possiveis_adicionais: 'Dia adicional de captação, Versão Estendida',
    valor_deslocamento: 'Incluído para Curitiba e Região Metropolitana (outros destinos sob consulta)'
  },
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
    duracao_media_tratamento: '15 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
    possiveis_adicionais: 'Edição Avançada, Versão Estendida',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
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
    nome: 'Filmagem Aérea com Drone',
    descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
    preco_base: 900.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
    possiveis_adicionais: 'Edição Avançada, Versão Estendida',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  }
];

// Armazenar os dados de demonstração em memória para permitir atualizações simuladas
let demonstrationData = null;

/**
 * Definições de serviços para o frontend
 * @version 1.1.0 - 2025-03-12
 */

/**
 * Retorna as definições de serviços para o frontend
 * @returns {Array} Array de serviços
 */
export const getServiceDefinitionsForFrontend = () => {
  if (demonstrationData) {
    return demonstrationData;
  }

  demonstrationData = [
    {
      id: 1,
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
      id: 2,
      nome: 'Pacote VLOG Friends & Community',
      descricao: 'Documentação em vídeo e foto de eventos com amigos ou comunidade, com edição profissional e entrega em formato de vlog para compartilhamento nas redes sociais.',
      preco_base: 1800.00,
      duracao_media_captura: '1 dia (8 horas)',
      duracao_media_tratamento: '15 dias úteis',
      entregaveis: 'Vlog de 7-10 minutos + 40 fotos editadas',
      possiveis_adicionais: 'Dia adicional de captação, Versão Estendida',
      valor_deslocamento: 'Incluído para Curitiba e Região Metropolitana (outros destinos sob consulta)'
    },
    {
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
      nome: 'Filmagem Aérea com Drone',
      descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
      preco_base: 900.00,
      duracao_media_captura: '1 a 2 horas',
      duracao_media_tratamento: '10 dias úteis',
      entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
      possiveis_adicionais: 'Edição Avançada, Versão Estendida',
      valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
    }
  ];

  return demonstrationData;
};

/**
 * Definições de serviços para o sistema
 * 
 * Este módulo contém as definições padrão de serviços utilizadas como dados de demonstração
 * e para inicialização do banco de dados.
 * 
 * @version 1.4.0 - 2025-03-13 - Melhorada a função de atualização de serviços para maior compatibilidade
 * @module models/seeds/serviceDefinitions
 */

/**
 * Atualiza um serviço nos dados de demonstração
 * 
 * Esta função permite atualizar um serviço nos dados de demonstração, mantendo
 * a consistência entre os dados de demonstração e os dados originais.
 * 
 * @version 1.3.0 - 2025-03-13 - Suporte para receber um objeto de serviço completo
 * @param {number|string|Object} idOrService ID do serviço ou objeto de serviço completo
 * @param {Object} [data] Novos dados do serviço (opcional se o primeiro parâmetro for um objeto)
 * @returns {Object|null} Serviço atualizado ou null se não encontrado
 */
export const updateDemonstrationService = (idOrService, data = null) => {
  // Determinar se o primeiro parâmetro é um ID ou um objeto de serviço completo
  let id;
  let updateData;
  
  if (typeof idOrService === 'object' && idOrService !== null) {
    // Primeiro parâmetro é um objeto de serviço completo
    id = idOrService.id;
    updateData = idOrService;
    console.log('updateDemonstrationService - Recebido objeto de serviço completo com ID:', id);
  } else {
    // Primeiro parâmetro é um ID, segundo parâmetro são os dados
    id = idOrService;
    updateData = data;
    console.log('updateDemonstrationService - Iniciando atualização do serviço de demonstração:', id);
    console.log('updateDemonstrationService - Dados recebidos:', updateData);
  }
  
  // Garantir que os dados de demonstração estão inicializados
  if (!demonstrationData) {
    console.log('updateDemonstrationService - Inicializando dados de demonstração');
    getServiceDefinitionsForFrontend();
  }
  
  // Converter o ID para número para garantir comparação correta
  const numericId = parseInt(id);
  console.log('updateDemonstrationService - ID convertido para número:', numericId);
  
  // Encontrar o índice do serviço
  const index = demonstrationData.findIndex(service => service.id === numericId);
  console.log('updateDemonstrationService - Índice encontrado:', index);
  
  if (index === -1) {
    console.log('updateDemonstrationService - Serviço não encontrado com ID:', numericId);
    console.log('updateDemonstrationService - Serviços disponíveis:', demonstrationData.map(s => s.id));
    return null;
  }
  
  // Fazer uma cópia profunda do objeto para evitar referências indesejadas
  const originalService = JSON.parse(JSON.stringify(demonstrationData[index]));
  
  // Sanitizar os dados para garantir consistência
  const sanitizedData = { ...updateData };
  if (sanitizedData.preco_base !== undefined) {
    sanitizedData.preco_base = typeof sanitizedData.preco_base === 'string' 
      ? parseFloat(sanitizedData.preco_base) 
      : sanitizedData.preco_base;
  }
  
  // Atualizar o serviço preservando o ID original
  demonstrationData[index] = {
    ...originalService,
    ...sanitizedData,
    id: numericId // Garantir que o ID não seja alterado
  };
  
  console.log('updateDemonstrationService - Serviço atualizado:', demonstrationData[index]);
  
  // Atualizar também os dados originais para manter consistência
  const originalIndex = serviceDefinitions.findIndex(service => service.id === numericId);
  if (originalIndex !== -1) {
    console.log('updateDemonstrationService - Atualizando também os dados originais para consistência');
    serviceDefinitions[originalIndex] = {
      ...serviceDefinitions[originalIndex],
      ...sanitizedData,
      id: numericId
    };
  }
  
  return demonstrationData[index];
};

/**
 * Transforma as definições de serviços para o formato do frontend
 * @returns {Array} Array de serviços no formato do frontend
 */
export function getServiceDefinitionsForFrontendOriginal() {
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
