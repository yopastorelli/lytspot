/**
 * Dados de demonstração para o simulador de preços
 * @description Este arquivo contém dados de demonstração para o simulador de preços
 * @version 1.3.0 - 2025-03-15 - Atualizado catálogo de serviços para corresponder aos nomes originais
 */

export const servicos = [
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
];

export const opcoesAdicionais = [
  {
    id: 1,
    nome: 'Horas Adicionais',
    descricao: 'Adicione mais horas de cobertura ao seu evento',
    preco_adicional: 150.00
  },
  {
    id: 2,
    nome: 'Dia adicional',
    descricao: 'Adicione um dia extra para sua cobertura',
    preco_adicional: 600.00
  },
  {
    id: 3,
    nome: 'Versão Estendida',
    descricao: 'Versão mais longa do vídeo final (até 30 minutos)',
    preco_adicional: 300.00
  },
  {
    id: 4,
    nome: 'Versão para Redes Sociais',
    descricao: 'Versões curtas otimizadas para Instagram, TikTok e outras redes',
    preco_adicional: 250.00
  },
  {
    id: 5,
    nome: 'Edição Avançada',
    descricao: 'Edição premium com efeitos especiais, correção de cor avançada e animações',
    preco_adicional: 400.00
  },
  {
    id: 6,
    nome: 'Arquivos Originais',
    descricao: 'Todos os arquivos brutos da sessão em alta resolução',
    preco_adicional: 200.00
  },
  {
    id: 7,
    nome: 'Vídeo Slideshow',
    descricao: 'Apresentação de slides das melhores fotos com música',
    preco_adicional: 150.00
  },
  {
    id: 8,
    nome: 'Pendrive personalizado',
    descricao: 'Entrega em pendrive personalizado com caixa',
    preco_adicional: 100.00
  },
  {
    id: 9,
    nome: 'Álbum Impresso',
    descricao: 'Álbum fotográfico impresso de alta qualidade (20x30cm, 20 páginas)',
    preco_adicional: 350.00
  },
  {
    id: 10,
    nome: 'Drone',
    descricao: 'Adição de filmagem aérea com drone',
    preco_adicional: 300.00
  }
];

export const opcoesDeslocamento = [
  {
    id: 1,
    nome: 'Região Central de Curitiba',
    descricao: 'Até 10km do centro',
    preco_adicional: 0
  },
  {
    id: 2,
    nome: 'Região Metropolitana de Curitiba',
    descricao: 'Entre 10km e 30km do centro',
    preco_adicional: 50.00
  },
  {
    id: 3,
    nome: 'Litoral do Paraná',
    descricao: 'Matinhos, Guaratuba, Pontal do Paraná',
    preco_adicional: 250.00
  },
  {
    id: 4,
    nome: 'Outras regiões',
    descricao: 'Consulte disponibilidade e valores',
    preco_adicional: 0,
    sob_consulta: true
  }
];

/**
 * @deprecated Mantido para compatibilidade retroativa. Use 'servicos' em novos componentes.
 * @version 1.2.0 - 2025-03-15
 */
export const dadosDemonstracao = servicos;

export default servicos;
