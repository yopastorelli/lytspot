/**
 * Definições atualizadas de serviços para atualização em produção
 * @version 1.1.0 - 2025-03-14
 */

export const updatedServiceDefinitions = [
  {
    nome: 'VLOG - Aventuras em Família',
    descricao: 'Documentação em vídeo e foto da sua viagem em família. Um dia na praia, no campo, na montanha ou em pontos turísticos nos arredores da Grande Curitiba.',
    preco_base: 1500.00,
    duracao_media_captura: '6 a 8 horas',
    duracao_media_tratamento: 'até 30 dias',
    entregaveis: 'Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
    valor_deslocamento: 'Sob consulta, dependendo da localidade'
  },
  {
    nome: 'VLOG - Amigos e Comunidade',
    descricao: 'Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.',
    preco_base: 900.00,
    duracao_media_captura: '3 a 4 horas',
    duracao_media_tratamento: 'até 15 dias',
    entregaveis: 'Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais, Dia adicional, Versão Estendida, Versão para Redes Sociais, Edição Avançada, Arquivos Originais',
    valor_deslocamento: 'Sob consulta, dependendo da localidade'
  },
  {
    nome: 'Cobertura Fotográfica de Evento Social',
    descricao: 'Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Fotos espontâneas (estilo fotojornalismo documental) e fotos posadas de grupos e individuais.',
    preco_base: 700.00,
    duracao_media_captura: '3 a 4 horas',
    duracao_media_tratamento: 'até 10 dias',
    entregaveis: '250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
  },
  {
    nome: 'Filmagem de Evento Social',
    descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
    preco_base: 800.00,
    duracao_media_captura: '3 a 4 horas',
    duracao_media_tratamento: 'até 20 dias',
    entregaveis: 'Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais, Versão Estendida, Versão para Redes Sociais, Drone',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
  },
  {
    nome: 'Ensaio Fotográfico de Família',
    descricao: 'Sessão fotográfica em ambiente externo para famílias. Foco em momentos espontâneos e com luz natural. Inclui direção de poses de fotos em grupo ou individuais.',
    preco_base: 450.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: 'até 10 dias',
    entregaveis: '70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais ou Redução de horas, Vídeo Slideshow, Pendrive personalizado, Álbum Impresso',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
  },
  {
    nome: 'Fotografia e Filmagem Aérea',
    descricao: 'Registro profissional de imagens e vídeos aéreos para eventos, imóveis, arquitetura e paisagens.',
    preco_base: 750.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: 'até 10 dias',
    entregaveis: '30 fotos em alta resolução + Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo.',
    possiveis_adicionais: 'Horas Adicionais, Edição Avançada, Versão Estendida',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba, excedente R$1,50/km'
  }
];

/**
 * Retorna as definições atualizadas de serviços
 * @returns {Array} Lista de serviços atualizados
 */
export function getUpdatedServiceDefinitions() {
  return updatedServiceDefinitions;
}
