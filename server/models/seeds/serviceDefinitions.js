/**
 * Definições centralizadas de serviços para o Lytspot
 * @description Este arquivo serve como a fonte única de verdade (Single Source of Truth) para todos os serviços
 * @version 1.2.0 - 2025-03-15 - Atualizado nomes dos serviços para corresponder ao frontend
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
    "nome": "VLOG - Aventuras em Família",
    "descricao": "Documentação em vídeo e foto da sua viagem em família. Um dia na praia, no campo, na montanha ou em pontos turísticos nos arredores da Grande Curitiba.",
    "preco_base": 1500,
    "duracao_media_captura": "6 a 8 horas",
    "duracao_media_tratamento": "até 30 dias",
    "entregaveis": "Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais",
    "valor_deslocamento": "Sob consulta, dependendo da localidade",
    "detalhes": {
      "captura": "6 a 8 horas",
      "tratamento": "até 30 dias",
      "entregaveis": "Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais",
      "deslocamento": "Sob consulta, dependendo da localidade"
    }
  },
  {
    "nome": "VLOG - Amigos e Comunidade",
    "descricao": "Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.",
    "preco_base": 900,
    "duracao_media_captura": "3 a 4 horas",
    "duracao_media_tratamento": "até 15 dias",
    "entregaveis": "Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais",
    "valor_deslocamento": "Sob consulta, dependendo da localidade",
    "detalhes": {
      "captura": "3 a 4 horas",
      "tratamento": "até 15 dias",
      "entregaveis": "Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais",
      "deslocamento": "Sob consulta, dependendo da localidade"
    }
  },
  {
    "nome": "Cobertura Fotográfica de Evento Social",
    "descricao": "Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Fotos espontâneas (estilo fotojornalismo documental) e fotos posadas de grupos e individuais.",
    "preco_base": 700,
    "duracao_media_captura": "3 a 4 horas",
    "duracao_media_tratamento": "até 10 dias",
    "entregaveis": "250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso",
    "valor_deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km",
    "detalhes": {
      "captura": "3 a 4 horas",
      "tratamento": "até 10 dias",
      "entregaveis": "250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso",
      "deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    "nome": "Filmagem de Evento Social",
    "descricao": "Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.",
    "preco_base": 800,
    "duracao_media_captura": "3 a 4 horas",
    "duracao_media_tratamento": "até 20 dias",
    "entregaveis": "Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone",
    "valor_deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km",
    "detalhes": {
      "captura": "3 a 4 horas",
      "tratamento": "até 20 dias",
      "entregaveis": "Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone",
      "deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    "nome": "Ensaio Fotográfico de Família",
    "descricao": "Sessão fotográfica em ambiente externo para famílias. Foco em momentos espontâneos e com luz natural. Inclui direção de poses de fotos em grupo ou individuais.",
    "preco_base": 450,
    "duracao_media_captura": "1 a 2 horas",
    "duracao_media_tratamento": "até 10 dias",
    "entregaveis": "70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso",
    "valor_deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km",
    "detalhes": {
      "captura": "1 a 2 horas",
      "tratamento": "até 10 dias",
      "entregaveis": "70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso",
      "deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km"
    }
  },
  {
    "nome": "Fotografia e Filmagem Aérea",
    "descricao": "Registro profissional de imagens e vídeos aéreos para eventos, imóveis, arquitetura e paisagens.",
    "preco_base": 750,
    "duracao_media_captura": "1 a 2 horas",
    "duracao_media_tratamento": "até 10 dias",
    "entregaveis": "30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
    "possiveis_adicionais": "Horas Adicionais, Edição Avançada, Versão Estendida",
    "valor_deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km",
    "detalhes": {
      "captura": "1 a 2 horas",
      "tratamento": "até 10 dias",
      "entregaveis": "30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.",
      "adicionais": "Horas Adicionais, Edição Avançada, Versão Estendida",
      "deslocamento": "Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km"
    }
  }
];

// Armazenar os dados de demonstração em memória para permitir atualizações simuladas
let demonstrationData = null;

/**
 * Definições de serviços para o frontend
 * @version 1.2.0 - 2025-03-15 - Atualizado catálogo de serviços
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
      nome: 'VLOG - Aventuras em Família',
      descricao: 'Documentação em vídeo e foto da sua viagem em família. Um dia na praia, no campo, na montanha ou em pontos turísticos nos arredores da Grande Curitiba.',
      preco_base: 1500.00,
      duracao_media: 14,
      detalhes: {
        captura: '6 a 8 horas',
        tratamento: 'até 30 dias',
        entregaveis: 'Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
        deslocamento: 'Sob consulta, dependendo da localidade'
      },
      duracao_media_captura: '6 a 8 horas',
      duracao_media_tratamento: 'até 30 dias',
      entregaveis: 'Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
      valor_deslocamento: 'Sob consulta, dependendo da localidade'
    },
    {
      id: 2,
      nome: 'VLOG - Amigos e Comunidade',
      descricao: 'Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.',
      preco_base: 900.00,
      duracao_media: 8,
      detalhes: {
        captura: '3 a 4 horas',
        tratamento: 'até 15 dias',
        entregaveis: 'Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
        deslocamento: 'Sob consulta, dependendo da localidade'
      },
      duracao_media_captura: '3 a 4 horas',
      duracao_media_tratamento: 'até 15 dias',
      entregaveis: 'Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
      valor_deslocamento: 'Sob consulta, dependendo da localidade'
    },
    {
      id: 3,
      nome: 'Cobertura Fotográfica de Evento Social',
      descricao: 'Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Fotos espontâneas (estilo fotojornalismo documental) e fotos posadas de grupos e individuais.',
      preco_base: 700.00,
      duracao_media: 7,
      detalhes: {
        captura: '3 a 4 horas',
        tratamento: 'até 10 dias',
        entregaveis: '250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
        deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      duracao_media_captura: '3 a 4 horas',
      duracao_media_tratamento: 'até 10 dias',
      entregaveis: '250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
      valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
    },
    {
      id: 4,
      nome: 'Filmagem de Evento Social',
      descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
      preco_base: 800.00,
      duracao_media: 9,
      detalhes: {
        captura: '3 a 4 horas',
        tratamento: 'até 20 dias',
        entregaveis: 'Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone',
        deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      duracao_media_captura: '3 a 4 horas',
      duracao_media_tratamento: 'até 20 dias',
      entregaveis: 'Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone',
      valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
    },
    {
      id: 5,
      nome: 'Ensaio Fotográfico de Família',
      descricao: 'Sessão fotográfica em ambiente externo para famílias. Foco em momentos espontâneos e com luz natural. Inclui direção de poses de fotos em grupo ou individuais.',
      preco_base: 450.00,
      duracao_media: 5,
      detalhes: {
        captura: '1 a 2 horas',
        tratamento: 'até 10 dias',
        entregaveis: '70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
        deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      duracao_media_captura: '1 a 2 horas',
      duracao_media_tratamento: 'até 10 dias',
      entregaveis: '70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
      valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
    },
    {
      id: 6,
      nome: 'Fotografia e Filmagem Aérea',
      descricao: 'Registro profissional de imagens e vídeos aéreos para eventos, imóveis, arquitetura e paisagens.',
      preco_base: 750.00,
      duracao_media: 5,
      detalhes: {
        captura: '1 a 2 horas',
        tratamento: 'até 10 dias',
        entregaveis: '30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
        adicionais: 'Horas Adicionais, Edição Avançada, Versão Estendida',
        deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
      },
      duracao_media_captura: '1 a 2 horas',
      duracao_media_tratamento: 'até 10 dias',
      entregaveis: '30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
      possiveis_adicionais: 'Horas Adicionais, Edição Avançada, Versão Estendida',
      valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
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
